import re
from typing import Any, Dict, List
from .utils import get_logger, clean_text

logger = get_logger("CandidateParser")

class CandidateProfileParser:
    """Parses and normalizes raw/unstructured candidate profiles into clean structured schemas."""

    def parse(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes raw candidate records (e.g., from database or parsed JSON resumes)
        and normalizes them to ensure all required fields are present and typed correctly.
        """
        normalized = {}
        
        normalized["id"] = str(candidate_data.get("id", "CAND_UNKNOWN"))
        normalized["name"] = str(candidate_data.get("name", "Unnamed Candidate"))
        normalized["email"] = str(candidate_data.get("email", "N/A"))
        
        # Tech & Soft Skills Parsing
        normalized["technical_skills"] = [str(s).strip() for s in candidate_data.get("technical_skills", [])]
        normalized["soft_skills"] = [str(s).strip() for s in candidate_data.get("soft_skills", [])]
        
        # Experience parsing & calculation
        experience_list = candidate_data.get("work_experience", [])
        normalized["work_experience"] = experience_list
        normalized["years_of_experience"] = self._calculate_total_experience(experience_list, candidate_data)

        # Education
        education_entry = candidate_data.get("education", {})
        if isinstance(education_entry, list) and len(education_entry) > 0:
            education_entry = education_entry[0]  # Take highest if listed
        normalized["education"] = {
            "degree": str(education_entry.get("degree", "None")),
            "major": str(education_entry.get("major", "General")),
            "institution": str(education_entry.get("institution", "Unknown"))
        }

        # Certifications, Achievements & Projects
        normalized["certifications"] = [str(c).strip() for c in candidate_data.get("certifications", [])]
        normalized["achievements"] = [str(a).strip() for a in candidate_data.get("achievements", [])]
        normalized["projects"] = candidate_data.get("projects", [])

        # Behavioral Signals & Platform Activity
        normalized["behavioral_signals"] = {
            "hackathons_completed": int(candidate_data.get("behavioral_signals", {}).get("hackathons_completed", 0)),
            "open_source_contributions": int(candidate_data.get("behavioral_signals", {}).get("open_source_contributions", 0)),
            "leadership_roles": int(candidate_data.get("behavioral_signals", {}).get("leadership_roles", 0)),
            "platform_commits": int(candidate_data.get("behavioral_signals", {}).get("platform_commits", 0)),
            "active_days_per_month": int(candidate_data.get("behavioral_signals", {}).get("active_days_per_month", 0))
        }

        # Dynamic completeness score calculation
        normalized["profile_completeness"] = self.calculate_completeness(normalized)

        return normalized

    def _calculate_total_experience(self, work_exp: List[Dict[str, Any]], raw_data: Dict[str, Any]) -> float:
        """Sums up candidate experience tenures or parses direct fields."""
        if "years_of_experience" in raw_data:
            try:
                return float(raw_data["years_of_experience"])
            except (ValueError, TypeError):
                pass

        total_years = 0.0
        for exp in work_exp:
            # Check for direct duration first
            duration_years = exp.get("duration_years")
            if duration_years is not None:
                try:
                    total_years += float(duration_years)
                    continue
                except (ValueError, TypeError):
                    pass

            # Try parsing from description or string tenures (e.g., "Jan 2020 - Dec 2022")
            desc = clean_text(exp.get("description", ""))
            match = re.search(r'(\d+)\s*(?:year|yr)', desc)
            if match:
                total_years += float(match.group(1))

        return max(total_years, 0.0)

    def calculate_completeness(self, profile: Dict[str, Any]) -> float:
        """
        Calculates percentage completeness of a candidate profile based on data density.
        Max value: 1.0 (100%)
        """
        checks = [
            bool(profile.get("name")),
            bool(profile.get("email")),
            len(profile.get("technical_skills", [])) >= 3,
            len(profile.get("work_experience", [])) > 0,
            bool(profile.get("education", {}).get("degree") != "None"),
            len(profile.get("projects", [])) > 0,
            len(profile.get("certifications", [])) > 0,
            len(profile.get("achievements", [])) > 0,
            profile.get("behavioral_signals", {}).get("platform_commits", 0) > 0,
            profile.get("years_of_experience", 0.0) > 0.0
        ]
        
        score = sum(1 for c in checks if c) / len(checks)
        return round(score, 2)
