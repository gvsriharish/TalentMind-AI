import re
from typing import Any, Dict, List
from google import genai
from .config import Config
from .utils import get_logger, clean_text

logger = get_logger("JDParser")

class JobDescriptionParser:
    """Parses unstructured Job Descriptions using NLP and regex heuristics, with optional LLM boosting."""

    def __init__(self, use_llm: bool = True):
        self.use_llm = use_llm and bool(Config.GEMINI_API_KEY)
        if self.use_llm:
            try:
                self.client = genai.Client(api_key=Config.GEMINI_API_KEY)
                logger.info("Configured Gemini API for Job Description cognitive parsing.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}. Falling back to Rule-based parsing.")
                self.use_llm = False

    def parse(self, jd_text: str) -> Dict[str, Any]:
        """
        Parses JD text and extracts structural metadata.
        
        Args:
            jd_text (str): Complete raw text of the Job Description.
            
        Returns:
            dict: Structured job criteria.
        """
        if not jd_text:
            return self._empty_result()

        if self.use_llm:
            return self._parse_with_llm(jd_text)
        return self._parse_with_rules(jd_text)

    def _parse_with_rules(self, text: str) -> Dict[str, Any]:
        """Local keyword and regex rule-based parser (Offline Mode)."""
        clean_jd = clean_text(text)
        
        # 1. Experience Extraction
        experience_patterns = [
            r'(\d+)\s*\+?\s*(?:years|yrs)\s*(?:of\s*)?experience',
            r'min(?:imum)?\s*of\s*(\d+)\s*(?:years|yrs)',
            r'(\d+)\s*-\s*(\d+)\s*years'
        ]
        min_years = 0
        for pattern in experience_patterns:
            match = re.search(pattern, clean_jd)
            if match:
                min_years = int(match.group(1))
                break

        # 2. Seniority Levels
        seniority = "Mid"
        if any(w in clean_jd for w in ["lead", "principal", "architect", "director", "staff"]):
            seniority = "Lead"
        elif any(w in clean_jd for w in ["senior", "sr.", "experienced"]):
            seniority = "Senior"
        elif any(w in clean_jd for w in ["junior", "jr.", "entry", "intern"]):
            seniority = "Junior"

        # 3. Domain Detection
        domain = "Software Engineering"
        if any(w in clean_jd for w in ["data science", "machine learning", "deep learning", "nlp", "ai"]):
            domain = "AI / Machine Learning"
        elif any(w in clean_jd for w in ["devops", "cloud", "aws", "kubernetes", "docker"]):
            domain = "Cloud / DevOps"
        elif any(w in clean_jd for w in ["frontend", "react", "vue", "javascript", "css"]):
            domain = "Frontend Engineering"
        elif any(w in clean_jd for w in ["product manager", "pm", "scrum", "product owner"]):
            domain = "Product Management"

        # 4. Skill Parsing Heuristics
        skills_db = [
            "python", "java", "c++", "go", "javascript", "typescript", "rust",
            "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
            "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
            "nlp", "bert", "gpt", "transformers", "llm", "rag", "langchain",
            "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "jenkins",
            "react", "angular", "vue", "next.js", "tailwind", "fastapi", "flask", "django"
        ]
        matched_skills = [skill for skill in skills_db if f" {skill} " in f" {clean_jd} " or f" {skill}," in f" {clean_jd} " or f"\n{skill}" in f" {clean_jd} "]

        # Soft skills heuristics
        soft_skills_db = ["communication", "teamwork", "leadership", "mentoring", "collaboration", "agile", "problem solving", "critical thinking"]
        matched_soft_skills = [ss for ss in soft_skills_db if ss in clean_jd]

        # 5. Education
        education = "Bachelor's"
        if any(w in clean_jd for w in ["phd", "ph.d", "doctorate"]):
            education = "PhD"
        elif any(w in clean_jd for w in ["master", "m.s.", "ms", "mtech", "m.tech"]):
            education = "Master's"

        # 6. Key Responsibilities
        responsibilities = []
        lines = text.split("\n")
        bullet_points = [line.strip("- *•").strip() for line in lines if line.strip().startswith(("-", "*", "•"))]
        responsibilities = bullet_points[:5] if bullet_points else ["Participate in software development lifecycle", "Collaborate with cross-functional teams"]

        return {
            "domain": domain,
            "seniority": seniority,
            "min_experience_years": min_years,
            "education_requirement": education,
            "technical_skills": matched_skills if matched_skills else ["Python", "SQL"],
            "soft_skills": matched_soft_skills if matched_soft_skills else ["Communication"],
            "responsibilities": responsibilities
        }

    def _parse_with_llm(self, text: str) -> Dict[str, Any]:
        """Cognitively parses JD text using Gemini API for advanced semantic understanding."""
        prompt = f"""
        Analyze the following Job Description (JD) and extract structural requirements.
        Output ONLY a strictly formatted JSON conforming to this schema:
        {{
            "domain": "Detailed domain e.g., AI / Machine Learning, Frontend, DevOps, etc.",
            "seniority": "Junior, Mid, Senior, Lead, or Executive",
            "min_experience_years": integer,
            "education_requirement": "Bachelor's, Master's, PhD, or None",
            "technical_skills": ["list", "of", "required", "technologies"],
            "soft_skills": ["list", "of", "personal", "traits"],
            "responsibilities": ["up to 5 key responsibilities/objectives"]
        }}

        Job Description text:
        ---
        {text}
        ---
        """
        try:
            response = self.client.models.generateContent(
                model=Config.GEMINI_MODEL,
                contents=prompt,
                config={"responseMimeType": "application/json"}
            )
            import json
            data = json.loads(response.text)
            logger.info("Successfully extracted JD parameters via Gemini API.")
            return data
        except Exception as e:
            logger.error(f"Failed to parse JD via Gemini API: {e}. Defaulting to rule-based parser.")
            return self._parse_with_rules(text)

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "domain": "Unknown",
            "seniority": "Mid",
            "min_experience_years": 0,
            "education_requirement": "Bachelor's",
            "technical_skills": [],
            "soft_skills": [],
            "responsibilities": []
        }
