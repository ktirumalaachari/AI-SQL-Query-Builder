import React from 'react';
import { Database, Table, Layers, Clock, ShieldCheck } from 'lucide-react';
import type { DatabaseSchema, QueryHistoryItem } from '../types';

interface DashboardMetricsProps {
  schema: DatabaseSchema | null;
  history: QueryHistoryItem[];
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ schema, history }) => {
  if (!schema) return null;

  const totalQueries = history.length;
  const avgTime = totalQueries > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.executionTimeMs, 0) / totalQueries)
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
      
      {/* Database Name */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <Database className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active DB</p>
          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={schema.databaseName}>
            {schema.databaseName}
          </p>
        </div>
      </div>

      {/* Tables Count */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tables</p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            {schema.totalTables} Tables
          </p>
        </div>
      </div>

      {/* Total Records */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Rows</p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            {schema.totalRecords.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Total Queries */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queries Run</p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            {totalQueries} {totalQueries === 1 ? 'query' : 'queries'}
          </p>
        </div>
      </div>

      {/* Safety Status */}
      <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">SQL Guardrail</p>
          <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            Read-Only Guard Active
          </p>
        </div>
      </div>

    </div>
  );
};
