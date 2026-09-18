import React, { useState } from 'react';
import { Table, Search, Download, ChevronLeft, ChevronRight, Clock, Hash, ArrowUpDown } from 'lucide-react';
import type { QueryResult } from '../types';

interface ResultTableProps {
  result: QueryResult;
  onOpenExport: () => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result, onOpenExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColIdx, setSortColIdx] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  if (!result.columns || result.columns.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center mb-6">
        <p className="text-sm text-slate-500">No records returned by query.</p>
      </div>
    );
  }

  // Filter rows by search term
  let filteredRows = result.rows.filter(row =>
    row.some(val =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort rows if column selected
  if (sortColIdx !== null) {
    filteredRows = [...filteredRows].sort((a, b) => {
      const valA = a[sortColIdx];
      const valB = b[sortColIdx];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // Pagination calculations
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const handleSort = (colIdx: number) => {
    if (sortColIdx === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortColIdx(colIdx);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      
      {/* Table Action Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Query Results
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {result.totalRows} {result.totalRows === 1 ? 'row' : 'rows'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" /> {result.executionTimeMs} ms
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-500" /> {result.columns.length} columns
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search in Results */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Export Modal Trigger */}
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
              <th className="p-3 w-10 text-center text-slate-400">#</th>
              {result.columns.map((col, idx) => (
                <th
                  key={col}
                  onClick={() => handleSort(idx)}
                  className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={result.columns.length + 1} className="p-6 text-center text-slate-400">
                  No matching rows found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                    {startIndex + rowIdx + 1}
                  </td>
                  {row.map((val, colIdx) => (
                    <td key={colIdx} className="p-3 font-mono whitespace-nowrap">
                      {val === null || val === undefined ? (
                        <span className="text-slate-400 italic">null</span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        
        <div>
          Showing {totalRows === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalRows)} of {totalRows} rows
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
