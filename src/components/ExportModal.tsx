import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, X, Check } from 'lucide-react';
import { exportToCsv, exportToExcel, exportToPdf } from '../lib/exportUtils';
import type { QueryResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: QueryResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, result }) => {
  const [filename, setFilename] = useState('query_results');
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const cleanName = filename.trim() || 'query_results';

    if (format === 'csv') {
      exportToCsv(cleanName, result.columns, result.rows);
    } else if (format === 'excel') {
      exportToExcel(cleanName, result.columns, result.rows);
    } else if (format === 'pdf') {
      exportToPdf(
        cleanName,
        `SQL Results: "${result.prompt}"`,
        result.columns,
        result.rows,
        result.explanation
      );
    }

    setExportedFormat(format.toUpperCase());
    setTimeout(() => setExportedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Export Query Results</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download {result.totalRows} records in your preferred format
            </p>
          </div>
        </div>

        {/* Filename Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            File Name
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            placeholder="e.g. employee_salaries_report"
          />
        </div>

        {exportedFormat && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Exported as {exportedFormat} successfully!</span>
          </div>
        )}

        {/* Export Format Options */}
        <div className="grid grid-cols-3 gap-3">
          
          <button
            onClick={() => handleExport('csv')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-center transition group"
          >
            <FileCode className="w-6 h-6 mx-auto mb-2 text-indigo-500 group-hover:scale-110 transition" />
            <p className="font-bold text-xs text-slate-900 dark:text-white">CSV</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Comma Separated</p>
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-center transition group"
          >
            <FileSpreadsheet className="w-6 h-6 mx-auto mb-2 text-emerald-500 group-hover:scale-110 transition" />
            <p className="font-bold text-xs text-slate-900 dark:text-white">Excel</p>
            <p className="text-[10px] text-slate-400 mt-0.5">XLSX Workbook</p>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 text-center transition group"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-rose-500 group-hover:scale-110 transition" />
            <p className="font-bold text-xs text-slate-900 dark:text-white">PDF Report</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Formatted Table</p>
          </button>

        </div>

      </div>
    </div>
  );
};
