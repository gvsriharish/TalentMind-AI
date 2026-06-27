export interface Education {
  degree: string;
  major: string;
  institution: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration_years: number;
  description: string;
}

export interface Project {
  title: string;
  description: string;
}

export interface BehavioralSignals {
  hackathons_completed: number;
  open_source_contributions: number;
  leadership_roles: number;
  platform_commits: number;
  active_days_per_month: number;
}

export interface ScoringBreakdown {
  semantic_similarity: number;
  skills_match: number;
  experience: number;
  education: number;
  behavioral_signals: number;
  profile_completeness: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  technical_skills: string[];
  soft_skills: string[];
  education: Education;
  years_of_experience: number;
  certifications: string[];
  achievements: string[];
  work_experience: WorkExperience[];
  projects: Project[];
  behavioral_signals: BehavioralSignals;
  profile_completeness: number;
  
  // Scoring metadata fields added by engine
  overall_score?: number;
  scoring_breakdown?: ScoringBreakdown;
  rationales?: string[];
  re_ranked_by_llm?: boolean;
  llm_insight?: string;
  search_similarity?: number;
  matched_query_skills?: string[];
}

export interface JobDescription {
  domain: string;
  seniority: string;
  min_experience_years: number;
  education_requirement: string;
  technical_skills: string[];
  soft_skills: string[];
  responsibilities: string[];
}

export interface ScoringWeights {
  semantic_similarity: number;
  skills_match: number;
  experience: number;
  education: number;
  behavioral_signals: number;
  profile_completeness: number;
}

export interface Slide {
  title: string;
  subtitle?: string;
  content: string[];
  bullets?: string[];
}

export interface CodeFile {
  name: string;
  path: string;
  content: string;
}
