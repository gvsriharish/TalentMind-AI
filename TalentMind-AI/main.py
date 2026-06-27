import argparse
import os
import sys
import json
from .config import Config
from .jd_parser import JobDescriptionParser
from .candidate_parser import CandidateProfileParser
from .ranking_engine import CandidateRankingEngine
from .submission import SubmissionGenerator
from .validate import SubmissionValidator
from .utils import get_logger

logger = get_logger("MainPipeline")

def run_pipeline(jd_path: str, candidates_path: str, output_dir: str, enable_llm: bool) -> bool:
    """
    Executes the candidate ranking and semantic matching end-to-end pipeline.
    
    Args:
        jd_path (str): File path to raw job description text.
        candidates_path (str): File path to candidates JSON profile database.
        output_dir (str): Location where reports are saved.
        enable_llm (bool): Flag to trigger cognitive Gemini refinement.
        
    Returns:
        bool: Pipeline completion success state.
    """
    logger.info("==================================================")
    print("      Initializing TalentMind-AI Master Pipeline      ")
    logger.info("==================================================")

    # 1. Read input Job Description
    if not os.path.exists(jd_path):
        logger.error(f"Job Description file not found at {jd_path}")
        return False
    with open(jd_path, "r", encoding="utf-8") as f:
        raw_jd = f.read()

    # 2. Read candidate dataset
    if not os.path.exists(candidates_path):
        logger.error(f"Candidate dataset file not found at {candidates_path}")
        return False
    with open(candidates_path, "r", encoding="utf-8") as f:
        try:
            raw_candidates = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load candidate JSON dataset: {e}")
            return False

    # 3. Configure toggles
    Config.ENABLE_GEMINI_RERANKING = enable_llm
    
    # 4. Parse Job Description criteria
    print("-> Parsing Job Description NLP criteria...")
    jd_parser = JobDescriptionParser(use_llm=enable_llm)
    parsed_jd = jd_parser.parse(raw_jd)
    logger.info(f"Parsed JD Domain: {parsed_jd.get('domain')} | Seniority: {parsed_jd.get('seniority')}")

    # 5. Parse and clean Candidate Profiles
    print("-> Cleaning and normalizing candidate profile records...")
    cand_parser = CandidateProfileParser()
    normalized_candidates = [cand_parser.parse(cand) for cand in raw_candidates]

    # 6. Initialize FAISS Vector Indexing and scoring
    print("-> Constructing dense vector embeddings & Indexing in FAISS...")
    ranking_engine = CandidateRankingEngine(use_gemini_rerank=enable_llm)
    ranking_engine.load_candidates(normalized_candidates)

    # 7. Execute Match Rankings
    print("-> Performing multi-criteria scoring & rankings fusion...")
    ranked_candidates = ranking_engine.search_and_rank(parsed_jd, top_n=100)

    # 8. Export XLSX Report
    print("-> Generating styled multi-tab XLSX report file...")
    exporter = SubmissionGenerator(output_dir=output_dir)
    xlsx_path = exporter.generate_report(ranked_candidates, parsed_jd, Config.get_weights())
    print(f"✅ Polished XLSX report successfully exported to {xlsx_path}")

    # 9. Perform submission validation checks
    print("-> Running pre-submission compliance audit...")
    validator = SubmissionValidator(xlsx_path)
    is_valid, logs = validator.validate_file()
    for log in logs:
        logger.info(log)

    print("==================================================")
    print("   TalentMind-AI Match Run Executed Successfully   ")
    print("==================================================")
    return is_valid

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TalentMind-AI Matching Pipeline Orchestrator")
    parser.add_argument("--jd", type=str, default="data/sample_jd.txt", help="Path to JD file")
    parser.add_argument("--candidates", type=str, default="data/sample_candidates.json", help="Path to Candidates JSON")
    parser.add_argument("--output", type=str, default="outputs", help="Output directory")
    parser.add_argument("--no-llm", action="store_true", help="Disable optional Gemini LLM re-ranking")
    args = parser.parse_args()

    success = run_pipeline(
        jd_path=args.jd,
        candidates_path=args.candidates,
        output_dir=args.output,
        enable_llm=not args.no_llm
    )
    sys.exit(0 if success else 1)
