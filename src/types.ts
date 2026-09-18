export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
}

export interface TableSchema {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  sampleData: Record<string, any>[];
}

export interface DatabaseSchema {
  databaseName: string;
  totalTables: number;
  totalRecords: number;
  tables: TableSchema[];
  schemaString: string;
}

export interface ChartSuggestion {
  recommended: boolean;
  type: 'bar' | 'pie' | 'line';
  title: string;
  xAxisColumn: string;
  yAxisColumn: string;
}

export interface QueryResult {
  queryId?: string;
  prompt: string;
  sql: string;
  columns: string[];
  rows: any[][];
  totalRows: number;
  executionTimeMs: number;
  explanation: string;
  isSafe: boolean;
  safetyMessage?: string;
  error?: string;
  chartSuggestion?: ChartSuggestion;
  followUpQuestions?: string[];
  optimizationTip?: string;
}

export interface QueryHistoryItem {
  id: string;
  prompt: string;
  sql: string;
  timestamp: string;
  executionTimeMs: number;
  rowsCount: number;
  isBookmarked: boolean;
  explanation: string;
  chartSuggestion?: ChartSuggestion;
}

export interface SuggestedQuestion {
  id: string;
  category: string;
  question: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  created_at: string;
  updated_at?: string;
  totalQueries?: number;
  totalDatabasesUploaded?: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  aiModel: 'gemini-3.6-flash' | 'ollama' | 'openai';
  defaultPageSize: number;
  exportPreference: 'csv' | 'excel' | 'pdf';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  settings: UserSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
}
