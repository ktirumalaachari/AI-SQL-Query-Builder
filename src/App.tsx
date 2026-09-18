import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { UserProfile } from './components/UserProfile';
import { UserSettingsComponent } from './components/UserSettings';

import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { DatabaseUploader } from './components/DatabaseUploader';
import { SchemaViewer } from './components/SchemaViewer';
import { QueryInput } from './components/QueryInput';
import { SqlViewer } from './components/SqlViewer';
import { ResultTable } from './components/ResultTable';
import { ExplanationCard } from './components/ExplanationCard';
import { ChartVisualization } from './components/ChartVisualization';
import { QueryHistory } from './components/QueryHistory';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { ExportModal } from './components/ExportModal';

import type { DatabaseSchema, QueryResult, QueryHistoryItem } from './types';
import { Compass, Layers, History, Sparkles, User as UserIcon, Database, Terminal, ArrowRight } from 'lucide-react';

function MainAppContent() {
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Navigation State
  const [route, setRoute] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [darkMode, setDarkMode] = useState(true);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; sql: string; explanation: string }>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // If user becomes authenticated, route to 'app'
  useEffect(() => {
    if (isAuthenticated) {
      setRoute('app');
    }
  }, [isAuthenticated]);

  // Toggle Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Load - Fetch Schema and History
  useEffect(() => {
    loadSchema();
    if (token) {
      loadHistory();
    }
  }, [token]);

  const loadSchema = async () => {
    try {
      const res = await fetch('/api/schema');
      const data = await res.json();
      if (data && !data.error) {
        setSchema(data);
      }
    } catch (e) {
      console.error("Error loading database schema:", e);
    }
  };

  const loadHistory = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/history', { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (e) {
      console.error("Error loading query history:", e);
    }
  };

  const handleExecuteQuery = async (prompt: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/query', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          history: conversationHistory
        })
      });

      const data: QueryResult = await res.json();
      setActiveResult(data);

      if (data.isSafe && !data.error) {
        setConversationHistory(prev => [
          ...prev.slice(-4),
          { prompt: data.prompt, sql: data.sql, explanation: data.explanation }
        ]);
      }

      await loadHistory();
    } catch (err: any) {
      console.error("Query execution error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload-db', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reset: true })
      });
      const data = await res.json();
      if (data.schema) {
        setSchema(data.schema);
        setActiveResult(null);
        setConversationHistory([]);
        await loadHistory();
      }
    } catch (e) {
      console.error("Error resetting database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async (queryId: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/bookmark', {
        method: 'POST',
        headers,
        body: JSON.stringify({ queryId })
      });
      if (res.ok) {
        setHistory(prev =>
          prev.map(item =>
            item.id === queryId ? { ...item, isBookmarked: !item.isBookmarked } : item
          )
        );
      }
    } catch (e) {
      console.error("Bookmark toggle error:", e);
    }
  };

  const handleDeleteQueryItem = async (queryId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/history/${queryId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setHistory(prev => prev.filter(q => q.id !== queryId));
      }
    } catch (e) {
      console.error("Delete query history item error:", e);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (e) {
      console.error("Clear query history error:", e);
    }
  };

  // Route Handler Unauthenticated
  if (!isAuthenticated && route === 'landing') {
    return (
      <LandingPage
        onNavigateLogin={() => setRoute('login')}
        onNavigateRegister={() => setRoute('register')}
      />
    );
  }

  if (!isAuthenticated && route === 'login') {
    return (
      <LoginPage
        onNavigateRegister={() => setRoute('register')}
        onNavigateHome={() => setRoute('landing')}
        onLoginSuccess={() => setRoute('app')}
      />
    );
  }

  if (!isAuthenticated && route === 'register') {
    return (
      <RegisterPage
        onNavigateLogin={() => setRoute('login')}
        onNavigateHome={() => setRoute('landing')}
        onRegisterSuccess={() => setRoute('app')}
      />
    );
  }

  // Fallback for unauthenticated access to protected app route
  if (!isAuthenticated && route === 'app') {
    return (
      <LoginPage
        onNavigateRegister={() => setRoute('register')}
        onNavigateHome={() => setRoute('landing')}
        onLoginSuccess={() => setRoute('app')}
      />
    );
  }

  // ==========================================
  // AUTHENTICATED USER DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Navigation Bar */}
      <Navbar
        schema={schema}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onResetDb={handleResetDatabase}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Greeting Banner */}
        {user && activeTab === 'dashboard' && (
          <div className="mb-6 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/50" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white font-bold text-lg uppercase shadow-inner">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  Welcome back, {user.name}!
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connected to <span className="font-semibold text-indigo-300">{schema?.databaseName || 'SQLite DB'}</span> • {schema?.totalTables || 0} active tables
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setIsUploaderOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Upload Custom DB</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Analytics Bar */}
        {activeTab === 'dashboard' && (
          <DashboardMetrics schema={schema} history={history} />
        )}

        {/* TAB 1: DASHBOARD / AI QUERY WORKSPACE */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left 2 Columns: Input, Output, SQL, Chart, Table */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Query Input Box */}
              <QueryInput
                onExecute={handleExecuteQuery}
                isLoading={isLoading}
              />

              {/* Active Query Output */}
              {activeResult && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Generated SQL Code */}
                  <SqlViewer result={activeResult} />

                  {/* AI Explanation & Smart Follow Up Questions */}
                  {activeResult.explanation && (
                    <ExplanationCard
                      explanation={activeResult.explanation}
                      followUpQuestions={activeResult.followUpQuestions}
                      onSelectFollowUp={handleExecuteQuery}
                      isLoading={isLoading}
                    />
                  )}

                  {/* Dynamic Recharts Chart */}
                  <ChartVisualization result={activeResult} />

                  {/* Results Table */}
                  <ResultTable
                    result={activeResult}
                    onOpenExport={() => setIsExportOpen(true)}
                  />

                </div>
              )}

              {/* Suggested Questions */}
              {!activeResult && (
                <SuggestedQuestions
                  onSelectQuestion={handleExecuteQuery}
                  isLoading={isLoading}
                />
              )}

            </div>

            {/* Right Column: Personal Query History & Schema Quick View */}
            <div className="space-y-6">
              <QueryHistory
                history={history}
                onSelectQuery={handleExecuteQuery}
                onToggleBookmark={handleToggleBookmark}
                onDeleteQueryItem={handleDeleteQueryItem}
                onClearAllHistory={handleClearAllHistory}
                isLoading={isLoading}
              />

              <SchemaViewer schema={schema} />
            </div>

          </motion.div>
        )}

        {/* TAB 2: SCHEMA INSPECTOR */}
        {activeTab === 'schema' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SchemaViewer schema={schema} />
          </motion.div>
        )}

        {/* TAB 3: QUERY HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QueryHistory
              history={history}
              onSelectQuery={(q) => {
                setActiveTab('dashboard');
                handleExecuteQuery(q);
              }}
              onToggleBookmark={handleToggleBookmark}
              onDeleteQueryItem={handleDeleteQueryItem}
              onClearAllHistory={handleClearAllHistory}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* TAB 4: USER PROFILE */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <UserProfile />
          </motion.div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <UserSettingsComponent />
          </motion.div>
        )}

      </main>

      {/* Database Upload Modal */}
      <DatabaseUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadSuccess={(newSchema) => {
          setSchema(newSchema);
          setActiveResult(null);
          setConversationHistory([]);
          loadHistory();
        }}
        onResetDb={handleResetDatabase}
      />

      {/* Export Modal */}
      {activeResult && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={activeResult}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
