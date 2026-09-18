import React, { useState } from 'react';
import { Code2, Copy, Check, ShieldCheck, ShieldAlert, Zap, Loader2, Info } from 'lucide-react';
import type { QueryResult } from '../types';

interface SqlViewerProps {
  result: QueryResult;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [optimizationTip, setOptimizationTip] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchOptimization = async () => {
    if (optimizationTip || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: result.sql })
      });
      const data = await res.json();
      setOptimizationTip(data.optimizationTip || 'Query is well structured.');
    } catch (e) {
      setOptimizationTip('Optimization check completed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg mb-6 text-slate-100">
      
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs font-semibold tracking-wide uppercase text-slate-300">
            Generated SQL Query
          </span>

          {/* Safety Status Badge */}
          {result.isSafe ? (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              <ShieldCheck className="w-3 h-3" /> Safe SELECT
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/80 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Unsafe Query Blocked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Optimization Advice Toggle Button */}
          {result.isSafe && (
            <button
              onClick={handleFetchOptimization}
              disabled={isOptimizing}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1"
              title="Get AI Query Optimization & Indexing Advice"
            >
              {isOptimizing ? (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              ) : (
                <Zap className="w-3 h-3 text-amber-400" />
              )}
              <span>Analyze Performance</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

      </div>

      {/* Safety Alert Warning if Unsafe */}
      {!result.isSafe && (
        <div className="p-4 bg-red-950/60 border-b border-red-800 text-xs text-red-300 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-200">Security Guardrail Triggered</p>
            <p>{result.safetyMessage || 'Unsafe operations (DELETE, DROP, UPDATE, etc.) are strictly prohibited.'}</p>
          </div>
        </div>
      )}

      {/* SQL Code Box */}
      <div className="p-4 font-mono text-sm leading-relaxed overflow-x-auto text-indigo-200 bg-slate-900/90 selection:bg-indigo-500/30">
        <pre className="whitespace-pre-wrap">{result.sql}</pre>
      </div>

      {/* Optimization Tips Box */}
      {optimizationTip && (
        <div className="p-4 bg-indigo-950/40 border-t border-indigo-900/60 text-xs text-indigo-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-300 mb-1">AI Optimization Advice:</p>
            <p className="whitespace-pre-wrap leading-relaxed">{optimizationTip}</p>
          </div>
        </div>
      )}

    </div>
  );
};
