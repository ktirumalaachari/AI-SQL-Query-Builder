import express from "express";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI, Type } from "@google/genai";
import { createSampleDatabase, getSqlJs } from "./database/sampleDb.js";
import {
  getAppDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserPassword,
  getUserSettings,
  updateUserSettings,
  saveQueryHistoryItem,
  getUserQueryHistory,
  toggleBookmarkQuery,
  deleteQueryHistoryItem,
  clearUserQueryHistory,
  recordUserUpload,
  getUserStats,
} from "./database/appDb.js";
import type { Database } from "sql.js";
import type {
  DatabaseSchema,
  TableSchema,
  ColumnInfo,
  ForeignKeyInfo,
  QueryResult,
  QueryHistoryItem,
} from "./src/types.js";

const app = express();
const PORT = 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "ai_sql_query_builder_secret_jwt_key_2026";

app.use(express.json({ limit: "10mb" }));

// Multer setup for DB upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Active SQLite Database instance (per session or global fallback)
let activeDb: Database | null = null;
let activeDbName = "company.db";

// Gemini Client Lazy Initializer
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Initialize active DB with sample database
async function initDatabase() {
  if (!activeDb) {
    console.log("Initializing default sample SQLite database...");
    activeDb = await createSampleDatabase();
    activeDbName = "company.db";
  }
  await getAppDatabase();
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Authentication token required." });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Invalid or expired session token." });
    req.user = decoded;
    next();
  });
}

// Optional Auth Middleware (attaches user if present)
function optionalAuthenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (!err) req.user = decoded;
      next();
    });
  } else {
    next();
  }
}

// Inspect Schema from SQLite DB
function inspectDatabaseSchema(db: Database, dbName: string): DatabaseSchema {
  const tablesRes = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
  );
  const tableNames =
    tablesRes.length > 0
      ? tablesRes[0].values.map((row) => String(row[0]))
      : [];

  let totalRecords = 0;
  const tablesSchema: TableSchema[] = [];
  let schemaStringBuilder = `Database: ${dbName}\n\n`;

  for (const tableName of tableNames) {
    // Columns
    const colsRes = db.exec(`PRAGMA table_info("${tableName}");`);
    const columns: ColumnInfo[] =
      colsRes.length > 0
        ? colsRes[0].values.map((r) => ({
            cid: Number(r[0]),
            name: String(r[1]),
            type: String(r[2]),
            notnull: Boolean(r[3]),
            dflt_value: r[4],
            pk: Boolean(r[5]),
          }))
        : [];

    // Foreign Keys
    const fkRes = db.exec(`PRAGMA foreign_key_list("${tableName}");`);
    const foreignKeys: ForeignKeyInfo[] =
      fkRes.length > 0
        ? fkRes[0].values.map((r) => ({
            id: Number(r[0]),
            seq: Number(r[1]),
            table: String(r[2]),
            from: String(r[3]),
            to: String(r[4]),
          }))
        : [];

    // Row Count
    const countRes = db.exec(`SELECT COUNT(*) FROM "${tableName}";`);
    const rowCount = countRes.length > 0 ? Number(countRes[0].values[0][0]) : 0;
    totalRecords += rowCount;

    // Sample Data
    const sampleRes = db.exec(`SELECT * FROM "${tableName}" LIMIT 3;`);
    let sampleData: Record<string, any>[] = [];
    if (sampleRes.length > 0) {
      const cols = sampleRes[0].columns;
      sampleData = sampleRes[0].values.map((row) => {
        const obj: Record<string, any> = {};
        cols.forEach((colName, idx) => {
          obj[colName] = row[idx];
        });
        return obj;
      });
    }

    tablesSchema.push({
      name: tableName,
      rowCount,
      columns,
      foreignKeys,
      sampleData,
    });

    // Format for AI Prompt
    schemaStringBuilder += `Table: "${tableName}" (${rowCount} rows)\n`;
    schemaStringBuilder += `Columns:\n`;
    columns.forEach((c) => {
      schemaStringBuilder += `  - ${c.name} (${c.type})${c.pk ? " [PRIMARY KEY]" : ""}${c.notnull ? " NOT NULL" : ""}\n`;
    });
    if (foreignKeys.length > 0) {
      schemaStringBuilder += `Foreign Keys:\n`;
      foreignKeys.forEach((fk) => {
        schemaStringBuilder += `  - ${fk.from} -> ${fk.table}(${fk.to})\n`;
      });
    }
    schemaStringBuilder += `\n`;
  }

  return {
    databaseName: dbName,
    totalTables: tableNames.length,
    totalRecords,
    tables: tablesSchema,
    schemaString: schemaStringBuilder,
  };
}

// SQL Safety Validator
function validateSqlSafety(sql: string): { isSafe: boolean; reason?: string } {
  const trimmed = sql.trim();
  const cleanSql = trimmed.endsWith(";")
    ? trimmed.slice(0, -1).trim()
    : trimmed;

  if (cleanSql.includes(";")) {
    return {
      isSafe: false,
      reason:
        "Multiple SQL statements detected. Execution rejected for security.",
    };
  }

  const upper = cleanSql.toUpperCase();
  if (
    !upper.startsWith("SELECT") &&
    !upper.startsWith("WITH") &&
    !upper.startsWith("EXPLAIN")
  ) {
    return {
      isSafe: false,
      reason:
        "Unsafe query detected. Only read-only SELECT or WITH statements are allowed.",
    };
  }

  const forbiddenKeywords = [
    "DELETE",
    "DROP",
    "UPDATE",
    "ALTER",
    "INSERT",
    "TRUNCATE",
    "CREATE",
    "ATTACH",
    "DETACH",
    "PRAGMA",
    "GRANT",
    "REVOKE",
    "REPLACE",
    "EXEC",
    "EXECUTE",
    "VACUUM",
    "REINDEX",
  ];

  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(cleanSql)) {
      return {
        isSafe: false,
        reason: `Unsafe query detected. Prohibited operation: '${keyword}'.`,
      };
    }
  }

  return { isSafe: true };
}

// Start Server Setup
async function startServer() {
  await initDatabase();

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeDatabase: activeDbName });
  });

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  // POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Full name, email address, and password are required.",
        });
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ error: "Password and Confirm Password do not match." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long." });
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: "An account with this email address already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const user = await createUser(userId, name, email, passwordHash);

      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      const settings = await getUserSettings(user.id);

      res.status(201).json({
        message: "Registration successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
          created_at: user.created_at,
          totalQueries: 0,
          totalDatabasesUploaded: 0,
        },
        settings: {
          theme: settings.theme,
          aiModel: settings.ai_model,
          defaultPageSize: settings.default_page_size,
          exportPreference: settings.export_preference,
        },
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to register user." });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required." });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid email address or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Invalid email address or password." });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      const stats = await getUserStats(user.id);
      const settings = await getUserSettings(user.id);

      res.json({
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
          created_at: user.created_at,
          totalQueries: stats.totalQueries,
          totalDatabasesUploaded: stats.totalDatabasesUploaded,
        },
        settings: {
          theme: settings.theme,
          aiModel: settings.ai_model,
          defaultPageSize: settings.default_page_size,
          exportPreference: settings.export_preference,
        },
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message || "Login failed." });
    }
  });

  // GET /api/auth/profile
  app.get("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User profile not found." });
      }

      const stats = await getUserStats(user.id);
      const settings = await getUserSettings(user.id);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
          created_at: user.created_at,
          totalQueries: stats.totalQueries,
          totalDatabasesUploaded: stats.totalDatabasesUploaded,
        },
        settings: {
          theme: settings.theme,
          aiModel: settings.ai_model,
          defaultPageSize: settings.default_page_size,
          exportPreference: settings.export_preference,
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message || "Failed to fetch profile." });
    }
  });

  // PUT /api/auth/profile
  app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const { name, profile_image } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is required." });
      }

      await updateUserProfile(req.user.userId, name.trim(), profile_image);
      const updatedUser = await findUserById(req.user.userId);
      const stats = await getUserStats(req.user.userId);

      res.json({
        message: "Profile updated successfully!",
        user: {
          id: updatedUser!.id,
          name: updatedUser!.name,
          email: updatedUser!.email,
          profile_image: updatedUser!.profile_image,
          created_at: updatedUser!.created_at,
          totalQueries: stats.totalQueries,
          totalDatabasesUploaded: stats.totalDatabasesUploaded,
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message || "Failed to update profile." });
    }
  });

  // PUT /api/auth/change-password
  app.put(
    "/api/auth/change-password",
    authenticateToken,
    async (req: any, res) => {
      try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword) {
          return res
            .status(400)
            .json({ error: "Current password and new password are required." });
        }

        if (newPassword !== confirmNewPassword) {
          return res.status(400).json({ error: "New passwords do not match." });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            error: "New password must be at least 6 characters long.",
          });
        }

        const user = await findUserById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const isMatch = await bcrypt.compare(
          currentPassword,
          user.password_hash,
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect." });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(req.user.userId, newHash);

        res.json({ message: "Password changed successfully!" });
      } catch (err: any) {
        res
          .status(500)
          .json({ error: err.message || "Failed to change password." });
      }
    },
  );

  // POST /api/auth/logout
  app.post("/api/auth/logout", authenticateToken, (req, res) => {
    res.json({ message: "Logged out successfully." });
  });

  // GET /api/settings
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await getUserSettings(req.user.userId);
      res.json({
        theme: settings.theme,
        aiModel: settings.ai_model,
        defaultPageSize: settings.default_page_size,
        exportPreference: settings.export_preference,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // PUT /api/settings
  app.put("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const { theme, aiModel, defaultPageSize, exportPreference } = req.body;
      await updateUserSettings(
        req.user.userId,
        theme || "dark",
        aiModel || "gemini-3.6-flash",
        Number(defaultPageSize) || 10,
        exportPreference || "csv",
      );
      res.json({ message: "Settings saved successfully!" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ==========================================
  // CORE SQL & SCHEMA ENDPOINTS
  // ==========================================

  // Get Current Schema
  app.get("/api/schema", async (req, res) => {
    try {
      if (!activeDb) await initDatabase();
      const schema = inspectDatabaseSchema(activeDb!, activeDbName);
      res.json(schema);
    } catch (err: any) {
      console.error("Error inspecting schema:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to inspect schema" });
    }
  });

  // Upload SQLite DB or Reset
  app.post(
    "/api/upload-db",
    optionalAuthenticateToken,
    upload.single("database"),
    async (req: any, res) => {
      try {
        if (req.body.reset === "true" || req.body.reset === true) {
          activeDb = await createSampleDatabase();
          activeDbName = "company.db";
          const schema = inspectDatabaseSchema(activeDb, activeDbName);
          return res.json({
            message: "Reset to default sample database",
            schema,
          });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No database file provided." });
        }

        const SQL = await getSqlJs();
        const newDb = new SQL.Database(req.file.buffer);

        // Test execution to verify valid SQLite db
        newDb.exec("SELECT name FROM sqlite_master WHERE type='table';");

        activeDb = newDb;
        activeDbName = req.file.originalname || "uploaded.db";
        const schema = inspectDatabaseSchema(activeDb, activeDbName);

        if (req.user) {
          await recordUserUpload(req.user.userId, activeDbName);
        }

        res.json({
          message: `Successfully loaded database ${activeDbName}`,
          schema,
        });
      } catch (err: any) {
        console.error("Database upload error:", err);
        res
          .status(400)
          .json({ error: "Invalid or corrupted SQLite database file." });
      }
    },
  );

  // Natural Language Query Endpoint
  app.post("/api/query", optionalAuthenticateToken, async (req: any, res) => {
    try {
      if (!activeDb) await initDatabase();
      const { prompt, history = [] } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const schema = inspectDatabaseSchema(activeDb!, activeDbName);
      const ai = getGeminiClient();

      const systemInstruction = `
You are an expert AI SQL Assistant.
You translate natural language questions into safe, executable SQLite queries based ONLY on the provided Database Schema.

RULES:
1. Generate ONLY safe SQLite SELECT or WITH ... SELECT queries.
2. NEVER generate DELETE, DROP, UPDATE, ALTER, INSERT, TRUNCATE, ATTACH, DETACH, PRAGMA, or CREATE queries.
3. Use foreign keys to correctly JOIN tables when required.
4. Ensure column names and table names strictly match the provided schema (case-sensitive where applicable).
5. Always alias aggregations with clean column names (e.g. SUM(Salary) AS total_salary).
6. Provide an easy-to-understand plain English explanation of the findings.
7. Suggest a chart visualization (bar, pie, or line) if the query produces numeric/categorical metrics suitable for plotting.
8. Provide 3 smart follow-up questions the user might ask next.

SCHEMA:
${schema.schemaString}
`;

      const promptPayload = `
Conversation Context History:
${JSON.stringify(history, null, 2)}

User Question: "${prompt}"

Return your response strictly in JSON matching this structure:
{
  "sql": "SELECT ...",
  "explanation": "Clear plain English explanation of what this query calculates or retrieves.",
  "chartSuggestion": {
    "recommended": true,
    "type": "bar", // or "pie" or "line"
    "title": "Descriptive Chart Title",
    "xAxisColumn": "column_name_for_category",
    "yAxisColumn": "column_name_for_metric"
  },
  "followUpQuestions": [
    "Follow up question 1?",
    "Follow up question 2?",
    "Follow up question 3?"
  ]
}
`;

      let generatedSql = "";
      let explanation = "";
      let chartSuggestion: any = null;
      let followUpQuestions: string[] = [];

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptPayload,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql: { type: Type.STRING },
              explanation: { type: Type.STRING },
              chartSuggestion: {
                type: Type.OBJECT,
                properties: {
                  recommended: { type: Type.BOOLEAN },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  xAxisColumn: { type: Type.STRING },
                  yAxisColumn: { type: Type.STRING },
                },
                required: [
                  "recommended",
                  "type",
                  "title",
                  "xAxisColumn",
                  "yAxisColumn",
                ],
              },
              followUpQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "sql",
              "explanation",
              "chartSuggestion",
              "followUpQuestions",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      generatedSql = parsed.sql || "";
      explanation = parsed.explanation || "";
      chartSuggestion = parsed.chartSuggestion;
      followUpQuestions = parsed.followUpQuestions || [];

      // Safety Check
      const safetyCheck = validateSqlSafety(generatedSql);
      if (!safetyCheck.isSafe) {
        return res.json({
          prompt,
          sql: generatedSql,
          columns: [],
          rows: [],
          totalRows: 0,
          executionTimeMs: 0,
          explanation: "Execution stopped due to security policy.",
          isSafe: false,
          safetyMessage: safetyCheck.reason,
          chartSuggestion: null,
          followUpQuestions: [],
        });
      }

      // Execute SQL with timing
      const startTime = Date.now();
      let queryExecRes: any[] = [];
      let execError: string | null = null;

      try {
        queryExecRes = activeDb!.exec(generatedSql);
      } catch (sqlErr: any) {
        execError = sqlErr.message;

        // Auto-fix retry prompt
        const fixResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `
The query "${generatedSql}" failed on SQLite with error: "${sqlErr.message}".
Please fix the query for schema:
${schema.schemaString}
Question: "${prompt}"

Return JSON with fixed "sql" and updated "explanation".
`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sql: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["sql", "explanation"],
            },
          },
        });

        const fixedParsed = JSON.parse(fixResponse.text || "{}");
        if (fixedParsed.sql) {
          generatedSql = fixedParsed.sql;
          explanation = fixedParsed.explanation || explanation;

          const fixedSafety = validateSqlSafety(generatedSql);
          if (fixedSafety.isSafe) {
            queryExecRes = activeDb!.exec(generatedSql);
            execError = null;
          }
        }
      }

      const executionTimeMs = Date.now() - startTime;

      if (execError) {
        return res.json({
          prompt,
          sql: generatedSql,
          columns: [],
          rows: [],
          totalRows: 0,
          executionTimeMs,
          explanation: `Error executing query: ${execError}`,
          isSafe: true,
          error: execError,
        });
      }

      let columns: string[] = [];
      let rows: any[][] = [];
      if (queryExecRes.length > 0) {
        columns = queryExecRes[0].columns;
        rows = queryExecRes[0].values;
      }

      const queryId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Save to DB query_history if authenticated user
      const userId = req.user?.userId || "guest_user";
      await saveQueryHistoryItem(
        queryId,
        userId,
        prompt,
        generatedSql,
        executionTimeMs,
        rows.length,
        explanation,
      );

      res.json({
        queryId,
        prompt,
        sql: generatedSql,
        columns,
        rows,
        totalRows: rows.length,
        executionTimeMs,
        explanation,
        isSafe: true,
        chartSuggestion,
        followUpQuestions,
      });
    } catch (err: any) {
      console.error("Error in /api/query:", err);
      res.status(500).json({
        error: err.message || "Internal server error processing query",
      });
    }
  });

  // Query History for User
  app.get("/api/history", optionalAuthenticateToken, async (req: any, res) => {
    try {
      const userId = req.user?.userId || "guest_user";
      const history = await getUserQueryHistory(userId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch query history." });
    }
  });

  // Toggle Bookmark
  app.post(
    "/api/bookmark",
    optionalAuthenticateToken,
    async (req: any, res) => {
      try {
        const { queryId } = req.body;
        const userId = req.user?.userId || "guest_user";
        const isBookmarked = await toggleBookmarkQuery(queryId, userId);
        res.json({ success: true, isBookmarked });
      } catch (err: any) {
        res.status(500).json({ error: "Failed to toggle bookmark." });
      }
    },
  );

  // Delete Individual Query History
  app.delete(
    "/api/history/:id",
    optionalAuthenticateToken,
    async (req: any, res) => {
      try {
        const userId = req.user?.userId || "guest_user";
        await deleteQueryHistoryItem(req.params.id, userId);
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: "Failed to delete query history item." });
      }
    },
  );

  // Clear All Query History
  app.delete(
    "/api/history",
    optionalAuthenticateToken,
    async (req: any, res) => {
      try {
        const userId = req.user?.userId || "guest_user";
        await clearUserQueryHistory(userId);
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: "Failed to clear query history." });
      }
    },
  );

  // Suggested Questions Endpoint
  app.get("/api/suggestions", async (req, res) => {
    try {
      if (!activeDb) await initDatabase();
      const schema = inspectDatabaseSchema(activeDb!, activeDbName);
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `
Given the database schema below, generate 8 diverse, insightful natural language questions a business analyst or manager would ask.
Group them into logical categories like "Salaries & Compensation", "Department Overview", "Projects & Budgets", "Attendance & Leave".

Database Schema:
${schema.schemaString}

Return JSON with an array of objects:
[
  { "id": "1", "category": "Salaries & Compensation", "question": "Show top 5 highest paid employees with their department names" }
]
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                question: { type: Type.STRING },
              },
              required: ["id", "category", "question"],
            },
          },
        },
      });

      const suggestions = JSON.parse(response.text || "[]");
      res.json(suggestions);
    } catch (err: any) {
      res.json([
        {
          id: "1",
          category: "Salaries & Compensation",
          question: "Show top 10 employees earning above $90,000",
        },
        {
          id: "2",
          category: "Department Overview",
          question: "Which department has the highest average salary?",
        },
        {
          id: "3",
          category: "Department Overview",
          question: "Count of employees in each department",
        },
        {
          id: "4",
          category: "Projects & Budgets",
          question:
            "List all ongoing projects with budget greater than $200,000",
        },
        {
          id: "5",
          category: "Attendance & Leave",
          question: "Show employees with absent status in attendance records",
        },
        {
          id: "6",
          category: "Salaries & Compensation",
          question: "Total base salary and bonus sum grouped by department",
        },
      ]);
    }
  });

  // Query Optimization Advice
  app.post("/api/optimize", async (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql) return res.status(400).json({ error: "SQL query required" });

      if (!activeDb) await initDatabase();
      const schema = inspectDatabaseSchema(activeDb!, activeDbName);
      const ai = getGeminiClient();

      let explainInfo = "";
      try {
        const explainRes = activeDb!.exec(`EXPLAIN QUERY PLAN ${sql}`);
        if (explainRes.length > 0) {
          explainInfo = JSON.stringify(explainRes[0].values);
        }
      } catch (e) {
        // ignore
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `
Analyze this SQLite query for performance and optimization tips:
Query: "${sql}"
Query Plan Info: ${explainInfo}
Database Schema:
${schema.schemaString}

Provide concise optimization advice and recommended SQLite INDEX statements if applicable.
Return JSON with { "optimizationTip": "string with advice and markdown code blocks if indices are recommended" }.
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizationTip: { type: Type.STRING },
            },
            required: ["optimizationTip"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        optimizationTip:
          parsed.optimizationTip ||
          "Query is well optimized for current dataset.",
      });
    } catch (err: any) {
      res.json({ optimizationTip: "No specific optimization required." });
    }
  });

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
