import pytest
from ..jd_parser import JobDescriptionParser
from ..candidate_parser import CandidateProfileParser

def test_jd_parser_offline_rules():
    parser = JobDescriptionParser(use_llm=False)
    jd_text = """
    We need a Lead Machine Learning Engineer with 6 years of experience in PyTorch.
    Mandatory skills: Python, PyTorch, Docker, NLP.
    Target degree: PhD in CS.
    """
    result = parser.parse(jd_text)
    
    assert result["seniority"] == "Lead"
    assert result["min_experience_years"] == 6
    assert result["education_requirement"] == "PhD"
    assert "pytorch" in result["technical_skills"]

def test_candidate_profile_parser():
    parser = CandidateProfileParser()
    raw_candidate = {
        "id": "CAND_TEST",
        "name": "Devi Prasad",
        "email": "devi@talentmind.io",
        "technical_skills": ["Python", "TensorFlow", "SQL"],
        "years_of_experience": 5.0,
        "education": {
            "degree": "Bachelor's",
            "major": "Computer Science",
            "institution": "IIT Madras"
        },
        "work_experience": [],
        "projects": [],
        "behavioral_signals": {
            "platform_commits": 300,
            "active_days_per_month": 15
        }
    }
    
    clean = parser.parse(raw_candidate)
    
    assert clean["name"] == "Devi Prasad"
    assert clean["years_of_experience"] == 5.0
    assert "Python" in clean["technical_skills"]
    assert clean["profile_completeness"] > 0.0
