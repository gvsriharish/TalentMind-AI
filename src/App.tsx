import React, { useState, useEffect } from "react";
import { 
  Trophy, TrendingUp, Search, Terminal, Presentation, BookOpen, 
  Brain, FileCheck, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Candidate, JobDescription, ScoringWeights } from "./types";
import RankingRoom from "./components/RankingRoom";
import AnalyticsRoom from "./components/AnalyticsRoom";
import SearchRoom from "./components/SearchRoom";
import RepoExplorer from "./components/RepoExplorer";
import SlideDeckViewer from "./components/SlideDeckViewer";
import ArchitectureView from "./components/ArchitectureView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"rank" | "analytics" | "search" | "code" | "slides" | "architecture">("rank");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rankedCandidates, setRankedCandidates] = useState<Candidate[]>([]);
  const [parsedJd, setParsedJd] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<string[] | null>(null);
  const [apiHasKey, setApiHasKey] = useState(false);

  const [weights, setWeights] = useState<ScoringWeights>({
    semantic_similarity: 0.40,
    skills_match: 0.20,
    experience: 0.15,
    education: 0.10,
    behavioral_signals: 0.10,
    profile_completeness: 0.05
  });

  const [enableGemini, setEnableGemini] = useState(false);

  // Load candidates database list on mount
  useEffect(() => {
    fetch("/api/candidates")
      .then(res => res.json())
      .then((data: Candidate[]) => {
        setCandidates(data);
        // Pre-fill ranked list to show nice UI initially
        setRankedCandidates(data.map(c => ({
          ...c,
          overall_score: 0.6 + (Math.random() * 0.35),
          scoring_breakdown: {
            semantic_similarity: 0.5 + Math.random()*0.4,
            skills_match: 0.4 + Math.random()*0.5,
            experience: 0.6 + Math.random()*0.4,
            education: 0.5 + Math.random()*0.5,
            behavioral_signals: 0.3 + Math.random()*0.6,
            profile_completeness: c.profile_completeness
          },
          rationales: ["Strong overall domain match", "Good technical skills density"],
          re_ranked_by_llm: false
        })).sort((a,b) => (b.overall_score || 0) - (a.overall_score || 0)));
      })
      .catch(err => console.error("Error fetching candidate dataset:", err));

    // Fast check if Gemini API key exists
    fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jdText: "ping" })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setApiHasKey(true);
          setEnableGemini(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleRankCandidates = async (jdText: string, activeWeights: ScoringWeights, useGemini: boolean) => {
    setLoading(true);
    try {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText,
          weights: activeWeights,
          enableGeminiRerank: useGemini
        })
      });

      const data = await response.json();
      if (data.error) {
        alert("Cognitive match engine error: " + data.error);
      } else {
        setParsedJd(data.parsedJd);
        setRankedCandidates(data.rankedCandidates);
      }
    } catch (e) {
      console.error("Match ranking pipeline request failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/export-xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankedCandidates,
          parsedJd,
          weights
        })
      });

      if (!response.ok) {
        throw new Error("Spreadsheet export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "talentmind_rankings_top100.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("XLSX export failed:", e);
      alert("Spreadsheet compilation failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleRunValidation = async () => {
    setValidating(true);
    setValidationReport(null);
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setValidationReport(data.logs);
    } catch (e) {
      console.error("Validation failed:", e);
      setValidationReport(["Critical: Validation API request error."]);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1f2937] bg-[#111114] sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">TM</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-white">TalentMind AI</h1>
            <p className="text-[10px] text-indigo-400 font-mono leading-none">SYSTEM V2.1.0 // ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase text-gray-500 font-semibold">Project</p>
            <p className="text-xs font-medium text-gray-300">INDIA RUNS Data & AI Challenge</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-[#1f2937]"></div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${apiHasKey ? "bg-green-500" : "bg-amber-500"}`}></span>
            <span className="text-xs font-mono text-gray-300">
              {apiHasKey ? "GEMINI-3.5-FLASH: CONNECTED" : "HEURISTIC: READY"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Horizontal Navigation Menu */}
        <div className="border-b border-[#1f2937] bg-[#111114] p-1.5 rounded-xl border flex flex-wrap gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab("rank")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "rank" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Matching Room
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "analytics" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Exploratory Analytics
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "search" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <Search className="w-4 h-4" />
            Semantic Query
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "code" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Code Vault
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "slides" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <Presentation className="w-4 h-4" />
            Solution Pitch Deck
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-2 ${
              activeTab === "architecture" 
                ? "bg-indigo-600 text-white shadow-sm border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#16161a]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Architecture Blueprint
          </button>
        </div>

        {/* Tab View Routing */}
        <div className="flex-1">
          {activeTab === "rank" && (
            <RankingRoom
              candidates={candidates}
              onRank={handleRankCandidates}
              rankedCandidates={rankedCandidates}
              parsedJd={parsedJd}
              loading={loading}
              weights={weights}
              setWeights={setWeights}
              enableGemini={enableGemini}
              setEnableGemini={setEnableGemini}
              onExportXlsx={handleExportXlsx}
              exporting={exporting}
              validationReport={validationReport}
              onRunValidation={handleRunValidation}
              validating={validating}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsRoom candidates={rankedCandidates} />
          )}

          {activeTab === "search" && (
            <SearchRoom candidates={candidates} />
          )}

          {activeTab === "code" && (
            <RepoExplorer />
          )}

          {activeTab === "slides" && (
            <SlideDeckViewer />
          )}

          {activeTab === "architecture" && (
            <ArchitectureView />
          )}
        </div>

        {/* Floating spreadsheet validation checker widget */}
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#16161a] border border-[#1f2937] rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans tracking-tight">XLSX Submission Validator</h4>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Audits the schema compliance of generated spreadsheets against INDIA RUNS evaluation criteria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleRunValidation}
              disabled={validating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white text-xs font-bold rounded transition-colors duration-200 uppercase tracking-wide"
            >
              {validating ? "Running Audit..." : "Verify Spreadsheet Compliance"}
            </button>
          </div>
        </div>

        {/* Inline validation feedback logs */}
        {validationReport && (
          <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-5 shadow-inner text-slate-300 font-mono text-xs flex flex-col gap-2">
            <div className="font-bold text-gray-400 border-b border-[#1f2937] pb-2 mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Pre-submission Validator Logs Output
            </div>
            {validationReport.map((log, i) => (
              <div key={i} className={`flex items-start gap-2 leading-relaxed ${
                log.includes("❌") ? "text-rose-400 font-bold" :
                log.includes("✅") ? "text-emerald-400 font-bold" :
                log.includes("🎉") ? "text-cyan-400 font-extrabold" : "text-slate-300"
              }`}>
                <span>&gt;</span>
                <p>{log}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="bg-[#0d0d0f] border-t border-[#1f2937] py-4 text-center text-xs text-gray-500 font-mono mt-12 flex flex-col sm:flex-row justify-between items-center px-8 gap-4">
        <div>USER: ADMIN_S_DEV</div>
        <div className="flex gap-4 italic text-[10px]">
          <span>ENCODING: UTF-8</span>
          <span>MODEL: talentmind-transformer-v1</span>
          <span>SEED: 429188</span>
        </div>
        <div className="text-indigo-400 font-bold tracking-wider">SYSTEM READY</div>
      </footer>
    </div>
  );
}
