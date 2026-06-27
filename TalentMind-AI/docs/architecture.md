# Technical Architecture & Vector Retrieval Mechanics

This document details the software design, mathematics, and algorithmic pipelines of **TalentMind-AI**.

---

## 🛰️ 1. Embedding Strategy & Math

The vector space matching operates by embedding unstructured textual descriptions into a shared $D$-dimensional real-valued vector space $\mathbb{R}^{384}$ using `all-MiniLM-L6-v2`.

Let $\vec{q}$ be the embedded vector representing the parsed requirements of the Job Description (JD).
Let $\vec{d}_i$ be the embedded vector representing the summary of candidate $i$.

The similarity between the job description and candidate is evaluated via the Cosine Similarity metric:

$$\text{CosineSimilarity}(\vec{q}, \vec{d}_i) = \frac{\vec{q} \cdot \vec{d}_i}{\|\vec{q}\|_2 \|\vec{d}_i\|_2}$$

In our FAISS implementation:
1. Vectors are pre-normalized to have an L2 norm of 1.0:
   $$\vec{d}_i^{\text{norm}} = \frac{\vec{d}_i}{\|\vec{d}_i\|_2}$$
2. The search is initialized using `faiss.IndexFlatIP` (Flat Inner Product index).
3. The inner product of normalized vectors yields exact Cosine Similarity:
   $$\langle \vec{q}^{\text{norm}}, \vec{d}_i^{\text{norm}} \rangle = \vec{q}^{\text{norm}} \cdot \vec{d}_i^{\text{norm}} = \text{CosineSimilarity}(\vec{q}, \vec{d}_i)$$
This reduces search complexity to $O(N \cdot D)$ with extremely low execution overhead, enabling sub-millisecond retrieval.

---

## 🧩 2. Multi-Criteria Aggregation & Scoring Fusion

The final ranking of candidates is not solely determined by semantic vector similarities, which are prone to matching synonyms without assessing concrete credentials (e.g., years of experience).

To ensure objective matching, the overall score $S_{\text{final}}$ is calculated as a weighted linear combination of six normalized sub-scores:

$$S_{\text{final}} = w_1 S_{\text{semantic}} + w_2 S_{\text{skills}} + w_3 S_{\text{experience}} + w_4 S_{\text{education}} + w_5 S_{\text{behavioral}} + w_6 S_{\text{completeness}}$$

Where:
- $w_1 = 0.40$ (Semantic vector overlap)
- $w_2 = 0.20$ (Technical and soft skills Jaccard index)
- $w_3 = 0.15$ (Seniority requirements satisfaction curve)
- $w_4 = 0.10$ (Education tier mapping)
- $w_5 = 0.10$ (Platform behavioral activity score)
- $w_6 = 0.05$ (Profile completeness)

### Experience Scoring Curve
To prevent negative scores, years of experience $E_{\text{cand}}$ relative to requested experience $E_{\text{req}}$ is scored using a clamped threshold:

$$S_{\text{experience}} = \begin{cases} 
      1.0 & \text{if } E_{\text{cand}} \geq E_{\text{req}} + 2 \\
      0.9 + \left(0.1 \times \frac{E_{\text{cand}} - E_{\text{req}}}{2}\right) & \text{if } E_{\text{req}} \leq E_{\text{cand}} < E_{\text{req}} + 2 \\
      \frac{E_{\text{cand}}}{E_{\text{req}}} & \text{if } E_{\text{cand}} < E_{\text{req}}
   \end{cases}$$

---

## 🧠 3. Gemini LLM Re-Ranking Layer

When enabled, the top-ranked candidate slice (top 15 profiles) is dispatched to `gemini-3.5-flash` for high-cognitive evaluation.

```text
               +----------------------------------+
               |  Top 15 Hybrid Candidates (Base) |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |   Gemini Prompt Assembly:        |
               |   - Unstructured Job Description  |
               |   - Clean Candidate Work/Projects|
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |  Cognitive Analysis (LLM Core):  |
               |  - Synthesizes project details   |
               |  - Adjusts scores (+/- 0.08)     |
               |  - Creates custom 'llm_insight'  |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |    Optimized Final Standings     |
               +----------------------------------+
```

This layer detects complex patterns (such as candidates who ran major migrations or achieved breakthroughs) that standard numerical algorithms overlook, while preventing LLM hallucination by restricting score shifts to $\pm 8\%$.
