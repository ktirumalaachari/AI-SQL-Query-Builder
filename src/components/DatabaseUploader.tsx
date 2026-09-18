import React, { useState, useRef } from 'react';
import { Upload, Database, X, Check, AlertCircle, RotateCcw } from 'lucide-react';
import type { DatabaseSchema } from '../types';

interface DatabaseUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (schema: DatabaseSchema) => void;
  onResetDb: () => void;
}

export const DatabaseUploader: React.FC<DatabaseUploaderProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onResetDb
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(db|sqlite|sqlite3)$/i)) {
      setError('Please select a valid SQLite database file (.db, .sqlite, .sqlite3)');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('database', file);

    try {
      const res = await fetch('/api/upload-db', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload database file');
      }

      onUploadSuccess(data.schema);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing database');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload SQLite Database</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your custom .db file or use our company sample database
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-indigo-500 dark:text-indigo-400 animate-bounce" />
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
            Click or drag & drop .db file
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports SQLite 3 format (.db, .sqlite, .sqlite3) up to 50MB
          </p>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span>OR</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {/* Reset / Sample Database button */}
        <button
          onClick={() => {
            onResetDb();
            onClose();
          }}
          disabled={isUploading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Load 1,000+ Record Sample Company DB
        </button>

      </div>
    </div>
  );
};
