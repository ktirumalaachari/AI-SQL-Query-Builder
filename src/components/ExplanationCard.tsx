import React from 'react';
import { Bot, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react';

interface ExplanationCardProps {
  explanation: string;
  followUpQuestions?: string[];
  onSelectFollowUp: (q: string) => void;
  isLoading: boolean;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  followUpQuestions = [],
  onSelectFollowUp,
  isLoading
}) => {
  if (!explanation) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-800/60 mb-6">
      
      {/* AI Explanation Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-indigo-100 flex items-center gap-2">
            AI Summary & Plain English Explanation
          </h3>
          <p className="text-[11px] text-indigo-300/80">
            Automated insight generated for this query result
          </p>
        </div>
      </div>

      {/* Summary Text */}
      <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-sm leading-relaxed text-indigo-100 font-normal">
        {explanation}
      </div>

      {/* Suggested Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-indigo-800/40">
          <p className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Suggested Follow-up Questions:
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {followUpQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFollowUp(q)}
                disabled={isLoading}
                className="text-xs px-3 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 transition flex items-center justify-between gap-2 text-left group disabled:opacity-50"
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{q}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
