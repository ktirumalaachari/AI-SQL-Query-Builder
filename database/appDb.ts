import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { getSqlJs } from './sampleDb.js';

let appDbInstance: Database | null = null;

export async function getAppDatabase(): Promise<Database> {
  if (!appDbInstance) {
    const SQL = await getSqlJs();
    appDbInstance = new SQL.Database();

    // Create App System Tables
    appDbInstance.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_image TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS query_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        natural_language_query TEXT NOT NULL,
        generated_sql TEXT NOT NULL,
        execution_time INTEGER NOT NULL,
        rows_returned INTEGER NOT NULL,
        is_bookmarked INTEGER DEFAULT 0,
        explanation TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'dark',
        ai_model TEXT DEFAULT 'gemini-3.6-flash',
        default_page_size INTEGER DEFAULT 10,
        export_preference TEXT DEFAULT 'csv',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_uploads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        db_name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    console.log("App SQLite database initialized for Authentication & User Management.");
  }
  return appDbInstance;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  user_id: string;
  theme: 'dark' | 'light';
  ai_model: 'gemini-3.6-flash' | 'ollama' | 'openai';
  default_page_size: number;
  export_preference: 'csv' | 'excel' | 'pdf';
  updated_at: string;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getAppDatabase();
  const res = db.exec("SELECT * FROM users WHERE LOWER(email) = LOWER(?);", [email.trim()]);
  if (res.length === 0 || res[0].values.length === 0) return null;

  const cols = res[0].columns;
  const row = res[0].values[0];
  const user: any = {};
  cols.forEach((col, idx) => {
    user[col] = row[idx];
  });
  return user as UserRow;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const db = await getAppDatabase();
  const res = db.exec("SELECT * FROM users WHERE id = ?;", [id]);
  if (res.length === 0 || res[0].values.length === 0) return null;

  const cols = res[0].columns;
  const row = res[0].values[0];
  const user: any = {};
  cols.forEach((col, idx) => {
    user[col] = row[idx];
  });
  return user as UserRow;
}

export async function createUser(
  id: string,
  name: string,
  email: string,
  passwordHash: string
): Promise<UserRow> {
  const db = await getAppDatabase();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`,
    [id, name, email.toLowerCase().trim(), passwordHash, now, now]
  );

  // Default User Settings
  db.run(
    `INSERT INTO user_settings (user_id, theme, ai_model, default_page_size, export_preference, updated_at) VALUES (?, 'dark', 'gemini-3.6-flash', 10, 'csv', ?);`,
    [id, now]
  );

  return {
    id,
    name,
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    created_at: now,
    updated_at: now
  };
}

export async function updateUserProfile(
  id: string,
  name: string,
  profileImage?: string
): Promise<boolean> {
  const db = await getAppDatabase();
  const now = new Date().toISOString();

  if (profileImage !== undefined) {
    db.run(
      `UPDATE users SET name = ?, profile_image = ?, updated_at = ? WHERE id = ?;`,
      [name, profileImage, now, id]
    );
  } else {
    db.run(
      `UPDATE users SET name = ?, updated_at = ? WHERE id = ?;`,
      [name, now, id]
    );
  }
  return true;
}

export async function updateUserPassword(
  id: string,
  newPasswordHash: string
): Promise<boolean> {
  const db = await getAppDatabase();
  const now = new Date().toISOString();

  db.run(
    `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?;`,
    [newPasswordHash, now, id]
  );
  return true;
}

export async function getUserSettings(userId: string): Promise<SettingsRow> {
  const db = await getAppDatabase();
  const res = db.exec("SELECT * FROM user_settings WHERE user_id = ?;", [userId]);

  if (res.length > 0 && res[0].values.length > 0) {
    const cols = res[0].columns;
    const row = res[0].values[0];
    const settings: any = {};
    cols.forEach((col, idx) => {
      settings[col] = row[idx];
    });
    return settings as SettingsRow;
  }

  // Fallback default
  const now = new Date().toISOString();
  return {
    user_id: userId,
    theme: 'dark',
    ai_model: 'gemini-3.6-flash',
    default_page_size: 10,
    export_preference: 'csv',
    updated_at: now
  };
}

export async function updateUserSettings(
  userId: string,
  theme: string,
  aiModel: string,
  defaultPageSize: number,
  exportPreference: string
): Promise<boolean> {
  const db = await getAppDatabase();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO user_settings (user_id, theme, ai_model, default_page_size, export_preference, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       theme = excluded.theme,
       ai_model = excluded.ai_model,
       default_page_size = excluded.default_page_size,
       export_preference = excluded.export_preference,
       updated_at = excluded.updated_at;`,
    [userId, theme, aiModel, defaultPageSize, exportPreference, now]
  );
  return true;
}

export async function saveQueryHistoryItem(
  id: string,
  userId: string,
  naturalLanguageQuery: string,
  generatedSql: string,
  executionTime: number,
  rowsReturned: number,
  explanation: string
): Promise<void> {
  const db = await getAppDatabase();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO query_history (id, user_id, natural_language_query, generated_sql, execution_time, rows_returned, is_bookmarked, explanation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?);`,
    [id, userId, naturalLanguageQuery, generatedSql, executionTime, rowsReturned, explanation, now]
  );
}

export async function getUserQueryHistory(userId: string): Promise<any[]> {
  const db = await getAppDatabase();
  const res = db.exec(
    "SELECT * FROM query_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100;",
    [userId]
  );

  if (res.length === 0) return [];

  const cols = res[0].columns;
  return res[0].values.map(row => {
    const item: any = {};
    cols.forEach((col, idx) => {
      item[col] = row[idx];
    });
    return {
      id: item.id,
      prompt: item.natural_language_query,
      sql: item.generated_sql,
      timestamp: item.created_at,
      executionTimeMs: item.execution_time,
      rowsCount: item.rows_returned,
      isBookmarked: Boolean(item.is_bookmarked),
      explanation: item.explanation
    };
  });
}

export async function toggleBookmarkQuery(id: string, userId: string): Promise<boolean> {
  const db = await getAppDatabase();
  const res = db.exec("SELECT is_bookmarked FROM query_history WHERE id = ? AND user_id = ?;", [id, userId]);
  if (res.length === 0 || res[0].values.length === 0) return false;

  const current = Number(res[0].values[0][0]);
  const newStatus = current === 1 ? 0 : 1;

  db.run("UPDATE query_history SET is_bookmarked = ? WHERE id = ? AND user_id = ?;", [newStatus, id, userId]);
  return newStatus === 1;
}

export async function deleteQueryHistoryItem(id: string, userId: string): Promise<boolean> {
  const db = await getAppDatabase();
  db.run("DELETE FROM query_history WHERE id = ? AND user_id = ?;", [id, userId]);
  return true;
}

export async function clearUserQueryHistory(userId: string): Promise<boolean> {
  const db = await getAppDatabase();
  db.run("DELETE FROM query_history WHERE user_id = ?;", [userId]);
  return true;
}

export async function recordUserUpload(userId: string, dbName: string): Promise<void> {
  const db = await getAppDatabase();
  const id = `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.run(
    "INSERT INTO user_uploads (id, user_id, db_name, created_at) VALUES (?, ?, ?, ?);",
    [id, userId, dbName, now]
  );
}

export async function getUserStats(userId: string): Promise<{ totalQueries: number; totalDatabasesUploaded: number }> {
  const db = await getAppDatabase();

  const qRes = db.exec("SELECT COUNT(*) FROM query_history WHERE user_id = ?;", [userId]);
  const totalQueries = qRes.length > 0 ? Number(qRes[0].values[0][0]) : 0;

  const uRes = db.exec("SELECT COUNT(*) FROM user_uploads WHERE user_id = ?;", [userId]);
  const totalDatabasesUploaded = uRes.length > 0 ? Number(uRes[0].values[0][0]) : 0;

  return { totalQueries, totalDatabasesUploaded };
}
