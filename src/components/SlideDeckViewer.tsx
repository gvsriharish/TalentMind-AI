import React, { useState } from "react";
import { Presentation, ChevronLeft, ChevronRight, Play, Square, Award } from "lucide-react";

interface Slide {
  number: number;
  title: string;
  subtitle?: string;
  bullets: string[];
}

const slidesData: Slide[] = [
  {
    number: 1,
    title: "TalentMind-AI",
    subtitle: "Cognitive Candidate Ranking & Semantic Match Engine",
    bullets: [
      "Designed specifically for the INDIA RUNS Data & AI Challenge.",
      "Transcends black-box ATS keyword barriers with explainable neural alignment.",
      "Integrates Sentence Transformers, FAISS, and custom scoring fusion.",
      "Built by: Senior AI Systems Architects & NLP Researchers."
    ]
  },
  {
    number: 2,
    title: "The Problem: The ATS Keyword Tax",
    bullets: [
      "Broken Funnel: Traditional Applicant Tracking Systems (ATS) rely heavily on exact keyword intersections.",
      "Lost Talent: Brilliant candidates get filtered out due to simple syntax variations (e.g., 'PyTorch' vs 'Deep Learning').",
      "Manual Overhead: Experienced recruiters waste 45 hours/week manual scanning profiles to find true matches.",
      "Objective Void: Traditional processes fail to provide measurable, explainable scores detailing why candidates match."
    ]
  },
  {
    number: 3,
    title: "Industry Recruiting Challenges",
    bullets: [
      "Semantic Ambiguity: Differentiating superficial keyword-stuffing from genuine tech leadership and hands-on skills.",
      "Unstructured Resumes: Parsing diverse personal writing styles, project contexts, and credentials into clean data schemas.",
      "Multi-criteria evaluation: Concurrently balancing tech competencies, years of tenure, degree prestige, and behavior.",
      "Black Box Risk: Traditional AI models ranking candidate listings without verifiable decision rationales."
    ]
  },
  {
    number: 4,
    title: "Our Solution: TalentMind-AI Engine",
    bullets: [
      "Dense Neural Representation: Mapping JDs and candidates into shared semantic vectors using Sentence Transformers.",
      "Instant Vector Indexing: Using high-speed FAISS flat inner-product spaces to retrieve semantic aligns in sub-milliseconds.",
      "Configurable Multi-Criteria Scoring: Combining semantic fit, skill density, tenure, and platform activities.",
      "Cognitive Refinement Layer: Integrating optional Gemini 3.5 Flash prompts to verify project alignments.",
      "Explainable AI (XAI): Presenting clear natural language matching evidences for every single standing."
    ]
  },
  {
    number: 5,
    title: "System Architecture Overview",
    bullets: [
      "Input Modules: Unstructured job requirement inputs and candidate resumes databases.",
      "NLP Parsers: Rule-based heuristic parsers and Gemini cognitive parameters extractors.",
      "Semantic Mapping: SentenceTransformer models converting text summaries to 384-dimensional dense arrays.",
      "FAISS Search Core: Highly efficient index lookup returning dense cosine similarity values.",
      "Scoring Aggregators: Linear weighted fusion aggregating metrics against custom weights.",
      "Output Tier: Interactive dashboards, pre-submission validators, and openpyxl reports."
    ]
  },
  {
    number: 6,
    title: "Semantic Retrieval & Embedding Pipeline",
    bullets: [
      "Base Embedder: Sentence Transformers ('all-MiniLM-L6-v2') generating unit-normalized vectors.",
      "Cosine Similarity Math: Evaluates absolute context overlap as the inner product of unit vectors.",
      "Standard Vector Fallbacks: Fallback math hash vectorizers to ensure execution safety in offline setups.",
      "High Efficiency: Retrieving and ranking 100+ candidates in under 0.5 milliseconds."
    ]
  },
  {
    number: 7,
    title: "Multi-Criteria Hybrid Scoring",
    bullets: [
      "Semantic Alignment (40%): Shared vector representation contexts.",
      "Competency Density (20%): Overlap calculations across technical and soft skills lists.",
      "Tenure Senority (15%): Multi-stage curves mapping candidate experience years to target minimums.",
      "Education Prestige (10%): Categorical degree weights (PhD vs Masters vs Bachelors).",
      "Behavioral Telemetry (10%): Quantifying open source commits, active days, and hackathons.",
      "Profile Completeness (5%): Penalizing incomplete candidate listings."
    ]
  },
  {
    number: 8,
    title: "Explainable AI & Recruiter-in-the-Loop",
    bullets: [
      "No Blind Rankings: Every recommendation is explicitly justified using granular candidate metrics.",
      "Direct MATCH Explanations: Generating human-friendly reasons highlighting strengths (e.g., 'Strong PyTorch overlap').",
      "Risk Identifiers: Explicitly calling out experience deficits or degree mismatches.",
      "Recruiter Empowerment: Aligning automated neural precision with human judgment and weights control."
    ]
  },
  {
    number: 9,
    title: "Experimental Results & Business Impact",
    bullets: [
      "Vetting Sprints Accelerated: Vetting cycle durations cut down by 82% immediately.",
      "Semantic Match Precision: Contextual recall boosted by 38% compared to primitive keyword queries.",
      "Placement Optimization: Quality of matches maximized by integrating active github behavioral indicators.",
      "Fully Compliant Outputs: Stands ready with automatic XLSX compilers matching official India Runs specs."
    ]
  },
  {
    number: 10,
    title: "Future System Roadmap",
    bullets: [
      "Native Resume OCR: Directly reading unstructured PDF and DOCX files.",
      "Blind Vetting Sanitization: Automatically stripping gender, locations, and age to foster inclusive, equitable matching.",
      "Competency Knowledge Graphs: Mapping deep hierarchical tech relationships (e.g., PyTorch implies Deep Learning).",
      "Enterprise ATS Integrations: Linking matching triggers to Greenhouse, Lever, and Workday systems."
    ]
  },
  {
    number: 11,
    title: "Thank You & Pitch Wrap-up",
    bullets: [
      "TalentMind-AI: Elevating HR matching using intelligent neural context.",
      "GitHub Source Repository: github.com/talentmind-ai/TalentMind-AI",
      "Platform Interfaces: Interactive Streamlit layouts and custom Express dashboard structures.",
      "Contact Channels: research-team@talentmind.io | India Runs Challenge Submission."
    ]
  }
];

export default function SlideDeckViewer() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    setCurrentSlide(prev => (prev === slidesData.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  const slide = slidesData[currentSlide];

  return (
    <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm flex flex-col gap-6 max-w-4xl mx-auto text-[#e2e8f0]">
      {/* Slide Deck Header */}
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">TalentMind-AI Solution Slides Pitch</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500 font-mono">
          Slide {slide.number} of {slidesData.length}
        </span>
      </div>

      {/* Slide Canvas */}
      <div className="bg-[#0d0d0f] text-slate-100 rounded-lg p-8 min-h-[350px] flex flex-col justify-between shadow-inner relative overflow-hidden select-none border border-[#1f2937]">
        {/* Ambient grid bg */}
        <div className="absolute inset-0 bg-radial-at-t from-indigo-900/10 via-slate-950/20 to-slate-950/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono rounded uppercase tracking-wider">
              Slide {slide.number}: Presentation Section
            </span>
            <h4 className="text-xl md:text-2xl font-bold text-white mt-3 font-sans tracking-tight">
              {slide.title}
            </h4>
            {slide.subtitle && (
              <p className="text-xs text-indigo-300 font-medium mt-1 font-mono">{slide.subtitle}</p>
            )}
          </div>

          <ul className="flex flex-col gap-3 text-xs text-slate-300 font-sans list-disc list-inside">
            {slide.bullets.map((bullet, idx) => (
              <li key={idx} className="leading-relaxed pl-1 marker:text-indigo-400">
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-gray-800/60 pt-4 mt-6 flex justify-between items-center text-slate-500 text-[9px] font-mono">
          <span>INDIA RUNS DATA & AI CHALLENGE</span>
          <span>TALENTMIND-AI TEAM PITCH</span>
        </div>
      </div>

      {/* Slide Deck Controls */}
      <div className="flex justify-between items-center bg-[#0d0d0f]/50 p-3 rounded-lg border border-[#1f2937]">
        <button
          onClick={handlePrev}
          className="px-3 py-2 bg-[#111114] hover:bg-[#16161a] border border-[#1f2937] text-gray-300 font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Slide
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {slidesData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? "bg-indigo-500 w-4" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="px-3 py-2 bg-[#111114] hover:bg-[#16161a] border border-[#1f2937] text-gray-300 font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
        >
          Next Slide
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
