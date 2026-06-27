import React from "react";
import { Candidate } from "../types";
import { TrendingUp, BarChart3, ScatterChart, Award, GraduationCap, Clock } from "lucide-react";

interface AnalyticsRoomProps {
  candidates: Candidate[];
}

export default function AnalyticsRoom({ candidates }: AnalyticsRoomProps) {
  if (candidates.length === 0) {
    return (
      <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-8 text-center">
        <p className="text-sm text-gray-400 font-mono">
          No rankings database parsed yet. Analyze a job description in the Matching Room first to load analytical graphs.
        </p>
      </div>
    );
  }

  // 1. Calculate General aggregates
  const totalCount = candidates.length;
  const scores = candidates.map(c => c.overall_score || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / totalCount;
  const maxScore = Math.max(...scores);
  
  // Experience brackets
  const expBrackets = {
    "1-3 yrs": candidates.filter(c => c.years_of_experience <= 3).length,
    "4-7 yrs": candidates.filter(c => c.years_of_experience > 3 && c.years_of_experience <= 7).length,
    "8-11 yrs": candidates.filter(c => c.years_of_experience > 7 && c.years_of_experience <= 11).length,
    "12+ yrs": candidates.filter(c => c.years_of_experience > 11).length
  };

  // Education breakdown
  const eduBreakdown = {
    "PhD": candidates.filter(c => c.education.degree.toLowerCase().includes("phd") || c.education.degree.toLowerCase().includes("doc")).length,
    "Master's": candidates.filter(c => c.education.degree.toLowerCase().includes("master") || c.education.degree.toLowerCase().includes("ms") || c.education.degree.toLowerCase().includes("mtech")).length,
    "Bachelor's": candidates.filter(c => c.education.degree.toLowerCase().includes("bach") || c.education.degree.toLowerCase().includes("btech") || c.education.degree.toLowerCase().includes("be")).length,
  };

  // Calculate top skills density
  const allSkills: Record<string, number> = {};
  candidates.forEach(c => {
    c.technical_skills.forEach(s => {
      allSkills[s] = (allSkills[s] || 0) + 1;
    });
  });
  const topSkills = Object.entries(allSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSkillCount = Math.max(...topSkills.map(s => s[1]));

  return (
    <div className="flex flex-col gap-6 text-[#e2e8f0]">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider font-mono">Average Suitability</span>
            <h4 className="text-2xl font-bold text-white mt-0.5 font-mono">{(avgScore * 100).toFixed(1)}%</h4>
          </div>
        </div>

        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider font-mono">Median Exp Tenure</span>
            <h4 className="text-2xl font-bold text-white mt-0.5 font-mono">
              {(candidates.reduce((sum, c) => sum + c.years_of_experience, 0) / totalCount).toFixed(1)} Yrs
            </h4>
          </div>
        </div>

        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider font-mono">PhD & MS Ratio</span>
            <h4 className="text-2xl font-bold text-white mt-0.5 font-mono">
              {(((eduBreakdown["PhD"] + eduBreakdown["Master's"]) / totalCount) * 100).toFixed(0)}%
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Bracket Distribution - SVG Bar Chart */}
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5 font-mono">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Tenure Bracket Distributions (Years of Experience)
          </h3>

          <div className="flex flex-col gap-4">
            {Object.entries(expBrackets).map(([bracket, count]) => {
              const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={bracket} className="flex items-center gap-4">
                  <span className="w-20 text-xs font-bold text-gray-300 font-mono">{bracket}</span>
                  <div className="flex-1 bg-[#0d0d0f] border border-gray-800 h-6 rounded overflow-hidden relative">
                    <div 
                      className="bg-indigo-600 h-full rounded-sm transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 font-mono">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top matching competencies - Horizontal Progress */}
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5 font-mono">
            <Award className="w-4 h-4 text-indigo-400" />
            Skill Overlaps Frequency Across Candidates
          </h3>

          <div className="flex flex-col gap-4">
            {topSkills.map(([skill, count]) => {
              const percentage = maxSkillCount > 0 ? (count / maxSkillCount) * 100 : 0;
              return (
                <div key={skill} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300 font-mono">{skill}</span>
                    <span className="text-indigo-400 font-mono text-[10px]">{count} profiles containing</span>
                  </div>
                  <div className="w-full bg-[#0d0d0f] border border-gray-800 h-3 rounded overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG Scatter Plot - Semantic Score vs Skills Score */}
      <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
          <ScatterChart className="w-4 h-4 text-indigo-400" />
          Semantic Similarity Matrix vs Technical Skills Match Percentage
        </h3>
        <p className="text-xs text-gray-400 mb-6 font-sans">
          Maps candidates on a two-dimensional grid to segment dense semantic fit against explicit required keywords.
        </p>

        <div className="relative border-l border-b border-gray-800 h-64 w-full mt-4 flex items-end bg-[#0d0d0f]/40 rounded-br">
          {/* Scatter dots */}
          {candidates.slice(0, 30).map((cand, i) => {
            const sem = cand.scoring_breakdown?.semantic_similarity || 0.5;
            const skl = cand.scoring_breakdown?.skills_match || 0.5;
            
            // Map 0.3-1.0 range to 5% to 95% coordinates
            const xPct = 5 + ((skl - 0.2) / 0.8) * 90;
            const yPct = 5 + ((sem - 0.3) / 0.7) * 90;

            return (
              <div
                key={cand.id}
                className="absolute w-3.5 h-3.5 rounded-full bg-indigo-500/80 border border-[#0a0a0c] hover:bg-indigo-400 hover:scale-125 hover:shadow-[0_0_12px_rgba(99,102,241,0.8)] cursor-pointer group transition-all"
                style={{ 
                  left: `${Math.max(5, Math.min(95, xPct))}%`, 
                  bottom: `${Math.max(5, Math.min(95, yPct))}%` 
                }}
              >
                {/* Custom tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-5 hidden group-hover:block bg-[#16161a] border border-[#1f2937] text-white text-[10px] p-2.5 rounded shadow-xl min-w-[150px] z-50 pointer-events-none">
                  <p className="font-bold text-white truncate border-b border-gray-800 pb-1 mb-1">{cand.name}</p>
                  <p className="font-mono text-gray-400">Skill Match: <span className="text-indigo-400">{(skl*100).toFixed(0)}%</span></p>
                  <p className="font-mono text-gray-400">Semantic Fit: <span className="text-indigo-400">{(sem*100).toFixed(0)}%</span></p>
                </div>
              </div>
            );
          })}

          {/* Grid axes labels */}
          <div className="absolute right-4 bottom-2 text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">
            Explicit Skills match →
          </div>
          <div className="absolute left-2 top-2 text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider origin-top-left rotate-90 translate-y-2">
            Semantic Vector Fit →
          </div>
        </div>
      </div>
    </div>
  );
}
