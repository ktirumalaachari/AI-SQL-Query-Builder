import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2, Compass, CornerDownLeft } from 'lucide-react';
import { VoiceInputManager } from '../lib/audio';

interface QueryInputProps {
  onExecute: (prompt: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  onExecute,
  isLoading,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceManagerRef = useRef<VoiceInputManager | null>(null);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    voiceManagerRef.current = new VoiceInputManager();
  }, []);

  const handleSend = () => {
    if (!prompt.trim() || isLoading) return;
    onExecute(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    setVoiceError(null);
    if (!voiceManagerRef.current || !voiceManagerRef.current.isSupported) {
      setVoiceError('Speech recognition is not available in this browser.');
      return;
    }

    if (isListening) {
      voiceManagerRef.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceManagerRef.current.startListening(
        (result) => {
          setPrompt(result.transcript);
        },
        () => {
          setIsListening(false);
        },
        (err) => {
          setVoiceError(err);
          setIsListening(false);
        }
      );
    }
  };

  const samplePrompts = [
    'Show top 10 employees by salary',
    'Which department has highest average salary?',
    'List all ongoing projects with budget over $200,000',
    'Show employees with performance rating 5 hired after 2023'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6">
      
      <div className="flex items-center justify-between mb-3">
        <label className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Ask Anything in Plain English
        </label>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline-flex items-center gap-1">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Enter</kbd>
        </span>
      </div>

      {voiceError && (
        <p className="mb-2 text-xs text-red-500 font-medium">{voiceError}</p>
      )}

      {/* Input Textarea Container */}
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 'Which department has the highest average salary?' or 'Show employees hired in 2025 earning above $80,000'"
          disabled={isLoading}
          rows={3}
          className="w-full p-4 pr-24 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none resize-none"
        />

        {/* Action Controls inside box */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`p-2 rounded-lg transition ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input (Speech to Text)'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Generate SQL</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </div>
      </div>

      {/* Instant Prompt Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Try asking:
        </span>
        {samplePrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(sp);
              onExecute(sp);
            }}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition"
          >
            {sp}
          </button>
        ))}
      </div>

    </div>
  );
};
