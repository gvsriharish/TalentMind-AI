import React, { useState, useEffect } from "react";
import { 
  Sliders, Brain, Sparkles, Download, CheckCircle, AlertCircle, FileText, 
  ChevronRight, ArrowRight, Award, Trophy, GraduationCap, ShieldCheck 
} from "lucide-react";
import { Candidate, JobDescription, ScoringWeights } from "../types";

interface RankingRoomProps {
  candidates: Candidate[];
  onRank: (jdText: string, weights: ScoringWeights, enableGemini: boolean) => Promise<void>;
  rankedCandidates: Candidate[];
  parsedJd: JobDescription | null;
  loading: boolean;
  weights: ScoringWeights;
  setWeights: React.Dispatch<React.SetStateAction<ScoringWeights>>;
  enableGemini: boolean;
  setEnableGemini: (v: boolean) => void;
  onExportXlsx: () => void;
  exporting: boolean;
  validationReport: string[] | null;
  onRunValidation: () => void;
  validating: boolean;
}

const DEFAULT_JD_TEMPLATE = `Job Title: Senior AI & Deep Learning Research Engineer
Department: Cognitive Research Lab
Experience Required: 5+ Years
Target Education: Master's or Ph.D. in Computer Science or Mathematics.

About the Role:
We are seeking an experienced Senior AI Engineer to join our core research team. You will be responsible for designing and implementing advanced Natural Language Processing (NLP) solutions, fine-tuning state-of-the-art transformer architectures, and setting up scalable semantic search vector databases. The ideal candidate has deep expertise in training models using PyTorch, writing complex SQL queries, and containerizing distributed microservices using Docker.

Primary Responsibilities:
- Design, fine-tune, and evaluate deep learning architectures (BERT, RoBERTa, custom GPTs) for dense text representation.
- Construct scalable vector retrieval search indexes (FAISS) for semantic alignment matches.
- Deploy secure ML APIs utilizing Docker and FastAPI on cloud services (AWS/GCP).
- Mentor junior NLP researchers and contribute to structural agile sprints.`;

export default function RankingRoom({
  candidates,
  onRank,
  rankedCandidates,
  parsedJd,
  loading,
  weights,
  setWeights,
  enableGemini,
  setEnableGemini,
  onExportXlsx,
  exporting,
  validationReport,
  onRunValidation,
  validating
}: RankingRoomProps) {
  const [jdText, setJdText] = useState(DEFAULT_JD_TEMPLATE);
  const [activeSlice, setActiveSlice] = useState<number>(10);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    setWeights(prev => {
      const updated = { ...prev, [key]: Math.round(value * 100) / 100 };
      return updated;
    });
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(totalWeight - 1.0) < 0.01;

  const currentSliceCandidates = rankedCandidates.slice(0, activeSlice);

  useEffect(() => {
    if (currentSliceCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(currentSliceCandidates[0]);
    }
  }, [currentSliceCandidates, selectedCandidate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar - Controls & Custom Weights */}
      <div className="lg:col-span-4 bg-[#111114] border border-[#1f2937] rounded-xl p-6 flex flex-col gap-6 text-[#e2e8f0]">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Matching Criteria Weights
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Re-weight the metrics according to your company priorities. Sum must equal 100%.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Semantic Vector Fit</span>
              <span className="font-mono text-indigo-400">{(weights.semantic_similarity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.semantic_similarity}
              onChange={(e) => handleWeightChange("semantic_similarity", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Technical & Soft Skills Overlap</span>
              <span className="font-mono text-indigo-400">{(weights.skills_match * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.skills_match}
              onChange={(e) => handleWeightChange("skills_match", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Years of Exp & Seniority</span>
              <span className="font-mono text-indigo-400">{(weights.experience * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.experience}
              onChange={(e) => handleWeightChange("experience", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Education Alignment & Degree</span>
              <span className="font-mono text-indigo-400">{(weights.education * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.education}
              onChange={(e) => handleWeightChange("education", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Platform Behavioral Telemetry</span>
              <span className="font-mono text-indigo-400">{(weights.behavioral_signals * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.behavioral_signals}
              onChange={(e) => handleWeightChange("behavioral_signals", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
              <span>Profile Completeness Density</span>
              <span className="font-mono text-indigo-400">{(weights.profile_completeness * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.profile_completeness}
              onChange={(e) => handleWeightChange("profile_completeness", parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Weights Balance Status */}
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          isBalanced 
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
            : "bg-amber-950/20 border-amber-500/30 text-amber-400"
        }`}>
          {isBalanced ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            Total Weights: <strong className="font-mono">{(totalWeight * 100).toFixed(0)}%</strong>
            {!isBalanced && ` (must equal 100%, adjust sliders)`}
          </span>
        </div>

        {/* Gemini cognitive re-ranking toggle */}
        <div className="border-t border-[#1f2937] pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 font-sans">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              Gemini Cognitive Re-ranking
            </span>
            <button
              onClick={() => setEnableGemini(!enableGemini)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableGemini ? "bg-indigo-600" : "bg-gray-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  enableGemini ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            Uses real-time LLM reasoning to adjust standings based on project context nuance.
          </p>
        </div>
      </div>

      {/* Main Panel - JD upload & parsed results */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-[#e2e8f0]">
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 font-mono">
            <FileText className="w-4 h-4 text-indigo-400" />
            Unstructured Job Description (JD)
          </h3>
          
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste your job description text here..."
            className="w-full h-44 p-4 border border-[#1f2937] rounded-lg text-sm text-gray-200 font-mono focus:outline-none focus:border-indigo-500 bg-[#0d0d0f]"
          />

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setJdText("")}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear Workspace
            </button>
            <button
              onClick={() => onRank(jdText, weights, enableGemini)}
              disabled={loading || !isBalanced || !jdText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#16161a] disabled:text-gray-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aligning Vectors...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze & Rank Candidates
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rank Rankings Results List */}
        {rankedCandidates.length > 0 && (
          <div className="bg-[#111114] border border-[#1f2937] rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Header Controls */}
            <div className="p-6 border-b border-[#1f2937] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#16161a]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  🏆 Match Standings Rankings
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-sans">
                  Top matches calculated dynamically via dense representation vector indexes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-[#1f2937] bg-[#0d0d0f] p-0.5">
                  {[10, 25, 50, 100].map(slice => (
                    <button
                      key={slice}
                      onClick={() => {
                        setActiveSlice(slice);
                        setSelectedCandidate(rankedCandidates[0]);
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-all ${
                        activeSlice === slice 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "text-gray-400 hover:text-white hover:bg-[#111114]"
                      }`}
                    >
                      Top {slice}
                    </button>
                  ))}
                </div>

                <button
                  onClick={onExportXlsx}
                  disabled={exporting}
                  className="px-3 py-1 bg-[#0d0d0f] border border-[#1f2937] text-gray-300 hover:text-white hover:bg-[#16161a] disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs font-bold uppercase tracking-wider transition duration-200 flex items-center gap-1.5"
                  title="Export to polished Excel spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Core Split Rankings Interface */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
              {/* Left Side: Candidates list */}
              <div className="md:col-span-5 border-r border-[#1f2937] max-h-[500px] overflow-y-auto bg-[#0d0d0f]/20">
                {currentSliceCandidates.map((cand, idx) => {
                  const scorePct = cand.overall_score ? Math.round(cand.overall_score * 100) : 0;
                  const isSelected = selectedCandidate?.id === cand.id;

                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 border-b border-[#1f2937] cursor-pointer transition-all flex items-center justify-between hover:bg-indigo-600/5 ${
                        isSelected ? "bg-indigo-600/10 border-l-4 border-l-indigo-500 pl-3" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          idx === 0 ? "bg-amber-950/50 text-amber-400 border border-amber-500/30" :
                          idx === 1 ? "bg-slate-800 text-slate-300 border border-slate-700/50" :
                          idx === 2 ? "bg-orange-950/50 text-orange-400 border border-orange-500/30" : "bg-gray-900 text-gray-400 border border-gray-800"
                        }`}>
                          {String(idx + 1).padStart(3, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            {cand.name}
                            {cand.re_ranked_by_llm && (
                              <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" title="Cognitively refined by Gemini AI" />
                            )}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono">{cand.id}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-green-400 font-mono">{scorePct}% Match</span>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{cand.years_of_experience} yrs exp</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Candidate detailed analysis */}
              <div className="md:col-span-7 p-6 max-h-[500px] overflow-y-auto bg-[#0d0d0f]/50">
                {selectedCandidate ? (
                  <div className="flex flex-col gap-6">
                    {/* Candidate Identity Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-white">{selectedCandidate.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{selectedCandidate.email}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-[#16161a] border border-[#1f2937] text-indigo-300 text-[10px] rounded font-mono font-semibold">
                            {selectedCandidate.education.degree} - {selectedCandidate.education.major}
                          </span>
                          <span className="px-2 py-0.5 bg-[#16161a] border border-[#1f2937] text-indigo-300 text-[10px] rounded font-mono font-semibold">
                            {selectedCandidate.years_of_experience} Years Exp
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-green-400 font-mono">
                          {selectedCandidate.overall_score ? Math.round(selectedCandidate.overall_score * 100) : 0}%
                        </span>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-wider font-mono">Total score</p>
                      </div>
                    </div>

                    {/* Breakdown metrics visual bars */}
                    {selectedCandidate.scoring_breakdown && (
                      <div className="p-4 bg-[#16161a] border border-[#1f2937] rounded-lg">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
                          📊 Compatibility Breakdown
                        </h5>
                        <div className="flex flex-col gap-3 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                              <span>Semantic Similarity (40%)</span>
                              <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.semantic_similarity * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.semantic_similarity * 100}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                              <span>Skills Overlap Match (20%)</span>
                              <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.skills_match * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.skills_match * 100}%` }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                                <span>Experience (15%)</span>
                                <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.experience * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.experience * 100}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                                <span>Education (10%)</span>
                                <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.education * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.education * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                                <span>Behavioral (10%)</span>
                                <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.behavioral_signals * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.behavioral_signals * 100}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] text-gray-400 mb-0.5 font-mono">
                                <span>Completeness (5%)</span>
                                <span className="font-mono font-bold text-indigo-400">{(selectedCandidate.scoring_breakdown.profile_completeness * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.scoring_breakdown.profile_completeness * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gemini AI Reranker Insight box */}
                    {selectedCandidate.re_ranked_by_llm && selectedCandidate.llm_insight && (
                      <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-200">
                        <h5 className="font-bold flex items-center gap-1.5 mb-1.5 text-indigo-400 uppercase tracking-wider text-[10px] font-mono">
                          <Brain className="w-4 h-4 text-indigo-400" />
                          Cognitive Reranking Auditor Rationale
                        </h5>
                        <p className="leading-relaxed italic font-sans">
                          &ldquo;{selectedCandidate.llm_insight}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Explainable AI (XAI) Rationales list */}
                    {selectedCandidate.rationales && (
                      <div className="flex flex-col gap-2">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          Explainable AI Matching Evidence
                        </h5>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-300 font-sans">
                          {selectedCandidate.rationales.map((rat, i) => (
                            <div key={i} className="flex gap-2 items-start leading-relaxed bg-[#111114] border border-[#1f2937] p-2.5 rounded-lg">
                              <span className="text-green-400 font-extrabold mt-0.5">✓</span>
                              <p>{rat}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Competencies checklist */}
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Award className="w-4 h-4 text-indigo-400" />
                        Skills Matrix
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.technical_skills.map(sk => {
                          const isMatch = parsedJd?.technical_skills.some(s => s.toLowerCase() === sk.toLowerCase());
                          return (
                            <span
                              key={sk}
                              className={`px-2.5 py-1 text-xs rounded border font-semibold font-mono ${
                                isMatch 
                                  ? "bg-[#111114] border-emerald-500/40 text-emerald-400" 
                                  : "bg-[#16161a] border-[#1f2937] text-gray-400"
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400 font-mono">
                    Select a candidate from the stands to inspect their audit report.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
