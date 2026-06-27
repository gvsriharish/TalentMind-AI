import numpy as np
from typing import Any, Dict, List
from .embedding import EmbeddingGenerator
from .utils import get_logger

logger = get_logger("SemanticSearch")

class SemanticSearchProvider:
    """Provides semantic query lookup capabilities across preloaded candidate profile databases."""

    def __init__(self, embedder: EmbeddingGenerator, candidate_embeddings: np.ndarray, candidates: List[Dict[str, Any]]):
        self.embedder = embedder
        self.candidate_embeddings = candidate_embeddings
        self.candidates = candidates

    def search(self, query_text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Executes search matches using cosine similarity of query embedding vs candidate embeddings.
        
        Args:
            query_text (str): Free-text semantic search query.
            top_k (int): Number of results to return.
            
        Returns:
            List[Dict[str, Any]]: Sorted results with similarity score metadata.
        """
        if not query_text or self.candidate_embeddings is None or len(self.candidate_embeddings) == 0:
            return []

        logger.info(f"Executing semantic search for query: '{query_text}'")
        
        # 1. Embed query
        query_vector = self.embedder.get_embedding(query_text)
        
        # 2. Compute similarities
        results = []
        for i, cand in enumerate(self.candidates):
            sim = self.embedder.cosine_similarity(query_vector, self.candidate_embeddings[i])
            
            # Highlight keyword overlaps
            query_words = set(query_text.lower().replace(",", " ").replace(";", " ").split())
            cand_skills = set(s.lower() for s in cand.get("technical_skills", []))
            overlapping_skills = list(query_words.intersection(cand_skills))

            results.append({
                **cand,
                "search_similarity": round(sim, 4),
                "matched_query_skills": overlapping_skills
            })

        # 3. Sort by search relevance
        results.sort(key=lambda x: x["search_similarity"], reverse=True)
        return results[:top_k]
