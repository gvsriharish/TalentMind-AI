import os
from typing import Dict

class Config:
    """Central configuration class for TalentMind-AI Candidate Ranking System."""
    
    # NLP & Model Settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Gemini API Settings for LLM Re-ranking
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ENABLE_GEMINI_RERANKING: bool = True  # Can be toggled to False to disable LLM reranking
    GEMINI_MODEL: str = "gemini-3.5-flash"
    
    # Default Multi-Criteria Weight Configurations
    # Total sum must equal 1.0 (100%)
    DEFAULT_WEIGHTS: Dict[str, float] = {
        "semantic_similarity": 0.40,  # Cosine similarity of embeddings
        "skills_match": 0.20,         # Match density of tech/soft skills
        "experience": 0.15,           # Experience tenure and seniority fit
        "education": 0.10,            # Education degree/discipline fit
        "behavioral_signals": 0.10,   # Platform activity & achievements
        "profile_completeness": 0.05  # Density of candidate profile elements
    }
    
    @classmethod
    def get_weights(cls) -> Dict[str, float]:
        """Returns the active weighting configuration."""
        return cls.DEFAULT_WEIGHTS

    @classmethod
    def update_weights(cls, custom_weights: Dict[str, float]) -> None:
        """
        Updates the scoring weights after validating that they sum to approximately 1.0.
        
        Args:
            custom_weights (dict): Key-value pairs representing custom weights.
        """
        total = sum(custom_weights.values())
        if not (0.99 <= total <= 1.01):
            raise ValueError(f"Weights must sum to 1.0 (currently sums to {total})")
        
        for key in cls.DEFAULT_WEIGHTS:
            if key in custom_weights:
                cls.DEFAULT_WEIGHTS[key] = custom_weights[key]
