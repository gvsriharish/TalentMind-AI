import streamlit as st
import pandas as pd
import json
import plotly.express as px
import plotly.graph_objects as go
from config import Config
from jd_parser import JobDescriptionParser
from candidate_parser import CandidateProfileParser
from ranking_engine import CandidateRankingEngine
from submission import SubmissionGenerator
from validate import SubmissionValidator

# Page Configuration
st.set_page_config(
    page_title="TalentMind-AI — Candidate Ranking Engine",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Application Theme & Custom Styles
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1B365D;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #5C768D;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        padding: 1.5rem;
        border-radius: 0.75rem;
        border-left: 5px solid #1B365D;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    </style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">🧠 TalentMind-AI</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Cognitive Candidate Ranking & Semantic Match Intelligence Platform</div>', unsafe_allow_html=True)

# 1. Sidebar Configurations
st.sidebar.header("🎛️ Matching Engine Controls")

# Gemini toggle
enable_gemini = st.sidebar.toggle(
    "Enable Gemini Cognitive Re-ranking",
    value=Config.ENABLE_GEMINI_RERANKING,
    help="Utilizes Gemini 3.5 Flash to critically review qualifications and adjust scores based on nuanced project matching."
)

# Weights Configurator
st.sidebar.subheader("⚖️ Adjust Metric Weights")
w_semantic = st.sidebar.slider("Semantic Similarity", 0.0, 1.0, 0.40, 0.05)
w_skills = st.sidebar.slider("Skills Overlap Match", 0.0, 1.0, 0.20, 0.05)
w_exp = st.sidebar.slider("Experience Alignment", 0.0, 1.0, 0.15, 0.05)
w_edu = st.sidebar.slider("Education Prestige", 0.0, 1.0, 0.10, 0.05)
w_behav = st.sidebar.slider("Behavioral platform Signals", 0.0, 1.0, 0.10, 0.05)
w_completeness = st.sidebar.slider("Profile Completeness", 0.0, 1.0, 0.05, 0.05)

# Validate weights
total_weight = w_semantic + w_skills + w_exp + w_edu + w_behav + w_completeness
if abs(total_weight - 1.0) > 0.01:
    st.sidebar.error(f"⚠️ Total weights must sum to 100% (currently {total_weight*100:.0f}%)")
else:
    st.sidebar.success("✅ Weight distribution is balanced!")

# Update configuration
Config.ENABLE_GEMINI_RERANKING = enable_gemini
Config.update_weights({
    "semantic_similarity": w_semantic,
    "skills_match": w_skills,
    "experience": w_exp,
    "education": w_edu,
    "behavioral_signals": w_behav,
    "profile_completeness": w_completeness
})

# 2. Main Interface Setup
tab1, tab2, tab3 = st.tabs(["📊 Candidate Rankings", "🔍 Semantic Search", "⚙️ Schema Validation"])

# Default JD string
DEFAULT_JD = """We are looking for a Senior Machine Learning Engineer with 5+ years of experience in AI.
Mandatory skills: Python, PyTorch, SQL, NLP, and Docker.
Key Responsibilities:
- Design and train BERT/GPT dense embeddings models.
- Deploy secure ML APIs utilizing Docker and FastAPI on cloud services (AWS/GCP).
- Mentor junior engineers and collaborate in an agile environment.
Education requirement: Master's or PhD in Computer Science or related fields."""

# Load sample candidate profiles helper
@st.cache_data
def load_sample_candidates():
    # Attempt to load, otherwise return mock list
    try:
        with open("data/sample_candidates.json", "r") as f:
            return json.load(f)
    except Exception:
        # Mini inline candidate mock dataset for standalone Streamlit execution safety
        return [
            {
                "id": "CAND_01",
                "name": "Arjun Sharma",
                "email": "arjun@sharma.dev",
                "technical_skills": ["Python", "PyTorch", "SQL", "NLP", "Docker", "FastAPI"],
                "soft_skills": ["Leadership", "Communication"],
                "education": {"degree": "Master's", "major": "Computer Science", "institution": "IIT Bombay"},
                "years_of_experience": 6.5,
                "certifications": ["AWS Certified Machine Learning"],
                "achievements": ["Hackathon winner 2024"],
                "work_experience": [{"title": "Senior ML Engineer", "description": "Trained PyTorch and NLP models."}],
                "projects": [{"title": "LLM Chatbot", "description": "Designed custom Transformer model."}],
                "behavioral_signals": {"hackathons_completed": 3, "open_source_contributions": 12, "leadership_roles": 1, "platform_commits": 450, "active_days_per_month": 18}
            },
            {
                "id": "CAND_02",
                "name": "Priya Patel",
                "email": "priya.patel@tech.io",
                "technical_skills": ["Python", "TensorFlow", "SQL", "Pandas", "Scikit-Learn"],
                "soft_skills": ["Collaboration", "Agile"],
                "education": {"degree": "Bachelor's", "major": "Data Science", "institution": "BITS Pilani"},
                "years_of_experience": 4.0,
                "certifications": [],
                "achievements": [],
                "work_experience": [{"title": "Data Scientist", "description": "Data analytics using pandas."}],
                "projects": [],
                "behavioral_signals": {"hackathons_completed": 1, "open_source_contributions": 2, "leadership_roles": 0, "platform_commits": 120, "active_days_per_month": 10}
            }
        ]

candidates = load_sample_candidates()

with tab1:
    col_jd, col_metrics = st.columns([1, 1])
    
    with col_jd:
        st.subheader("📝 Job Description Requirements")
        jd_input = st.text_area("Paste unstructured Job Description here:", value=DEFAULT_JD, height=220)
        
        # Trigger parsing
        if st.button("🚀 Analyze JD & Rank Candidates"):
            with st.spinner("Parsing requirements and calculating vector similarities..."):
                jd_parser = JobDescriptionParser()
                parsed_jd = jd_parser.parse(jd_input)
                
                # Rank candidates
                engine = CandidateRankingEngine(use_gemini_rerank=enable_gemini)
                
                # Normalize sample candidates
                profile_parser = CandidateProfileParser()
                clean_candidates = [profile_parser.parse(c) for c in candidates]
                
                engine.load_candidates(clean_candidates)
                ranked = engine.search_and_rank(parsed_jd)
                
                st.session_state["ranked_results"] = ranked
                st.session_state["parsed_jd"] = parsed_jd
                st.success(f"Successfully processed {len(ranked)} profiles!")

    with col_metrics:
        st.subheader("🔍 Extracted Job Requirements")
        if "parsed_jd" in st.session_state:
            p_jd = st.session_state["parsed_jd"]
            st.write(f"**Domain Focus:** {p_jd.get('domain')}")
            st.write(f"**Required Seniority:** {p_jd.get('seniority')}")
            st.write(f"**Min Experience Years:** {p_jd.get('min_experience_years')} years")
            st.write(f"**Key Skills Expected:** {', '.join(p_jd.get('technical_skills', []))}")
        else:
            st.info("Run the ranking engine to extract Job Description criteria.")

    # 3. Rankings Display Section
    if "ranked_results" in st.session_state:
        st.write("---")
        st.subheader("🏆 Candidate Suitability Standings")
        
        ranked_df_list = []
        for i, c in enumerate(st.session_state["ranked_results"]):
            ranked_df_list.append({
                "Rank": i + 1,
                "ID": c["id"],
                "Name": c["name"],
                "Match Score": f"{c['overall_score'] * 100:.1f}%",
                "Exp Tenure": f"{c['years_of_experience']} yrs",
                "Degree": c["education"]["degree"]
            })
            
        ranked_df = pd.DataFrame(ranked_df_list)
        st.dataframe(ranked_df, use_container_width=True)

        # Download Report
        if st.button("📥 Export Ranked Report to Excel (.xlsx)"):
            with st.spinner("Generating beautiful styled openpyxl spreadsheet..."):
                exporter = SubmissionGenerator()
                f_path = exporter.generate_report(st.session_state["ranked_results"], st.session_state["parsed_jd"], Config.DEFAULT_WEIGHTS)
                with open(f_path, "rb") as f:
                    st.download_button("Click here to download XLSX", data=f, file_name="talentmind_rankings_top100.xlsx")

with tab2:
    st.subheader("🔍 Free-form Semantic Search")
    st.caption("Perform conceptual search over the resume database using plain conversational English queries.")
    
    search_q = st.text_input("Enter search query (e.g., 'Docker deployments using python'):", value="FastAPI ML pipeline Docker")
    
    if st.button("🔍 Run Semantic Query"):
        if "ranked_results" in st.session_state:
            # Re-rank candidates on-the-fly
            from semantic_search import SemanticSearchProvider
            engine = CandidateRankingEngine(use_gemini_rerank=False)
            
            profile_parser = CandidateProfileParser()
            clean_candidates = [profile_parser.parse(c) for c in candidates]
            engine.load_candidates(clean_candidates)
            
            searcher = SemanticSearchProvider(engine.embedder, engine.candidate_embeddings, engine.candidates)
            results = searcher.search(search_q)
            
            st.subheader("Search Matches")
            for item in results:
                st.markdown(f"**{item['name']}** - Search Score: `{item['search_similarity']*100:.1f}%`")
                st.write(f"Matched Skills: {', '.join(item['matched_query_skills'])}")
        else:
            st.error("Please run candidate ranking in Tab 1 first to index candidate embeddings.")

with tab3:
    st.subheader("📋 Pre-submission Schema Validation Check")
    st.write("Ensures your generated XLSX results align perfectly with standard India Runs challenge compliance templates.")
    
    if st.button("🔍 Audit XLSX report"):
        if os.path.exists("outputs/talentmind_rankings_top100.xlsx"):
            validator = SubmissionValidator("outputs/talentmind_rankings_top100.xlsx")
            success, logs = validator.validate_file()
            if success:
                st.success("🎉 PASS! Your spreadsheet is compliant and ready for final submission.")
            else:
                st.error("❌ FAIL! Schema mismatches found.")
            for log in logs:
                st.write(log)
        else:
            st.info("No exported XLSX report found yet. Generate and export a report in Tab 1 first.")
