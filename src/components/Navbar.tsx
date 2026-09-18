import React from 'react';
import {
  Database, Sparkles, Upload, RotateCcw, Moon, Sun, Terminal,
  LayoutDashboard, History, User as UserIcon, Sliders, LogOut
} from 'lucide-react';
import type { DatabaseSchema } from '../types';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'schema' | 'history' | 'profile' | 'settings';

interface NavbarProps {
  schema: DatabaseSchema | null;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUploader: () => void;
  onResetDb: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  schema,
  activeTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  onOpenUploader,
  onResetDb,
  isLoading
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                AI SQL <span className="text-indigo-600 dark:text-indigo-400">Query Builder</span>
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          {user && (
            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={() => onSelectTab('schema')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'schema'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schema</span>
              </button>

              <button
                onClick={() => onSelectTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => onSelectTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Profile</span>
              </button>

              <button
                onClick={() => onSelectTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </nav>
          )}
        </div>

        {/* Controls & Profile Dropdown */}
        <div className="flex items-center gap-2">
          
          {schema && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium truncate max-w-[120px]">
                {schema.databaseName}
              </span>
            </div>
          )}

          <button
            onClick={onOpenUploader}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 disabled:opacity-50"
            title="Upload SQLite Database"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={onResetDb}
            disabled={isLoading}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition border border-transparent disabled:opacity-50"
            title="Reset to Default Database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition border border-slate-200/60 dark:border-slate-800"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Badge & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline truncate max-w-[100px]">
                  {user.name}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
