# 🚀 TalentMind AI

### Intelligent Candidate Ranking System using Semantic Search & Explainable AI

> **TalentMind AI** is a production-ready AI-powered recruitment platform that ranks candidates based on their actual suitability for a job—not just keyword matches. By combining **Natural Language Processing (NLP)**, **semantic embeddings**, **hybrid scoring**, and **Explainable AI (XAI)**, the system helps recruiters identify the most relevant candidates quickly and fairly.

This project was developed for the **INDIA RUNS – Data & AI Challenge (Hack2Skill)**.

---

## 📌 Problem Statement

Traditional Applicant Tracking Systems (ATS) rely heavily on keyword matching, causing qualified candidates to be overlooked if their resumes don't contain exact keyword matches.

TalentMind AI addresses this limitation by understanding the meaning and context behind both job descriptions and candidate profiles.

---

## ✨ Features

* 📄 Intelligent Job Description Analysis
* 👤 Comprehensive Candidate Profile Understanding
* 🧠 Semantic Similarity using Sentence Transformers
* ⚡ Fast Candidate Retrieval with FAISS
* 📊 Hybrid Candidate Ranking Engine
* 💡 Explainable AI (Why a candidate was recommended)
* 📈 Configurable Scoring Weights
* 📥 Automatic XLSX Submission Generator
* 🌐 Streamlit Recruiter Dashboard *(Optional Bonus)*
* 🔍 Skill Gap Analysis *(Bonus)*
* 📋 Recruiter-Friendly Candidate Insights

---

## 🏗️ System Architecture

```text
                     Job Description
                            │
                            ▼
                 NLP & Requirement Extraction
                            │
                            ▼
                 Semantic Embedding Generator
                            │
                            ▼
                   Vector Similarity Search
                            │
                            ▼
                Hybrid Candidate Scoring Engine
                            │
                            ▼
                 Explainable AI Recommendation
                            │
                            ▼
              Ranked Candidate List (XLSX Output)
```

---

## 🛠️ Tech Stack

| Category         | Technology            |
| ---------------- | --------------------- |
| Language         | Python 3.12           |
| NLP              | Sentence Transformers |
| Vector Database  | FAISS                 |
| Machine Learning | Scikit-learn          |
| Data Processing  | Pandas, NumPy         |
| Document Parsing | python-docx           |
| Spreadsheet      | OpenPyXL              |
| Dashboard        | Streamlit             |
| Visualization    | Plotly                |
| Configuration    | YAML                  |

---

## 📂 Project Structure

```text
TalentMind-AI/
│
├── README.md
├── requirements.txt
├── config.py
├── main.py
├── jd_parser.py
├── candidate_parser.py
├── embedding.py
├── semantic_search.py
├── ranking_engine.py
├── scoring.py
├── submission.py
├── validate.py
├── utils.py
│
├── data/
│   ├── candidates.jsonl
│   ├── job_description.docx
│   └── candidate_schema.json
│
├── outputs/
│   ├── ranked_candidates.xlsx
│   └── ranking_results.json
│
├── presentation/
│   └── TalentMindAI.pdf
│
├── docs/
│
├── screenshots/
│
└── streamlit_app.py
```

---

## ⚙️ Ranking Methodology

TalentMind AI evaluates every candidate using a hybrid scoring strategy.

| Metric               | Weight |
| -------------------- | ------ |
| Semantic Similarity  | 40%    |
| Skills Match         | 20%    |
| Experience Match     | 15%    |
| Education Match      | 10%    |
| Behavioral Signals   | 10%    |
| Profile Completeness | 5%     |

The scoring weights are configurable and can be adjusted based on hiring requirements.

---

## 🤖 Explainable AI

Instead of providing only a score, TalentMind AI explains **why** a candidate was recommended.

Example:

```text
Candidate Rank: #1

Overall Score: 95.8

Reason:
✔ Excellent semantic similarity
✔ Strong Python and Machine Learning experience
✔ Relevant AI projects
✔ High platform engagement
✔ Leadership and teamwork evidence
```

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/TalentMind-AI.git
```

Navigate to the project directory:

```bash
cd TalentMind-AI
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ▶️ Run the Project

```bash
python main.py
```

Or launch the recruiter dashboard:

```bash
streamlit run streamlit_app.py
```

---

## 📊 Output

The system generates:

* Ranked Candidate List
* Confidence Scores
* Explainable Recommendations
* Submission-ready XLSX file
* JSON Ranking Results

---

## 📈 Future Improvements

* Multi-language resume support
* Resume PDF parsing
* LLM-powered interview question generation
* Real-time recruiter chatbot
* Bias detection and fairness evaluation
* Graph Neural Network candidate matching
* Knowledge Graph-based recruitment engine
* Cloud deployment using Docker & Kubernetes

---

## 📸 Screenshots

Add screenshots of:

* Recruiter Dashboard
* Candidate Ranking Table
* Explainability Panel
* Ranking Workflow
* Submission Output

---

## 🧪 Testing

Run validation:

```bash
python validate.py
```

---

## 📄 Challenge Deliverables

* ✅ Public GitHub Repository
* ✅ AI-powered Candidate Ranking System
* ✅ Submission-ready XLSX Output
* ✅ Presentation (PDF)
* ✅ Documentation
* ✅ Explainable AI

---

## 👨‍💻 Author

**GV Sriharish **

B.Tech – Artificial Intelligence & Data Science

Passionate about AI, Machine Learning, NLP, Generative AI, and building intelligent systems that solve real-world problems.

* GitHub: https://github.com/gvsriharish
* LinkedIn: https://www.linkedin.com/in/gvsriharish/

---

## 📜 License

This project is developed for educational and innovation purposes as part of the **INDIA RUNS – Data & AI Challenge**. Feel free to explore, learn from, and extend the project while providing appropriate attribution.
