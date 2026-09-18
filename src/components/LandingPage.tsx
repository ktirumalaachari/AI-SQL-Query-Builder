import React from "react";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Database,
  BarChart3,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Code2,
  Users,
  Cpu,
  FileSpreadsheet,
  Globe,
  Github,
  Heart,
} from "lucide-react";

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AI SQL <span className="text-indigo-400">Query Builder</span>
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateRegister}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Gen Gemini 3.6 AI Engine Powered</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Turn Plain English Questions into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
              Production-Grade SQL Queries
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
            Upload any SQLite database or explore sample enterprise data. Ask
            questions naturally, verify query execution safety, inspect
            interactive charts, and export formatted reports instantly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onNavigateRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 group"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onNavigateLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Login to Workspace</span>
            </button>
          </div>

          {/* Key Stat Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="p-3 border-r border-slate-800/80 last:border-0">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400">Safe Read-Only SQL</p>
            </div>
            <div className="p-3 border-r border-slate-800/80 last:border-0">
              <p className="text-2xl font-black text-indigo-400">&lt; 15ms</p>
              <p className="text-xs text-slate-400">In-Memory Query Speed</p>
            </div>
            <div className="p-3 border-r border-slate-800/80 last:border-0">
              <p className="text-2xl font-black text-cyan-400">3 Types</p>
              <p className="text-xs text-slate-400">Auto Chart Visuals</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-emerald-400">JWT</p>
              <p className="text-xs text-slate-400">Secure User Auth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Powerful Features for Analysts & Developers
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to query, analyze, and visualize relational
              data without writing complex SQL by hand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Natural Language Translation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type questions like "Which department spent the most budget on
                active projects?" and get accurate, optimized SQL instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Security Guardrails
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic AST keyword inspection prevents destructive operations
                like DELETE, DROP, or UPDATE from ever executing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Dynamic Recharts Visuals
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auto-detects numeric metrics and generates responsive Bar, Line,
                or Pie charts with dynamic axis selection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Schema Inspector
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect table structures, column data types, foreign key
                relations, and row counts in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Query Performance Optimizer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyzes query execution plans using SQLite EXPLAIN to suggest
                recommended database index statements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">
                Multi-Format Export
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download your query results as CSV, Microsoft Excel XLSX, or
                formatted PDF executive summary reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How It Works in 4 Simple Steps
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From raw SQLite database to actionable business intelligence in
              seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                1
              </span>
              <h4 className="font-bold text-sm text-white mb-1">
                Create Account / Login
              </h4>
              <p className="text-xs text-slate-400">
                Secure JWT authentication keeps your personal database history
                private.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                2
              </span>
              <h4 className="font-bold text-sm text-white mb-1">
                Load or Upload DB
              </h4>
              <p className="text-xs text-slate-400">
                Use the built-in sample company database or drop your custom
                SQLite file.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                3
              </span>
              <h4 className="font-bold text-sm text-white mb-1">
                Ask Natural Question
              </h4>
              <p className="text-xs text-slate-400">
                Type any question in English or click AI suggested analytics
                prompts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                4
              </span>
              <h4 className="font-bold text-sm text-white mb-1">
                Analyze & Export
              </h4>
              <p className="text-xs text-slate-400">
                View generated SQL, plain English summary, charts, and export
                results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">
              AI SQL Query Builder
            </span>
            <span>• Built with React, Vite, Express, SQLite & Gemini 3.6</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built with{" "}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />{" "}
              by Tirumala
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
