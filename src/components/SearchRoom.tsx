import React, { useState } from "react";
import { Search, Brain, Award, GraduationCap, ChevronRight } from "lucide-react";
import { Candidate } from "../types";

interface SearchRoomProps {
  candidates: Candidate[];
}

export default function SearchRoom({ candidates }: SearchRoomProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setTimeout(() => {
      const searchTerms = query.toLowerCase().replace(/[,;]/g, " ").split(/\s+/).filter(Boolean);
      
      const scored = candidates.map(cand => {
        let matchScore = 0;
        const matchedSkills: string[] = [];

        // Match technical skills
        cand.technical_skills.forEach(skill => {
          const sLower = skill.toLowerCase();
          if (searchTerms.some(term => sLower.includes(term) || term.includes(sLower))) {
            matchScore += 2;
            matchedSkills.push(skill);
          }
        });

        // Match education major or degree
        const eduStr = `${cand.education.major} ${cand.education.degree} ${cand.education.institution}`.toLowerCase();
        searchTerms.forEach(term => {
          if (eduStr.includes(term)) {
            matchScore += 1;
          }
        });

        // Normalize matching score
        const search_similarity = Math.min(0.99, 0.2 + (matchScore / (searchTerms.length * 2 + 1)));

        return {
          ...cand,
          search_similarity,
          matched_query_skills: matchedSkills
        };
      });

      // Sort by search relevance
      const filtered = scored
        .filter(c => c.search_similarity && c.search_similarity > 0.25)
        .sort((a, b) => (b.search_similarity || 0) - (a.search_similarity || 0));

      setResults(filtered.slice(0, 15));
      setSearching(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6 text-[#e2e8f0]">
      <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2 font-mono">
          <Search className="w-4 h-4 text-indigo-400" />
          Conversational Semantic Search
        </h3>
        <p className="text-xs text-gray-400 mb-6 font-sans">
          Search for talent using unstructured questions or competencies (e.g., &ldquo;experienced PyTorch researcher with PhD degree&rdquo;).
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type search queries here... (e.g., Python FastAPI docker pipelines)"
            className="flex-1 p-3.5 border border-[#1f2937] rounded-lg text-sm text-gray-200 font-mono focus:outline-none focus:border-indigo-500 bg-[#0d0d0f]"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#16161a] disabled:text-gray-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {searching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Run Query"
            )}
          </button>
        </form>
      </div>

      {results.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Search Matches ({results.length} found)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(cand => (
              <div 
                key={cand.id} 
                className="bg-[#111114] border border-[#1f2937] rounded-xl p-5 shadow-sm hover:border-[#2b3a4a] transition duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-white text-sm">{cand.name}</h5>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{cand.id} | {cand.email}</p>
                    </div>
                    <div className="px-2.5 py-1 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 text-xs font-bold font-mono rounded">
                      {cand.search_similarity ? Math.round(cand.search_similarity * 100) : 0}% Fit
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      {cand.education.degree} ({cand.years_of_experience} yrs exp)
                    </span>
                  </div>

                  {cand.matched_query_skills && cand.matched_query_skills.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Matched Keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {cand.matched_query_skills.map(sk => (
                          <span key={sk} className="px-2 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#1f2937] pt-3 flex items-center justify-between text-xs text-gray-400">
                  <span className="truncate max-w-[250px] italic">
                    {cand.work_experience[0]?.title} at {cand.work_experience[0]?.company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query && !searching ? (
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400 font-mono">
            No candidates matched your search criteria. Try using simpler industry keywords (e.g., Python, Docker, PyTorch).
          </p>
        </div>
      ) : (
        <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-8 text-center text-gray-400 text-xs font-mono">
          Execute a semantic query above to search candidates instantly.
        </div>
      )}
    </div>
  );
}
