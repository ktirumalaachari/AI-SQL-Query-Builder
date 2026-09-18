import React, { useState } from 'react';
import { Table, Key, Link2, Eye, ChevronDown, ChevronRight, Layers, Columns } from 'lucide-react';
import type { DatabaseSchema, TableSchema } from '../types';

interface SchemaViewerProps {
  schema: DatabaseSchema | null;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [activePreviewTable, setActivePreviewTable] = useState<string | null>(null);

  if (!schema || schema.tables.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500">No schema loaded yet.</p>
      </div>
    );
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Database Schema</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {schema.totalTables} Tables
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Detected Foreign Keys & Types
        </p>
      </div>

      {/* Tables Accordion List */}
      <div className="space-y-3">
        {schema.tables.map((tbl: TableSchema) => {
          const isExpanded = expandedTables[tbl.name] ?? false;
          const isPreviewing = activePreviewTable === tbl.name;

          return (
            <div
              key={tbl.name}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition bg-slate-50/50 dark:bg-slate-800/30"
            >
              {/* Table Header Row */}
              <div
                onClick={() => toggleTable(tbl.name)}
                className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Table className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {tbl.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({tbl.rowCount.toLocaleString()} rows)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {tbl.sampleData && tbl.sampleData.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreviewTable(isPreviewing ? null : tbl.name);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                        isPreviewing
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isPreviewing ? 'Hide Data' : 'Preview Data'}</span>
                    </button>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Columns & Foreign Keys Details */}
              {isExpanded && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
                    {tbl.columns.map((col) => (
                      <div
                        key={col.name}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {col.pk ? (
                            <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Primary Key" />
                          ) : (
                            <Columns className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate" title={col.name}>
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Foreign Keys List */}
                  {tbl.foreignKeys.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-indigo-500" /> Relationships / Foreign Keys
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tbl.foreignKeys.map((fk, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300 font-mono"
                          >
                            <span>{fk.from}</span>
                            <span className="text-indigo-400">➔</span>
                            <span className="font-semibold">{fk.table}({fk.to})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Data Table Preview */}
              {isPreviewing && tbl.sampleData && tbl.sampleData.length > 0 && (
                <div className="p-4 bg-slate-900 text-slate-100 border-t border-slate-700 overflow-x-auto">
                  <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" /> First 3 sample rows from "{tbl.name}":
                  </p>
                  <table className="w-full text-xs text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-800/50">
                        {Object.keys(tbl.sampleData[0]).map(col => (
                          <th key={col} className="p-2 font-semibold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.sampleData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-2 whitespace-nowrap">
                              {val === null ? <span className="text-slate-600">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
