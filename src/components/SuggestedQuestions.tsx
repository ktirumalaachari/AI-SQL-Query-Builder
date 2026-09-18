import React, { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import type { SuggestedQuestion } from '../types';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  isLoading: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  isLoading
}) => {
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/suggestions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      }
    } catch (e) {
      console.error("Error fetching suggestions:", e);
    } finally {
      setIsFetching(false);
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        <span>Generating AI suggested questions for loaded database schema...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  // Group by category
  const categories: Record<string, SuggestedQuestion[]> = {};
  suggestions.forEach(s => {
    const cat = s.category || 'General Analysis';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6">
      
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Suggested Analytics Questions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click queries tailored to your active database tables
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([categoryName, items]) => (
          <div key={categoryName} className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {categoryName}
            </p>
            <div className="space-y-1.5">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectQuestion(item.question)}
                  disabled={isLoading}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition flex items-center justify-between gap-2 text-left group disabled:opacity-50"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{item.question}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
