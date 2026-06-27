import pytest
import numpy as np
from ..embedding import EmbeddingGenerator
from ..scoring import ScoringEngine

def test_embedding_fallback_normalized():
    embedder = EmbeddingGenerator()
    v1 = embedder.get_embedding("Python developer with PyTorch")
    v2 = embedder.get_embedding("Docker and Kubernetes deployment")
    
    # Assert dimensions
    assert len(v1) == 384
    assert len(v2) == 384
    
    # Assert L2 normalized
    assert np.isclose(np.linalg.norm(v1), 1.0, atol=1e-5)
    
    # Assert similarities behave correctly
    sim_self = EmbeddingGenerator.cosine_similarity(v1, v1)
    assert np.isclose(sim_self, 1.0)
    
    sim_other = EmbeddingGenerator.cosine_similarity(v1, v2)
    assert 0.0 <= sim_other <= 1.0

def test_scoring_fusion_math():
    scoring = ScoringEngine()
    jd = {
        "technical_skills": ["python", "pytorch", "sql"],
        "soft_skills": ["communication"],
        "min_experience_years": 5,
        "education_requirement": "Master's"
    }
    
    candidate = {
        "technical_skills": ["Python", "PyTorch", "SQL", "Docker"],
        "soft_skills": ["Communication"],
        "years_of_experience": 7,
        "education": {"degree": "Master's", "major": "CS"},
        "behavioral_signals": {
            "platform_commits": 200,
            "active_days_per_month": 12
        },
        "profile_completeness": 0.90
    }
    
    # Score candidate with high semantic similarity
    score, breakdown, rationales = scoring.score_candidate(candidate, jd, semantic_similarity=0.85)
    
    assert score > 0.5
    assert breakdown["skills_match"] == 1.0 # Meets all skills
    assert breakdown["experience"] >= 1.0 # Overqualified
    assert len(rationales) >= 3
