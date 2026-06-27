import numpy as np
from typing import Any, Dict, List, Optional
import json
from google import genai
from .config import Config
from .embedding import EmbeddingGenerator
from .scoring import ScoringEngine
from .utils import get_logger

logger = get_logger("RankingEngine")

class CandidateRankingEngine:
    """Manages indexing candidates in FAISS, calculating matches, and executing LLM re-ranking refinements."""

    def __init__(self, use_gemini_rerank: bool = True):
        self.embedder = EmbeddingGenerator()
        self.scoring_engine = ScoringEngine()
        self.use_gemini_rerank = use_gemini_rerank and bool(Config.GEMINI_API_KEY)
        self.index = None
        self.candidates: List[Dict[str, Any]] = []
        self.candidate_embeddings: Optional[np.ndarray] = None
        
        if self.use_gemini_rerank:
            try:
                self.gemini_client = genai.Client(api_key=Config.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Could not connect to Gemini API for reranking: {e}. Disabling Gemini Re-ranking.")
                self.use_gemini_rerank = False

    def load_candidates(self, candidates: List[Dict[str, Any]]) -> None:
        """Loads and prepares candidates for semantic indexing."""
        self.candidates = candidates
        logger.info(f"Loaded {len(candidates)} candidates into Ranking Engine.")
        
        # Build text description summaries to compute semantic embeddings
        descriptions = []
        for cand in candidates:
            # Create a rich text summary of the candidate's profile
            summary = (
                f"Candidate Name: {cand.get('name')}. "
                f"Domain Focus: {cand.get('domain', '')}. "
                f"Technical Skills: {', '.join(cand.get('technical_skills', []))}. "
                f"Highest Degree: {cand.get('education', {}).get('degree', '')} in {cand.get('education', {}).get('major', '')}. "
                f"Certifications: {', '.join(cand.get('certifications', []))}. "
                f"Summary: {', '.join([p.get('title', '') + ': ' + p.get('description', '') for p in cand.get('projects', [])])}."
            )
            descriptions.append(summary)

        # Generate embeddings
        logger.info("Generating dense embeddings for candidate dataset...")
        self.candidate_embeddings = self.embedder.get_embeddings(descriptions)
        
        # Build Index (FAISS or Fallback)
        self._build_vector_index()

    def _build_vector_index(self) -> None:
        """Initializes dense similarity indices."""
        if self.candidate_embeddings is None or len(self.candidate_embeddings) == 0:
            return

        try:
            import faiss
            dim = self.candidate_embeddings.shape[1]
            # flat Inner Product is equivalent to Cosine Similarity when vectors are L2 normalized
            self.index = faiss.IndexFlatIP(dim)
            # Normalize embeddings before indexing
            norms = np.linalg.norm(self.candidate_embeddings, axis=1, keepdims=True)
            # Avoid division by zero
            normalized_embeddings = np.where(norms > 0, self.candidate_embeddings / norms, 0.0).astype(np.float32)
            self.index.add(normalized_embeddings)
            logger.info("Successfully populated high-performance FAISS Vector Index.")
        except ImportError:
            logger.warning("FAISS library not installed. Falling back to native numpy similarity matching.")
            self.index = None
        except Exception as e:
            logger.error(f"Failed to build FAISS index: {e}. Falling back.")
            self.index = None

    def search_and_rank(self, jd: Dict[str, Any], top_n: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieves, scores, and ranks all candidates matching the Job Description.
        
        Args:
            jd (dict): Parsed Job Description criteria.
            top_n (int): Slice size.
            
        Returns:
            List[Dict[str, Any]]: Ranked candidates list with scores and rationales.
        """
        if not self.candidates:
            logger.warning("No candidates loaded in the ranking engine. Returning empty list.")
            return []

        # 1. Embed Job Description Requirements
        jd_summary = (
            f"Job requirements in {jd.get('domain', '')} department. "
            f"Mandatory Technical Skills: {', '.join(jd.get('technical_skills', []))}. "
            f"Responsibilities: {', '.join(jd.get('responsibilities', []))}."
        )
        jd_vector = self.embedder.get_embedding(jd_summary)
        
        # 2. Compute Semantic Similarities
        similarities = {}
        if self.index is not None:
            # FAISS Retrieval
            jd_vector_norm = jd_vector / (np.linalg.norm(jd_vector) + 1e-9)
            jd_query = np.expand_dims(jd_vector_norm, axis=0).astype(np.float32)
            scores, indices = self.index.search(jd_query, len(self.candidates))
            
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.candidates):
                    similarities[self.candidates[idx]["id"]] = float(score)
        else:
            # Native Cosine Similarity Fallback
            for i, cand in enumerate(self.candidates):
                sim = self.embedder.cosine_similarity(jd_vector, self.candidate_embeddings[i])
                similarities[cand["id"]] = sim

        # 3. Compute Composite Score for every candidate
        ranked_candidates = []
        for cand in self.candidates:
            cand_id = cand["id"]
            sem_sim = max(0.0, similarities.get(cand_id, 0.0))
            
            final_score, sub_scores, rationales = self.scoring_engine.score_candidate(cand, jd, sem_sim)
            
            # Create a clone of candidate containing scoring metadata
            ranked_cand = {
                **cand,
                "overall_score": final_score,
                "scoring_breakdown": sub_scores,
                "rationales": rationales,
                "re_ranked_by_llm": False
            }
            ranked_candidates.append(ranked_cand)

        # 4. Sort Candidates
        ranked_candidates.sort(key=lambda x: x["overall_score"], reverse=True)

        # 5. Apply Optional Cognitive Re-ranking using Gemini (top slice gets refined)
        if self.use_gemini_rerank and len(ranked_candidates) > 0:
            ranked_candidates = self._apply_gemini_reranking(ranked_candidates, jd, top_n)
            # Re-sort after Gemini refinement
            ranked_candidates.sort(key=lambda x: x["overall_score"], reverse=True)

        # Slice to desired output counts
        return ranked_candidates[:top_n]

    def _apply_gemini_reranking(self, base_rankings: List[Dict[str, Any]], jd: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Invokes Gemini LLM to critically re-evaluate and optimize candidate rankings."""
        # We re-rank the top 15 candidates to ensure optimal prompt efficiency and depth
        rerank_slice_size = min(15, len(base_rankings))
        top_candidates = base_rankings[:rerank_slice_size]
        remaining_candidates = base_rankings[rerank_slice_size:]

        logger.info(f"Sending top {rerank_slice_size} candidates to Gemini 3.5 Flash for cognitive re-ranking...")
        
        candidates_payload = []
        for c in top_candidates:
            candidates_payload.append({
                "id": c["id"],
                "name": c["name"],
                "skills": c["technical_skills"],
                "experience": c["years_of_experience"],
                "education": c["education"],
                "current_score": c["overall_score"]
            })

        prompt = f"""
        You are a highly experienced Principal Recruiter. Re-evaluate the suitability of candidates for the following role:
        
        Job Requirements:
        - Domain: {jd.get('domain')}
        - Target Seniority: {jd.get('seniority')}
        - Experience Years Needed: {jd.get('min_experience_years')}
        - Required Skills: {', '.join(jd.get('technical_skills', []))}
        - Responsibilities: {', '.join(jd.get('responsibilities', []))}

        Candidate Profiles:
        {json.dumps(candidates_payload, indent=2)}

        Tasks:
        1. Critically analyze project relevance, tech skills depth, and seniority matching.
        2. Adjust their scores slightly (add/subtract up to 0.08) based on nuanced project matching, cognitive depth, and suitability.
        3. Output a list of re-ranked profiles.
        4. Provide an 'llm_insight' rationale explaining your adjustments.

        Return ONLY a JSON array with this exact structure:
        [
            {{
                "id": "CANDIDATE_ID",
                "adjusted_score": float,
                "llm_insight": "Detailed strategic recruiter reasoning for adjustment"
            }}
        ]
        """
        try:
            response = self.gemini_client.models.generateContent(
                model=Config.GEMINI_MODEL,
                contents=prompt,
                config={"responseMimeType": "application/json"}
            )
            
            import json
            adjustments = json.loads(response.text)
            
            # Map adjustments back
            adj_dict = {item["id"]: item for item in adjustments}
            for c in top_candidates:
                cid = c["id"]
                if cid in adj_dict:
                    orig_score = c["overall_score"]
                    new_score = float(adj_dict[cid]["adjusted_score"])
                    # Clamp score between 0.0 and 1.0
                    c["overall_score"] = round(max(0.0, min(1.0, new_score)), 4)
                    c["re_ranked_by_llm"] = True
                    c["llm_insight"] = adj_dict[cid]["llm_insight"]
                    c["rationales"].insert(0, f"Gemini Recruiter Insight: {adj_dict[cid]['llm_insight']}")
            
            logger.info("Successfully integrated Gemini Cognitive Re-rank corrections.")
            return top_candidates + remaining_candidates
        except Exception as e:
            logger.error(f"Gemini LLM re-ranking failed: {e}. Keeping base FAISS hybrid rankings.")
            return base_rankings
