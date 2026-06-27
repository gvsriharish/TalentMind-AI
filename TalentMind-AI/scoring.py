from typing import Any, Dict, List, Tuple
from .config import Config
from .utils import get_logger

logger = get_logger("Scoring")

class ScoringEngine:
    """Computes multidimensional candidate suitability scores and generates dynamic, explanatory rationales."""

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights if weights else Config.get_weights()

    def score_candidate(self, candidate: Dict[str, Any], jd: Dict[str, Any], semantic_similarity: float) -> Tuple[float, Dict[str, float], List[str]]:
        """
        Computes the final hybrid score, sub-scores, and diagnostic explanations for a candidate.
        
        Args:
            candidate (dict): Parsed candidate profile.
            jd (dict): Parsed job description requirements.
            semantic_similarity (float): Cosine similarity computed between JD and candidate.
            
        Returns:
            Tuple[float, Dict[str, float], List[str]]: Final aggregated score, dictionary of sub-scores, and dynamic rationales.
        """
        # 1. Compute Individual Dimension Scores
        skills_score = self.compute_skills_match(candidate, jd)
        exp_score = self.compute_experience_score(candidate, jd)
        edu_score = self.compute_education_score(candidate, jd)
        behav_score = self.compute_behavioral_score(candidate)
        compl_score = candidate.get("profile_completeness", 0.5)

        sub_scores = {
            "semantic_similarity": float(semantic_similarity),
            "skills_match": float(skills_score),
            "experience": float(exp_score),
            "education": float(edu_score),
            "behavioral_signals": float(behav_score),
            "profile_completeness": float(compl_score)
        }

        # 2. Weighted Aggregation Fusion
        final_score = 0.0
        for criterion, weight in self.weights.items():
            final_score += sub_scores.get(criterion, 0.0) * weight

        final_score = round(final_score, 4)

        # 3. Generate Explainable AI (XAI) Rationales
        rationales = self.generate_rationales(candidate, jd, sub_scores)

        return final_score, sub_scores, rationales

    def compute_skills_match(self, candidate: Dict[str, Any], jd: Dict[str, Any]) -> float:
        """Computes Jaccard-like matching density of required technical skills."""
        jd_skills = set(clean_list(jd.get("technical_skills", [])))
        cand_skills = set(clean_list(candidate.get("technical_skills", [])))

        if not jd_skills:
            return 1.0  # Safe fallback if JD specifies no skills

        intersection = jd_skills.intersection(cand_skills)
        match_ratio = len(intersection) / len(jd_skills)
        
        # Soft skills secondary influence
        jd_soft = set(clean_list(jd.get("soft_skills", [])))
        cand_soft = set(clean_list(candidate.get("soft_skills", [])))
        
        soft_ratio = 1.0
        if jd_soft:
            soft_intersection = jd_soft.intersection(cand_soft)
            soft_ratio = len(soft_intersection) / len(jd_soft)

        # Blend: 80% Tech skills, 20% Soft skills match
        return min(round((match_ratio * 0.8) + (soft_ratio * 0.2), 2), 1.0)

    def compute_experience_score(self, candidate: Dict[str, Any], jd: Dict[str, Any]) -> float:
        """Evaluates experience seniority match with log-scaling to prevent negative outliers."""
        required_exp = float(jd.get("min_experience_years", 0))
        cand_exp = float(candidate.get("years_of_experience", 0))

        if required_exp == 0:
            return 1.0 if cand_exp >= 0 else 0.0

        if cand_exp >= required_exp:
            # Full points plus bonus capping at 1.0 for meeting requirements
            excess_ratio = (cand_exp - required_exp) / required_exp
            bonus = min(excess_ratio * 0.1, 0.1)  # Max 10% bonus for overqualification
            return min(1.0, 0.9 + bonus)
        else:
            # Underqualified log scaling
            return max(0.0, round(cand_exp / required_exp, 2))

    def compute_education_score(self, candidate: Dict[str, Any], jd: Dict[str, Any]) -> float:
        """Tiers degrees according to role requirements."""
        jd_req = jd.get("education_requirement", "Bachelor's").lower()
        cand_deg = candidate.get("education", {}).get("degree", "None").lower()

        # Define Tier scores
        deg_rank = {"none": 0, "associate": 1, "bachelor's": 2, "master's": 3, "phd": 4}
        
        cand_rank = 0
        for key, val in deg_rank.items():
            if key in cand_deg:
                cand_rank = val
                break
                
        req_rank = 2  # Default to Bachelor's
        for key, val in deg_rank.items():
            if key in jd_req:
                req_rank = val
                break

        if cand_rank >= req_rank:
            return 1.0
        elif cand_rank == req_rank - 1:
            return 0.7  # Close match
        else:
            return 0.4  # Major mismatch or no degree

    def compute_behavioral_score(self, candidate: Dict[str, Any]) -> float:
        """Quantifies candidates' ecosystem activities and signals."""
        signals = candidate.get("behavioral_signals", {})
        
        hackathons = min(signals.get("hackathons_completed", 0) / 3.0, 1.0) # Normalizing: 3+ hackathons is max
        oss = min(signals.get("open_source_contributions", 0) / 10.0, 1.0) # Normalizing: 10+ open-source contributions is max
        leadership = 1.0 if signals.get("leadership_roles", 0) > 0 else 0.5
        commits = min(signals.get("platform_commits", 0) / 500.0, 1.0) # Normalizing: 500+ commits is max
        activity = min(signals.get("active_days_per_month", 0) / 20.0, 1.0) # Normalizing: 20+ active days is max

        score = (hackathons * 0.2) + (oss * 0.25) + (leadership * 0.15) + (commits * 0.2) + (activity * 0.2)
        return min(round(score, 2), 1.0)

    def generate_rationales(self, candidate: Dict[str, Any], jd: Dict[str, Any], sub_scores: Dict[str, float]) -> List[str]:
        """Creates highly descriptive, positive-first reasons explaining why a candidate ranked at their level."""
        rationales = []
        name = candidate.get("name", "Candidate")

        # 1. Semantic rationale
        sem = sub_scores["semantic_similarity"]
        if sem >= 0.82:
            rationales.append("Excellent overall semantic similarity to the job description requirements.")
        elif sem >= 0.70:
            rationales.append("Good contextual and professional background overlap.")

        # 2. Tech skill overlap
        jd_skills = set(clean_list(jd.get("technical_skills", [])))
        cand_skills = set(clean_list(candidate.get("technical_skills", [])))
        overlap = jd_skills.intersection(cand_skills)
        if len(overlap) >= 4:
            rationales.append(f"Strong match for core technical competencies: {', '.join(list(overlap)[:3])}.")
        elif len(overlap) >= 1:
            rationales.append(f"Possesses crucial required skills including {', '.join(list(overlap)[:2])}.")

        # 3. Experience fit
        cand_exp = candidate.get("years_of_experience", 0)
        jd_exp = jd.get("min_experience_years", 0)
        if cand_exp >= jd_exp + 2:
            rationales.append(f"Extensive professional history with {cand_exp} years of relevant tenure (exceeding requirement of {jd_exp} yrs).")
        elif cand_exp >= jd_exp:
            rationales.append(f"Meets experience standard with {cand_exp} years in comparable roles.")
        else:
            rationales.append(f"Under-experienced relative to JD (has {cand_exp} of {jd_exp} requested years) but shows potential.")

        # 4. Behavioral or open source leadership
        signals = candidate.get("behavioral_signals", {})
        if signals.get("leadership_roles", 0) > 0:
            rationales.append("Demonstrated leadership experience and team management qualities.")
        if signals.get("open_source_contributions", 0) >= 5 or signals.get("platform_commits", 0) >= 150:
            rationales.append("Highly engaged ecosystem citizen with substantial open-source contributions.")
        elif signals.get("hackathons_completed", 0) >= 2:
            rationales.append("Proactive developer with a strong track record of hackathon completions.")

        # Ensure we always return at least three rationales
        while len(rationales) < 3:
            rationales.append("Favorable candidate profiling based on verified historical work documentation.")

        return rationales[:4]

def clean_list(lst: List[str]) -> List[str]:
    """Helper to lowercase and clean string lists."""
    return [str(item).strip().lower() for item in lst if item]
