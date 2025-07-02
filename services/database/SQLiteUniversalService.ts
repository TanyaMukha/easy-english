// services/database/SQLiteUniversalService.ts - Complete implementation with all methods
import { Platform } from "react-native";

import { WebDatabaseManager } from "./WebDatabaseManager";
import {
  AutoSaveController,
  WebDatabasePersistence,
} from "./WebDatabasePersistence";

// Conditional imports for platform-specific modules
let ExpoSQLite: any = null;
let initSqlJs: any = null;

if (Platform.OS !== "web") {
  try {
    ExpoSQLite = require("expo-sqlite");
    console.log("✅ Expo SQLite loaded for native platform");
  } catch (error) {
    console.warn("⚠️ Could not load Expo SQLite:", error);
  }
} else {
  try {
    const sqlJs = require("sql.js");
    initSqlJs = sqlJs.default || sqlJs;
    console.log("✅ SQL.js loaded for web platform");
  } catch (error) {
    console.warn("⚠️ Could not load SQL.js:", error);
  }
}

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T[];
  error?: string;
  rowsAffected?: number;
  insertId?: number;
}

export interface TransactionCallback<T> {
  (
    execute: (sql: string, params?: any[]) => Promise<DatabaseResult>,
  ): Promise<T>;
}

enum InitializationState {
  NOT_STARTED = "NOT_STARTED",
  PLATFORM_SETUP = "PLATFORM_SETUP",
  DATABASE_CONNECTED = "DATABASE_CONNECTED",
  SCHEMA_CREATED = "SCHEMA_CREATED",
  FULLY_INITIALIZED = "FULLY_INITIALIZED",
  FAILED = "FAILED",
  PARTIALLY_INITIALIZED = "PARTIALLY_INITIALIZED",
}

export class SQLiteUniversalService {
  private static instance: SQLiteUniversalService | null = null;
  private autoSaveController: AutoSaveController | null = null;

  // Platform-specific database instances
  private nativeDatabase: any = null;
  private webSqlJs: any = null;
  private webDatabase: any = null;

  // Initialization state tracking
  private initState: InitializationState = InitializationState.NOT_STARTED;
  private initializationPromise: Promise<void> | null = null;

  private readonly databaseName = "easy_english_universal.db";

  private constructor() {
    console.log(
      `🏗️ SQLiteUniversalService created for platform: ${Platform.OS}`,
    );
  }

  static getInstance(): SQLiteUniversalService {
    if (!SQLiteUniversalService.instance) {
      SQLiteUniversalService.instance = new SQLiteUniversalService();
    }
    return SQLiteUniversalService.instance;
  }

  /**
   * Initialize database with proper error handling and WebAssembly configuration
   */
  async initialize(): Promise<void> {
    if (this.initState === InitializationState.FULLY_INITIALIZED) {
      return;
    }

    if (this.initializationPromise) {
      console.log("⏳ Initialization already in progress, waiting...");
      return this.initializationPromise;
    }

    console.log("🚀 Starting database initialization for web");
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.initState = InitializationState.PLATFORM_SETUP;

      // Platform-specific setup
      if (Platform.OS === "web") {
        await this.setupWebDatabase();
      } else {
        await this.setupNativeDatabase();
      }

      this.initState = InitializationState.DATABASE_CONNECTED;

      // Create database schema
      await this.createSchemaDirectly();
      this.initState = InitializationState.SCHEMA_CREATED;

      this.initState = InitializationState.FULLY_INITIALIZED;
      console.log("✅ Database fully initialized");
    } catch (error) {
      this.initState = InitializationState.FAILED;
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  /**
   * Set up web SQLite database with public file support
   */
  private async setupWebDatabase(): Promise<void> {
    if (!initSqlJs) {
      throw new Error(
        "SQL.js not available. Install with: npm install sql.js @types/sql.js",
      );
    }

    console.log(
      "🌐 Setting up web SQLite database with public file support...",
    );

    try {
      // Initialize SQL.js WebAssembly module
      let sqlJsConfig: any = {};

      // Try multiple WebAssembly loading strategies
      try {
        const wasmResponse = await fetch("/sql-wasm.wasm");
        if (wasmResponse.ok) {
          console.log("📁 Using local WASM file");
          sqlJsConfig = {
            locateFile: (file: string) => {
              if (file.endsWith(".wasm")) {
                return "/sql-wasm.wasm";
              }
              return file;
            },
          };
        } else {
          throw new Error("Local WASM not found");
        }
      } catch (localError) {
        console.log("📡 Local WASM not available, using CDN...");
        sqlJsConfig = {
          locateFile: (file: string) => {
            if (file.endsWith(".wasm")) {
              return `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`;
            }
            return file;
          },
        };
      }

      // Initialize SQL.js
      this.webSqlJs = await initSqlJs(sqlJsConfig);
      console.log("✅ SQL.js WebAssembly module loaded successfully");

      // Load database using WebDatabaseManager (public folder -> storage -> new)
      this.webDatabase = await WebDatabaseManager.loadOrCreateDatabase(
        this.webSqlJs,
      );

      // Start auto-save to browser storage
      this.startAutoSave();

      console.log("✅ Web SQLite database configured with public file support");
    } catch (error) {
      console.error("❌ Failed to setup web database:", error);
      throw new Error(
        `Failed to initialize web database: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Start auto-save for web database
   */
  private startAutoSave(): void {
    if (Platform.OS !== "web" || !this.webDatabase) {
      return;
    }

    // Save every 30 seconds
    setInterval(async () => {
      try {
        await WebDatabaseManager.saveToStorage(this.webDatabase);
      } catch (error) {
        console.warn("⚠️ Auto-save failed:", error);
      }
    }, 30000);

    // Save on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        try {
          WebDatabaseManager.saveToStorage(this.webDatabase);
        } catch (error) {
          console.warn("⚠️ Save on unload failed:", error);
        }
      });
    }
  }

  /**
   * Manual save to browser storage (web only)
   */
  async saveToStorage(): Promise<void> {
    if (Platform.OS !== "web" || !this.webDatabase) {
      throw new Error("saveToStorage is only available on web platform");
    }

    await WebDatabaseManager.saveToStorage(this.webDatabase);
  }

  /**
   * Download database file (web only)
   */
  async downloadDatabase(filename?: string): Promise<void> {
    if (Platform.OS !== "web" || !this.webDatabase) {
      throw new Error("downloadDatabase is only available on web platform");
    }

    await WebDatabaseManager.downloadDatabase(this.webDatabase, filename);
  }

  /**
   * Upload and replace current database (web only)
   */
  async uploadDatabase(file: File): Promise<void> {
    if (Platform.OS !== "web" || !this.webSqlJs) {
      throw new Error("uploadDatabase is only available on web platform");
    }

    this.webDatabase = await WebDatabaseManager.uploadDatabase(
      this.webSqlJs,
      file,
    );

    // Reinitialize database state
    this.initState = InitializationState.PARTIALLY_INITIALIZED;
    await this.createSchemaDirectly();
    this.initState = InitializationState.FULLY_INITIALIZED;
  }

  /**
   * Get database storage info (web only)
   */
  getStorageInfo(): { hasStoredData: boolean; storageSize?: number } {
    if (Platform.OS !== "web") {
      return { hasStoredData: false };
    }

    return WebDatabaseManager.getStorageInfo();
  }

  /**
   * Clear browser storage (web only)
   */
  clearStorage(): void {
    if (Platform.OS === "web") {
      WebDatabaseManager.clearStorage();
    }
  }

  /**
   * Set up native SQLite database (iOS/Android)
   */
  private async setupNativeDatabase(): Promise<void> {
    if (!ExpoSQLite) {
      throw new Error(
        "Expo SQLite not available. Ensure you are running on a native platform.",
      );
    }

    console.log("📱 Setting up native SQLite database...");

    this.nativeDatabase = await ExpoSQLite.openDatabaseAsync(
      this.databaseName,
      {
        enableChangeListener: true,
      },
    );

    // Configure SQLite settings
    await this.nativeDatabase.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = 10000;
      PRAGMA temp_store = MEMORY;
    `);

    console.log("✅ Native SQLite database configured");
  }

  /**
   * Create database schema directly without using execute wrapper
   */
  private async createSchemaDirectly(): Promise<void> {
    console.log("🏗️ Creating database schema directly...");

    const schemaQueries = [
      // Dictionaries table
      `CREATE TABLE IF NOT EXISTS dictionaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Words table (main vocabulary table)
      `CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        word TEXT NOT NULL,
        transcription TEXT,
        translation TEXT,
        explanation TEXT,
        definition TEXT,
        partOfSpeech TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'en',
        level TEXT NOT NULL DEFAULT 'A1',
        isIrregular BOOLEAN DEFAULT 0,
        pronunciation BLOB,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        dictionaryId INTEGER,
        FOREIGN KEY (dictionaryId) REFERENCES dictionaries (id) ON DELETE CASCADE
      )`,

      // Examples table
      `CREATE TABLE IF NOT EXISTS examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        sentence TEXT NOT NULL,
        translation TEXT,
        wordId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wordId) REFERENCES words (id) ON DELETE CASCADE
      )`,

      // Sets table (word collections)
      `CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Set-word relationships
      `CREATE TABLE IF NOT EXISTS set_words (
        setId INTEGER NOT NULL,
        wordId INTEGER NOT NULL,
        addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (setId, wordId),
        FOREIGN KEY (setId) REFERENCES sets (id) ON DELETE CASCADE,
        FOREIGN KEY (wordId) REFERENCES words (id) ON DELETE CASCADE
      )`,

      // Tags table
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Word-tag relationships
      `CREATE TABLE IF NOT EXISTS word_tags (
        wordId INTEGER NOT NULL,
        tagId INTEGER NOT NULL,
        PRIMARY KEY (wordId, tagId),
        FOREIGN KEY (wordId) REFERENCES words (id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
      )`,

      // Irregular forms (for verbs)
      `CREATE TABLE IF NOT EXISTS irregular_forms (
        firstFormId INTEGER NOT NULL,
        secondFormId INTEGER NOT NULL,
        thirdFormId INTEGER,
        PRIMARY KEY (firstFormId, secondFormId),
        FOREIGN KEY (firstFormId) REFERENCES words (id) ON DELETE CASCADE,
        FOREIGN KEY (secondFormId) REFERENCES words (id) ON DELETE CASCADE,
        FOREIGN KEY (thirdFormId) REFERENCES words (id) ON DELETE CASCADE
      )`,

      // Study cards
      `CREATE TABLE IF NOT EXISTS study_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        dialogue TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        unitId INTEGER
      )`,

      // Study card items (words in cards)
      `CREATE TABLE IF NOT EXISTS study_card_items (
        cardId INTEGER NOT NULL,
        wordId INTEGER NOT NULL,
        PRIMARY KEY (cardId, wordId),
        FOREIGN KEY (cardId) REFERENCES study_cards (id) ON DELETE CASCADE,
        FOREIGN KEY (wordId) REFERENCES words (id) ON DELETE CASCADE
      )`,

      // Units (learning units)
      `CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Learning progress tracking
      `CREATE TABLE IF NOT EXISTS word_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wordId INTEGER NOT NULL UNIQUE,
        correctAnswers INTEGER DEFAULT 0,
        incorrectAnswers INTEGER DEFAULT 0,
        lastReviewed TEXT,
        nextReview TEXT,
        reviewInterval INTEGER DEFAULT 1,
        easeFactor REAL DEFAULT 2.5,
        averageRate REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wordId) REFERENCES words (id) ON DELETE CASCADE
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_words_dictionary_id ON words (dictionaryId)`,
      `CREATE INDEX IF NOT EXISTS idx_words_word ON words (word)`,
      `CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words (partOfSpeech)`,
      `CREATE INDEX IF NOT EXISTS idx_words_level ON words (level)`,
      `CREATE INDEX IF NOT EXISTS idx_examples_word_id ON examples (wordId)`,
      `CREATE INDEX IF NOT EXISTS idx_set_words_set_id ON set_words (setId)`,
      `CREATE INDEX IF NOT EXISTS idx_set_words_word_id ON set_words (wordId)`,
      `CREATE INDEX IF NOT EXISTS idx_word_tags_word_id ON word_tags (wordId)`,
      `CREATE INDEX IF NOT EXISTS idx_word_tags_tag_id ON word_tags (tagId)`,
      `CREATE INDEX IF NOT EXISTS idx_word_progress_word_id ON word_progress (wordId)`,
      `CREATE INDEX IF NOT EXISTS idx_word_progress_next_review ON word_progress (nextReview)`,
    ];

    if (Platform.OS === "web" && this.webDatabase) {
      // Web platform - use SQL.js
      for (const query of schemaQueries) {
        try {
          this.webDatabase.run(query);
        } catch (error) {
          console.error(`❌ Failed to execute schema query: ${query}`, error);
          throw error;
        }
      }
    } else if (this.nativeDatabase) {
      // Native platform - use Expo SQLite
      for (const query of schemaQueries) {
        try {
          await this.nativeDatabase.execAsync(query);
        } catch (error) {
          console.error(`❌ Failed to execute schema query: ${query}`, error);
          throw error;
        }
      }
    }

    console.log("✅ Database schema created successfully");
  }

  /**
   * Execute SQL query with universal platform support
   */
  async execute(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (this.initState !== InitializationState.FULLY_INITIALIZED) {
      await this.initialize();
    }

    const cleanParams = this.cleanSQLParameters(params);

    try {
      if (Platform.OS === "web" && this.webDatabase) {
        return this.executeWebQuery(sql, cleanParams);
      } else if (this.nativeDatabase) {
        return this.executeNativeQuery(sql, cleanParams);
      } else {
        throw new Error("No database connection available");
      }
    } catch (error) {
      console.error("❌ Database execution error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }

  /**
   * Execute query on web platform (SQL.js)
   */
  private executeWebQuery(sql: string, params: any[]): DatabaseResult {
    try {
      const statement = this.webDatabase.prepare(sql);
      statement.bind(params);

      const result: DatabaseResult = {
        success: true,
        data: [],
        rowsAffected: 0,
        insertId: 0,
      };

      if (statement.step()) {
        // Query returned results
        const columns = statement.getColumnNames();
        const rows: any[] = [];

        do {
          const row: any = {};
          const values = statement.get();
          columns.forEach((col: any, index: number) => {
            row[col] = values[index];
          });
          rows.push(row);
        } while (statement.step());

        result.data = rows;
      }

      // Get affected rows and insert ID for INSERT/UPDATE/DELETE
      if (sql.trim().toUpperCase().startsWith("INSERT")) {
        result.insertId =
          this.webDatabase.exec("SELECT last_insert_rowid()")[0]
            ?.values[0]?.[0] || 0;
      }

      statement.free();
      return result;
    } catch (error) {
      console.error("❌ Web query execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute query on native platform (Expo SQLite)
   */
  private async executeNativeQuery(
    sql: string,
    params: any[],
  ): Promise<DatabaseResult> {
    try {
      const result = await this.nativeDatabase.runAsync(sql, params);
      return {
        success: true,
        data: result.rows || [],
        rowsAffected: result.changes || 0,
        insertId: result.lastInsertRowId || 0,
      };
    } catch (error) {
      console.error("❌ Native query execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clean SQL parameters for WebAssembly compatibility
   */
  private cleanSQLParameters(params: any[]): any[] {
    return params.map((param) => {
      if (param === undefined) return null;
      if (typeof param === "number" && isNaN(param)) return null;
      if (typeof param === "boolean") return param ? 1 : 0;
      if (param instanceof Date) return param.toISOString();
      return param;
    });
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    if (this.initState !== InitializationState.FULLY_INITIALIZED) {
      await this.initialize();
    }

    if (Platform.OS === "web") {
      // Web platform - manual transaction management
      try {
        await this.execute("BEGIN TRANSACTION");
        const result = await callback(this.execute.bind(this));
        await this.execute("COMMIT");
        return result;
      } catch (error) {
        await this.execute("ROLLBACK");
        throw error;
      }
    } else {
      // Native platform - use Expo SQLite transaction
      return new Promise((resolve, reject) => {
        this.nativeDatabase.transactionAsync(async () => {
          try {
            const result = await callback(this.execute.bind(this));
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction<T>(
    callback: TransactionCallback<T>,
  ): Promise<DatabaseResult<T>> {
    try {
      const result = await this.transaction(callback);
      return {
        success: true,
        data: [result] as any,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  }

  /**
   * Get initialization state
   */
  getInitializationState(): string {
    return this.initState;
  }

  /**
   * Check if database is ready
   */
  isReady(): boolean {
    return this.initState === InitializationState.FULLY_INITIALIZED;
  }

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<{
    platform: string;
    state: string;
    ready: boolean;
    tableCount: number;
    totalRecords: number;
  }> {
    const baseInfo = {
      platform:
        Platform.OS === "web" ? "Web (SQL.js)" : `Native (${Platform.OS})`,
      state: this.initState,
      ready: this.isReady(),
      tableCount: 0,
      totalRecords: 0,
    };

    if (!this.isReady()) {
      return baseInfo;
    }

    try {
      const tablesResult = await this.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      );

      const tables = tablesResult.data || [];
      let totalRecords = 0;

      for (const table of tables) {
        try {
          const countResult = await this.execute(
            `SELECT COUNT(*) as count FROM "${(table as any).name}"`,
          );
          if (countResult.success && countResult.data?.[0]) {
            totalRecords += (countResult.data[0] as any).count || 0;
          }
        } catch (error) {
          console.warn(
            `Could not count records in table ${(table as any).name}:`,
            error,
          );
        }
      }

      return {
        ...baseInfo,
        tableCount: tables.length,
        totalRecords,
      };
    } catch (error) {
      console.error("Failed to get database info:", error);
      return baseInfo;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.autoSaveController) {
      WebDatabasePersistence.stopAutoSave(this.autoSaveController);
      this.autoSaveController = null;
    }

    if (Platform.OS === "web" && this.webDatabase) {
      try {
        // Save final state before cleanup
        await WebDatabasePersistence.saveToIndexedDB(this.webDatabase.export());
        this.webDatabase.close();
      } catch (error) {
        console.warn("Error during web database cleanup:", error);
      }
    }

    if (this.nativeDatabase) {
      try {
        await this.nativeDatabase.closeAsync();
      } catch (error) {
        console.warn("Error during native database cleanup:", error);
      }
    }
  }
}

// Export singleton instance for easy access
export default SQLiteUniversalService.getInstance();

// Create a convenient alias for the singleton
export const SQLiteUniversal = SQLiteUniversalService.getInstance();
