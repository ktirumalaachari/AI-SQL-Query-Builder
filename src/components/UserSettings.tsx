import React, { useState } from 'react';
import { Sliders, Moon, Sun, Cpu, Table, Download, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserSettings as UserSettingsType } from '../types';

export const UserSettingsComponent: React.FC = () => {
  const { settings, token, updateSettings } = useAuth();

  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [aiModel, setAiModel] = useState<'gemini-3.6-flash' | 'ollama' | 'openai'>(settings.aiModel || 'gemini-3.6-flash');
  const [defaultPageSize, setDefaultPageSize] = useState<number>(settings.defaultPageSize || 10);
  const [exportPreference, setExportPreference] = useState<'csv' | 'excel' | 'pdf'>(settings.exportPreference || 'csv');

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const newSettings: UserSettingsType = {
      theme,
      aiModel,
      defaultPageSize,
      exportPreference
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (res.ok) {
        updateSettings(newSettings);
        setSuccess('Preferences saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to save settings.');
      }
    } catch (e) {
      setError('Communication error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">Application Preferences & Settings</h2>
          <p className="text-xs text-slate-400">Customize theme, default page sizes, export formats, and AI engines</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-950 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. Theme Setting */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" /> Theme Appearance
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark Luxury
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4" /> High Contrast Light
            </button>
          </div>
        </div>

        {/* 2. AI Model Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> AI Query Engine Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button
              type="button"
              onClick={() => setAiModel('gemini-3.6-flash')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition ${
                aiModel === 'gemini-3.6-flash'
                  ? 'bg-indigo-950/80 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="font-bold text-indigo-300">Gemini 3.6 Flash</p>
              <p className="text-[10px] text-slate-400 mt-1">Recommended for high speed & schema accuracy</p>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('openai')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition ${
                aiModel === 'openai'
                  ? 'bg-indigo-950/80 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="font-bold text-indigo-300">OpenAI GPT-4o</p>
              <p className="text-[10px] text-slate-400 mt-1">Advanced reasoning mode</p>
            </button>

            <button
              type="button"
              onClick={() => setAiModel('ollama')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition ${
                aiModel === 'ollama'
                  ? 'bg-indigo-950/80 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="font-bold text-indigo-300">Ollama Local LLM</p>
              <p className="text-[10px] text-slate-400 mt-1">Self-hosted local engine fallback</p>
            </button>

          </div>
        </div>

        {/* 3. Default Page Size */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" /> Default Result Page Size
          </label>
          <div className="flex items-center gap-3">
            {[5, 10, 25, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDefaultPageSize(size)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  defaultPageSize === size
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {size} rows
              </button>
            ))}
          </div>
        </div>

        {/* 4. Export Preferences */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-rose-400" /> Preferred Export Format
          </label>
          <div className="flex items-center gap-3">
            {[
              { id: 'csv', name: 'CSV File' },
              { id: 'excel', name: 'Excel (.xlsx)' },
              { id: 'pdf', name: 'PDF Executive Report' }
            ].map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => setExportPreference(exp.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  exportPreference === exp.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {exp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
};
