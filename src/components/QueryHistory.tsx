import React, { useState } from 'react';
import { History, Star, Clock, Play, Search, Trash2, AlertTriangle } from 'lucide-react';
import type { QueryHistoryItem } from '../types';

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelectQuery: (prompt: string) => void;
  onToggleBookmark: (queryId: string) => void;
  onDeleteQueryItem?: (queryId: string) => void;
  onClearAllHistory?: () => void;
  isLoading: boolean;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  history,
  onSelectQuery,
  onToggleBookmark,
  onDeleteQueryItem,
  onClearAllHistory,
  isLoading
}) => {
  const [filterBookmark, setFilterBookmark] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  let filtered = history;

  if (filterBookmark) {
    filtered = filtered.filter(item => item.isBookmarked);
  }

  if (searchFilter.trim()) {
    const query = searchFilter.toLowerCase();
    filtered = filtered.filter(item =>
      item.prompt.toLowerCase().includes(query) ||
      item.sql.toLowerCase().includes(query)
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Query History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {history.length} saved queries in personal history
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setFilterBookmark(!filterBookmark)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterBookmark
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{filterBookmark ? 'Bookmarked' : 'All'}</span>
          </button>

          {history.length > 0 && onClearAllHistory && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 text-xs font-semibold flex items-center gap-1 transition"
              title="Clear all query history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search natural question or generated SQL..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* History Items List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No query history records found. Execute a prompt in the workspace to save items here!
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex items-start justify-between gap-3 group"
            >
              <div
                onClick={() => onSelectQuery(item.prompt)}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <p className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" title={item.prompt}>
                  "{item.prompt}"
                </p>

                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                  {item.sql}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" /> {item.executionTimeMs} ms
                  </span>
                  <span>•</span>
                  <span>{item.rowsCount} rows</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onToggleBookmark(item.id)}
                  className={`p-1.5 rounded-lg transition ${
                    item.isBookmarked
                      ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={item.isBookmarked ? 'Bookmarked' : 'Bookmark query'}
                >
                  <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => onSelectQuery(item.prompt)}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition disabled:opacity-50"
                  title="Re-run query"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>

                {onDeleteQueryItem && (
                  <button
                    onClick={() => onDeleteQueryItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 w-fit mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Clear History?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This will permanently delete all saved queries from your personal history. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  if (onClearAllHistory) onClearAllHistory();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
