import React from "react";
import { BookOpen, Layout, Network, Cpu, Settings } from "lucide-react";

export default function ArchitectureView() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto text-[#e2e8f0]">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 to-[#111114] border border-[#1f2937] rounded-xl p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono rounded uppercase tracking-wider">
            Technical Blueprint & Maths Documentation
          </span>
          <h3 className="text-2xl font-bold text-white mt-4 font-sans tracking-tight">
            How TalentMind-AI Algorithmic Models Perform Matching
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans max-w-2xl">
            A comprehensive review of dense vector representation, Jaccard list-overlaps, scale-invariant experience metrics, and dual-layer cognitive audits.
          </p>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vector Retrieval Mechanics */}
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
          <div className="w-10 h-10 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2 font-mono">1. Dense Representation & Vector Similarity</h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            The job description and candidate profiles are summarized and projected into a 384-dimensional semantic space (R-384) using the <strong>all-MiniLM-L6-v2</strong> sentence transformer.
          </p>
          <div className="p-4 bg-[#0d0d0f] border border-[#1f2937] rounded-lg text-xs font-mono text-gray-300 leading-relaxed">
            <span className="text-gray-500">// Unit Normalized Cosine Formula:</span>
            <br />
            Similarity = DotProduct(JD, Cand) / (||JD|| * ||Cand||)
            <br />
            <br />
            In FAISS: Vectors are pre-L2-normalized, reducing search to Flat Inner Product matrix multiplication.
          </div>
        </div>

        {/* Multi-Criteria Scoring Formula */}
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
          <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
            <Settings className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2 font-mono">2. Composite Score Fusion</h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Candidate listings are evaluated across multiple criteria, ensuring experienced talent isn't filtered out by superficial keyword variations.
          </p>
          <div className="p-4 bg-[#0d0d0f] border border-[#1f2937] rounded-lg text-xs font-mono text-gray-300 leading-relaxed">
            Overall Score =
            <br />
            &nbsp;&nbsp;0.40 * Semantic Similarity
            <br />
            + 0.20 * Skills Density Fit
            <br />
            + 0.15 * Experience Tenure (Clamped Curve)
            <br />
            + 0.10 * Education Tier Weight
            <br />
            + 0.10 * Behavioral Commits Metric
            <br />
            + 0.05 * Profile Completeness
          </div>
        </div>
      </div>

      {/* Experience Clamping Details */}
      <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-mono">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Tenure Clamping Curve Algorithm
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          The candidate's years of experience (E-cand) is mapped against the JD's minimum required experience (E-req) using a multi-stage non-linear curve. This prevents over-penalizing junior profiles with exceptional skill matrices, while rewarding candidates who surpass the required tenure threshold:
        </p>
        <div className="p-4 bg-[#0d0d0f] border border-[#1f2937] text-indigo-400 font-mono text-xs rounded-lg flex flex-col gap-2 leading-relaxed">
          <div>If Candidate Experience &gt;= Required Experience + 2 Years:</div>
          <div className="text-white">&nbsp;&nbsp;Score = 1.0</div>
          
          <div className="mt-2">If Required Experience &lt;= Candidate Experience &lt; Required Experience + 2 Years:</div>
          <div className="text-white">&nbsp;&nbsp;Score = 0.9 + (0.1 * (Cand - Req) / 2)</div>
          
          <div className="mt-2">If Candidate Experience &lt; Required Experience:</div>
          <div className="text-white">&nbsp;&nbsp;Score = Candidate Experience / Required Experience</div>
        </div>
      </div>
    </div>
  );
}
