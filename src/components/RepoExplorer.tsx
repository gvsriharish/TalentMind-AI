import React, { useState, useEffect } from "react";
import { Folder, File, Code, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { CodeFile } from "../types";

export default function RepoExplorer() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/python-code")
      .then(res => res.json())
      .then((data: CodeFile[]) => {
        setFiles(data);
        if (data.length > 0) {
          // Select README.md by default if present, or first file
          const readme = data.find(f => f.name.toLowerCase() === "readme.md") || data[0];
          setSelectedFile(readme);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load repo files:", err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111114] border border-[#1f2937] rounded-xl p-6 shadow-sm text-[#e2e8f0] overflow-hidden flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-indigo-400" />
            TalentMind-AI/ Core Codebase Explorer
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Production-ready Python repository containing dense models, NLP parsers, and custom Streamlit GUIs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#0d0d0f] border border-[#1f2937] text-gray-300 rounded text-[10px] font-mono">
            Python 3.12
          </span>
          <span className="px-2 py-0.5 bg-[#0d0d0f] border border-[#1f2937] text-indigo-400 rounded text-[10px] font-mono">
            FAISS + Sentence Transformers
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Loading repository tree...</p>
        </div>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[500px]">
          {/* File Tree Panel */}
          <div className="md:col-span-4 border-r border-[#1f2937] pr-4 overflow-y-auto flex flex-col gap-1 text-xs">
            <div className="font-bold text-gray-400 mb-2 uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-mono">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              Repository Root Tree
            </div>
            
            {files.map(file => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all font-mono truncate ${
                    isSelected 
                      ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-bold" 
                      : "hover:bg-[#16161a] text-gray-400 hover:text-white"
                  }`}
                  title={file.path}
                >
                  <File className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-8 overflow-hidden flex flex-col border border-[#1f2937] rounded-lg bg-[#0d0d0f]/50">
            {selectedFile && (
              <>
                {/* Code Viewer Header */}
                <div className="flex justify-between items-center bg-[#0d0d0f] border-b border-[#1f2937] p-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-semibold text-gray-300">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 hover:bg-[#16161a] rounded text-gray-400 hover:text-white transition duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Actual code blocks scrolling */}
                <div className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed text-gray-300 selection:bg-indigo-500 selection:text-white">
                  <pre className="whitespace-pre">{selectedFile.content}</pre>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 font-mono text-xs">
          No files identified inside TalentMind-AI/ project root.
        </div>
      )}
    </div>
  );
}
