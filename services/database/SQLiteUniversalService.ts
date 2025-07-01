// services/database/SQLiteUniversalService.ts - Виправлена версія
/**
 * Fixed Universal SQLite Service - Eliminates Recursive Initialization
 *
 * This revised implementation solves the recursive initialization problem
 * by separating the initialization process into distinct phases and
 * providing direct database access methods that bypass the high-level
 * execute() wrapper during setup.
 *
 * Educational insight: This demonstrates how careful separation of concerns
 * and avoiding circular dependencies is crucial in system design.
 */

import { Platform } from "react-native";

import { WebDatabasePersistence } from "./WebDatabasePersistence";

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
    console.warn(
      "Make sure SQL.js is installed: npm install sql.js @types/sql.js",
    );
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

/**
 * Initialization States for Clear Process Tracking
 * These states help us avoid recursive calls by tracking exactly
 * where we are in the initialization process
 */
enum InitializationState {
  NOT_STARTED = "NOT_STARTED",
  PLATFORM_SETUP = "PLATFORM_SETUP",
  DATABASE_CONNECTED = "DATABASE_CONNECTED",
  SCHEMA_CREATED = "SCHEMA_CREATED",
  FULLY_INITIALIZED = "FULLY_INITIALIZED",
  FAILED = "FAILED",
}

export class SQLiteUniversalService {
  private static instance: SQLiteUniversalService | null = null;
  private autoSaveController: any = null; // For stopping auto-save

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
   * Public initialization method with proper error handling
   * This method ensures initialization happens only once and handles failures gracefully
   */
  async initialize(): Promise<void> {
    // If already fully initialized, return immediately
    if (this.initState === InitializationState.FULLY_INITIALIZED) {
      console.log("✅ Database already fully initialized");
      return;
    }

    // If initialization failed before, reset and try again
    if (this.initState === InitializationState.FAILED) {
      console.log("🔄 Resetting failed initialization state");
      this.initState = InitializationState.NOT_STARTED;
      this.initializationPromise = null;
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      console.log("⏳ Initialization already in progress, waiting...");
      return this.initializationPromise;
    }

    // Start new initialization process
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Internal initialization method that does the actual work
   * This method is private to prevent external calls and ensure proper state management
   */
  private async performInitialization(): Promise<void> {
    try {
      console.log(`🚀 Starting database initialization for ${Platform.OS}`);
      this.initState = InitializationState.PLATFORM_SETUP;

      // Phase 1: Set up platform-specific database connection
      if (Platform.OS === "web") {
        await this.setupWebDatabase();
      } else {
        await this.setupNativeDatabase();
      }

      this.initState = InitializationState.DATABASE_CONNECTED;
      console.log("✅ Phase 1 complete: Database connection established");

      // Phase 2: Create database schema using direct methods (no recursive calls)
      await this.createSchemaDirectly();

      this.initState = InitializationState.SCHEMA_CREATED;
      console.log("✅ Phase 2 complete: Database schema created");

      // Phase 3: Final initialization steps
      this.initState = InitializationState.FULLY_INITIALIZED;
      console.log("🎉 Database initialization completed successfully");
    } catch (error) {
      this.initState = InitializationState.FAILED;
      this.initializationPromise = null;
      console.error("❌ Database initialization failed:", error);
      throw new Error(
        `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Set up native SQLite database (iOS/Android)
   * This method focuses solely on establishing the database connection
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

    // Configure SQLite settings directly without using our execute wrapper
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
   * Set up web SQLite database using SQL.js
   * This method handles WebAssembly loading and database creation
   */
  // private async setupWebDatabase(): Promise<void> {
  //   if (!initSqlJs) {
  //     throw new Error(
  //       "SQL.js not available. Install with: npm install sql.js @types/sql.js",
  //     );
  //   }

  //   console.log("🌐 Setting up web SQLite (SQL.js)...");

  //   // Initialize SQL.js with WebAssembly
  //   this.webSqlJs = await initSqlJs({
  //     locateFile: (filename: string) => {
  //       if (filename.endsWith(".wasm")) {
  //         const wasmPath = `/sql-wasm.wasm`;
  //         console.log(`📥 Loading WebAssembly from: ${wasmPath}`);
  //         return wasmPath;
  //       }
  //       return filename;
  //     },
  //   });

  //   // Load or create database
  //   await this.loadOrCreateWebDatabase();

  //   console.log("✅ Web SQLite database ready");
  // }

  /**
   * Load existing database from localStorage or create new one
   */
  private async loadOrCreateWebDatabase(): Promise<void> {
    const storageKey = `${this.databaseName}_backup`;

    try {
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        console.log("📂 Restoring database from localStorage...");
        const binaryData = new Uint8Array(JSON.parse(savedData));
        this.webDatabase = new this.webSqlJs.Database(binaryData);
        console.log("✅ Database restored from localStorage");
      } else {
        console.log("🆕 Creating new database...");
        this.webDatabase = new this.webSqlJs.Database();
      }
    } catch (error) {
      console.warn("⚠️ Could not restore database, creating fresh one:", error);
      this.webDatabase = new this.webSqlJs.Database();
    }
  }

  /**
   * Create database schema using direct platform methods
   * This method deliberately avoids using the execute() wrapper to prevent recursion
   */
  private async createSchemaDirectly(): Promise<void> {
    console.log("🏗️ Creating database schema directly...");

    const schemaQueries = [
      `CREATE TABLE IF NOT EXISTS dictionaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`,

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
        level TEXT,
        isIrregular INTEGER DEFAULT 0,
        dictionaryId INTEGER NOT NULL,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        sentence TEXT NOT NULL,
        translation TEXT,
        wordId INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
      )`,

      // Performance indexes
      `CREATE INDEX IF NOT EXISTS idx_words_dictionary ON words(dictionaryId)`,
      `CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words(partOfSpeech)`,
      `CREATE INDEX IF NOT EXISTS idx_words_level ON words(level)`,
      `CREATE INDEX IF NOT EXISTS idx_words_language ON words(language)`,
      `CREATE INDEX IF NOT EXISTS idx_examples_word ON examples(wordId)`,
      `CREATE INDEX IF NOT EXISTS idx_words_review ON words(lastReviewDate, reviewCount)`,
    ];

    // Execute schema queries directly on the platform-specific database
    for (let i = 0; i < schemaQueries.length; i++) {
      const query = schemaQueries[i];
      try {
        console.log(
          `📝 Executing schema query ${i + 1}/${schemaQueries.length}...`,
        );
        await this.executeDirectly(query!, []);
      } catch (error) {
        console.error(`❌ Failed to execute schema query ${i + 1}:`, query);
        throw new Error(`Schema creation failed at query ${i + 1}: ${error}`);
      }
    }

    console.log("✅ Database schema created successfully");
  }

  /**
   * Direct execution method that bypasses the high-level execute() wrapper
   * This method is used during initialization to avoid recursive calls
   */
  private async executeDirectly(sql: string, params: any[]): Promise<void> {
    if (Platform.OS === "web") {
      if (!this.webDatabase) {
        throw new Error("Web database not initialized");
      }

      const stmt = this.webDatabase.prepare(sql);
      try {
        stmt.run(params);
        // Save after schema changes
        if (sql.toLowerCase().includes("create")) {
          await this.saveWebDatabase();
        }
      } finally {
        stmt.free();
      }
    } else {
      if (!this.nativeDatabase) {
        throw new Error("Native database not initialized");
      }

      await this.nativeDatabase.runAsync(sql, params);
    }
  }

  /**
   * High-level execute method for application use
   * This method is safe to use after initialization is complete
   */
  async execute<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<DatabaseResult<T>> {
    // Ensure database is fully initialized before allowing operations
    if (this.initState !== InitializationState.FULLY_INITIALIZED) {
      await this.initialize();
    }

    try {
      const trimmedSql = sql.trim();
      console.log(
        `🔍 Executing: ${trimmedSql.substring(0, 50)}${trimmedSql.length > 50 ? "..." : ""}`,
      );

      if (Platform.OS === "web") {
        return await this.executeWebSQL<T>(sql, params);
      } else {
        return await this.executeNativeSQL<T>(sql, params);
      }
    } catch (error) {
      console.error("❌ SQL execution failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }

  /**
   * Execute SQL on native platform
   */
  private async executeNativeSQL<T>(
    sql: string,
    params: any[],
  ): Promise<DatabaseResult<T>> {
    const sqlType = sql.trim().toLowerCase();

    if (sqlType.startsWith("select")) {
      const result = await this.nativeDatabase.getAllAsync(sql, params);
      return {
        success: true,
        data: result as T[],
        rowsAffected: result.length,
      };
    } else {
      const result = await this.nativeDatabase.runAsync(sql, params);
      return {
        success: true,
        rowsAffected: result.changes,
        insertId: result.lastInsertRowId,
      };
    }
  }

  // /**
  //  * Execute SQL on web platform
  //  */
  // private async executeWebSQL<T>(
  //   sql: string,
  //   params: any[],
  // ): Promise<DatabaseResult<T>> {
  //   const cleanedParams = this.cleanSQLParameters(params);
  //   const statement = this.webDatabase.prepare(sql);

  //   try {
  //     if (sql.trim().toLowerCase().startsWith("select")) {
  //       const results: T[] = [];

  //       if (cleanedParams.length > 0) {
  //         statement.bind(cleanedParams);
  //       }

  //       while (statement.step()) {
  //         results.push(statement.getAsObject() as T);
  //       }

  //       return {
  //         success: true,
  //         data: results,
  //         rowsAffected: results.length,
  //       };
  //     } else {
  //       const result = statement.run(cleanedParams);
  //       await this.saveWebDatabase();

  //       // Правильно обробляємо insertId
  //       const insertId = result.lastInsertRowid;
  //       const rowsModified = this.webDatabase.getRowsModified();

  //       return {
  //         success: true,
  //         rowsAffected: rowsModified,
  //         // Переконуємося, що insertId є числом або undefined
  //         insertId: typeof insertId === "number" ? insertId : 0,
  //       };
  //     }
  //   } finally {
  //     statement.free();
  //   }
  // }

  /**
   * Clean SQL parameters to remove undefined values and ensure compatibility with WebAssembly
   * This method converts JavaScript types to formats that SQL.js can understand
   */
  private cleanSQLParameters(params: any[]): any[] {
    return params.map((param) => {
      // Convert undefined to null (SQL NULL)
      if (param === undefined) {
        return null;
      }

      // Convert NaN to null
      if (typeof param === "number" && isNaN(param)) {
        return null;
      }

      // Ensure strings are properly encoded
      if (typeof param === "string") {
        return param;
      }

      // Convert boolean to integer (SQLite standard)
      if (typeof param === "boolean") {
        return param ? 1 : 0;
      }

      // Convert dates to ISO strings
      if (param instanceof Date) {
        return param.toISOString();
      }

      // For all other types, return as-is or convert to string
      return param;
    });
  }

  // /**
  //  * Save web database to localStorage
  //  */
  // private async saveWebDatabase(): Promise<void> {
  //   if (Platform.OS === "web" && this.webDatabase) {
  //     try {
  //       const data = this.webDatabase.export();
  //       const jsonString = JSON.stringify(Array.from(data));
  //       localStorage.setItem(`${this.databaseName}_backup`, jsonString);
  //     } catch (error) {
  //       console.error("⚠️ Failed to save database:", error);
  //     }
  //   }
  // }

  /**
   * Get current initialization state for debugging
   */
  getInitializationState(): string {
    return this.initState;
  }

  /**
   * Check if database is ready for use
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
            `Could not count records in table ${(table as any).name}`,
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
   * Execute multiple SQL statements in a transaction
   * Ensures atomicity - either all operations succeed or all are rolled back
   */
  async executeTransaction<T>(
    callback: TransactionCallback<T>,
  ): Promise<DatabaseResult<T>> {
    // Ensure database is fully initialized before allowing operations
    if (this.initState !== InitializationState.FULLY_INITIALIZED) {
      await this.initialize();
    }

    try {
      console.log("🔄 Starting database transaction...");

      if (Platform.OS === "web") {
        return await this.executeWebTransaction(callback);
      } else {
        return await this.executeNativeTransaction(callback);
      }
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  }

  /**
   * Execute transaction on web platform (SQL.js)
   */
  private async executeWebTransaction<T>(
    callback: TransactionCallback<T>,
  ): Promise<DatabaseResult<T>> {
    if (!this.webDatabase) {
      throw new Error("Web database not initialized");
    }

    // SQL.js doesn't have explicit transaction support, but we can simulate it
    // by creating a savepoint and rolling back if needed
    const savepoint = `sp_${Date.now()}`;

    try {
      // Create savepoint
      await this.executeDirectly(`SAVEPOINT ${savepoint}`, []);

      // Create transaction executor
      const transactionExecute = async (
        sql: string,
        params: any[] = [],
      ): Promise<DatabaseResult> => {
        return this.executeWebSQL(sql, params);
      };

      // Execute callback
      const result = await callback(transactionExecute);

      // Release savepoint (commit)
      await this.executeDirectly(`RELEASE SAVEPOINT ${savepoint}`, []);

      // Save database after successful transaction
      await this.saveWebDatabase();

      console.log("✅ Web transaction completed successfully");

      return {
        success: true,
        data: [result],
      };
    } catch (error) {
      // Rollback to savepoint
      try {
        await this.executeDirectly(`ROLLBACK TO SAVEPOINT ${savepoint}`, []);
        await this.executeDirectly(`RELEASE SAVEPOINT ${savepoint}`, []);
      } catch (rollbackError) {
        console.error("❌ Failed to rollback transaction:", rollbackError);
      }

      throw error;
    }
  }

  /**
   * Execute transaction on native platform (Expo SQLite)
   */
  private async executeNativeTransaction<T>(
    callback: TransactionCallback<T>,
  ): Promise<DatabaseResult<T>> {
    if (!this.nativeDatabase) {
      throw new Error("Native database not initialized");
    }

    try {
      // Use Expo SQLite's withTransactionAsync method
      const result = await this.nativeDatabase.withTransactionAsync(
        async () => {
          // Create transaction executor
          const transactionExecute = async (
            sql: string,
            params: any[] = [],
          ): Promise<DatabaseResult> => {
            return this.executeNativeSQL(sql, params);
          };

          // Execute callback and return result
          return await callback(transactionExecute);
        },
      );

      console.log("✅ Native transaction completed successfully");

      return {
        success: true,
        data: [result],
      };
    } catch (error) {
      // Expo SQLite automatically rolls back on error
      throw error;
    }
  }

  // Also add this method to complete the web SQL implementation:

  /**
   * Complete executeWebSQL method with proper insertId handling
   */
  // private async executeWebSQL<T>(
  //   sql: string,
  //   params: any[],
  // ): Promise<DatabaseResult<T>> {
  //   const cleanedParams = this.cleanSQLParameters(params);
  //   const statement = this.webDatabase.prepare(sql);

  //   try {
  //     if (sql.trim().toLowerCase().startsWith("select")) {
  //       const results: T[] = [];

  //       if (cleanedParams.length > 0) {
  //         statement.bind(cleanedParams);
  //       }

  //       while (statement.step()) {
  //         results.push(statement.getAsObject() as T);
  //       }

  //       return {
  //         success: true,
  //         data: results,
  //         rowsAffected: results.length,
  //       };
  //     } else {
  //       const result = statement.run(cleanedParams);

  //       // Save database after modification
  //       if (
  //         sql.trim().toLowerCase().startsWith("insert") ||
  //         sql.trim().toLowerCase().startsWith("update") ||
  //         sql.trim().toLowerCase().startsWith("delete")
  //       ) {
  //         await this.saveWebDatabase();
  //       }

  //       // Handle insertId properly
  //       const insertId = result.lastInsertRowid;
  //       const rowsModified = this.webDatabase.getRowsModified();

  //       return {
  //         success: true,
  //         rowsAffected: rowsModified,
  //         insertId: typeof insertId === "number" ? insertId : 0,
  //       };
  //     }
  //   } finally {
  //     statement.free();
  //   }
  // }

  /**
   * Set up web SQLite database using SQL.js with persistence
   */
  // private async setupWebDatabase(): Promise<void> {
  //   if (!initSqlJs) {
  //     throw new Error("SQL.js not available. Install with: npm install sql.js");
  //   }

  //   console.log("🌐 Setting up web SQLite database with persistence...");

  //   // Initialize SQL.js
  //   this.webSqlJs = await initSqlJs({
  //     locateFile: (file: string) => {
  //       return `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`;
  //     },
  //   });

  //   // Try to load existing database
  //   const existingDb = await WebDatabasePersistence.loadExistingDatabase();

  //   if (existingDb) {
  //     // Load existing database
  //     this.webDatabase = new this.webSqlJs.Database(existingDb);
  //     console.log("✅ Existing database loaded from storage");
  //   } else {
  //     // Create new database
  //     this.webDatabase = new this.webSqlJs.Database();
  //     console.log("✅ New database created");
  //   }

  //   // Start auto-save (every 10 seconds)
  //   this.autoSaveController = WebDatabasePersistence.startAutoSave(
  //     this.webDatabase,
  //     10000, // 10 seconds
  //   );

  //   console.log("✅ Web SQLite database configured with auto-save");
  // }

  /**
   * Fixed setupWebDatabase method
   * Resolves SQL.js WebAssembly initialization issues
   */

  private async setupWebDatabase(): Promise<void> {
    if (!initSqlJs) {
      throw new Error(
        "SQL.js not available. Install with: npm install sql.js @types/sql.js",
      );
    }

    console.log("🌐 Setting up web SQLite database with persistence...");

    try {
      // Initialize SQL.js with proper WASM configuration
      this.webSqlJs = await initSqlJs({
        // Use local WASM file or CDN as fallback
        locateFile: (file: string) => {
          // Try local first (if you have the files in public folder)
          if (file.endsWith(".wasm")) {
            // Option 1: Use CDN (most reliable)
            return `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`;

            // Option 2: Use local files (uncomment if you have them in public/)
            // return `/sql.js/${file}`;
          }
          return file;
        },
      });

      console.log("✅ SQL.js WebAssembly module loaded successfully");

      // Try to load existing database
      let existingDb: Uint8Array | null = null;

      try {
        existingDb = await WebDatabasePersistence.loadExistingDatabase();
      } catch (error) {
        console.warn(
          "⚠️ Could not load existing database, will create new one:",
          error,
        );
      }

      if (existingDb) {
        // Load existing database
        this.webDatabase = new this.webSqlJs.Database(existingDb);
        console.log("✅ Existing database loaded from storage");
      } else {
        // Create new database
        this.webDatabase = new this.webSqlJs.Database();
        console.log("✅ New database created");
      }

      // Start auto-save (every 15 seconds for better performance)
      this.autoSaveController = WebDatabasePersistence.startAutoSave(
        this.webDatabase,
        15000, // 15 seconds
      );

      console.log("✅ Web SQLite database configured with auto-save");
    } catch (error) {
      console.error("❌ Failed to setup web database:", error);

      // Fallback: try without persistence
      try {
        console.log("🔄 Trying fallback initialization without persistence...");

        this.webSqlJs = await initSqlJs({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`;
          },
        });

        this.webDatabase = new this.webSqlJs.Database();
        console.log("✅ Fallback database created (no persistence)");
      } catch (fallbackError) {
        console.error("❌ Fallback initialization also failed:", fallbackError);
        throw new Error(
          `Failed to initialize web database: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  /**
   * Save web database to persistent storage
   */
  private async saveWebDatabase(): Promise<void> {
    if (!this.webDatabase) return;

    try {
      const dbBinary = this.webDatabase.export();
      await WebDatabasePersistence.saveToIndexedDB(dbBinary);
      WebDatabasePersistence.saveToLocalStorage(dbBinary);
    } catch (error) {
      console.error("❌ Failed to save web database:", error);
    }
  }

  /**
   * Enhanced executeWebSQL with auto-save trigger
   */
  private async executeWebSQL<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<DatabaseResult<T>> {
    if (!this.webDatabase) {
      throw new Error("Web database not initialized");
    }

    try {
      const isWriteOperation =
        /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql);

      if (isWriteOperation) {
        // Use prepared statement for write operations
        const stmt = this.webDatabase.prepare(sql);
        try {
          stmt.run(params);
          const changes = this.webDatabase.getRowsModified();

          // Save after write operations
          await this.saveWebDatabase();

          return {
            success: true,
            data: [],
            rowsAffected: changes,
            insertId: sql.toLowerCase().includes("insert")
              ? (this.webDatabase.exec("SELECT last_insert_rowid()")[0]
                  ?.values[0]?.[0] as number)
              : 0,
          };
        } finally {
          stmt.free();
        }
      } else {
        // Use exec for read operations
        const results = this.webDatabase.exec(sql, params);

        if (results.length === 0) {
          return { success: true, data: [] };
        }

        const result = results[0];
        const data = result.values.map((row: any) => {
          const obj: any = {};
          result.columns.forEach((col: any, index: any) => {
            obj[col] = row[index];
          });
          return obj;
        });

        return { success: true, data };
      }
    } catch (error) {
      console.error("❌ Web SQL execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Enhanced cleanup method
   */
  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up database connections...");

    if (Platform.OS === "web") {
      // Stop auto-save
      if (this.autoSaveController) {
        this.autoSaveController.stop();
        this.autoSaveController = null;
      }

      // Final save before cleanup
      await this.saveWebDatabase();

      if (this.webDatabase) {
        this.webDatabase.close();
        this.webDatabase = null;
      }
    } else {
      if (this.nativeDatabase) {
        await this.nativeDatabase.closeAsync();
        this.nativeDatabase = null;
      }
    }

    this.initState = InitializationState.NOT_STARTED;
    this.initializationPromise = null;

    console.log("✅ Database cleanup completed");
  }

  /**
   * Manual save trigger
   */
  async saveNow(): Promise<boolean> {
    if (Platform.OS === "web" && this.webDatabase) {
      try {
        await this.saveWebDatabase();
        console.log("💾 Database manually saved");
        return true;
      } catch (error) {
        console.error("❌ Manual save failed:", error);
        return false;
      }
    }
    return false;
  }

  /**
   * Export database for download
   */
  exportDatabase(): boolean {
    if (Platform.OS === "web" && this.webDatabase) {
      WebDatabasePersistence.exportDatabaseFile(this.webDatabase);
      return true;
    }
    return false;
  }

  /**
   * Reset database (clear all data and storage)
   */
  async resetDatabase(): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        // Stop auto-save
        if (this.autoSaveController) {
          this.autoSaveController.stop();
          this.autoSaveController = null;
        }

        // Clear persistent storage
        await WebDatabasePersistence.clearStoredDatabase();

        // Create new database
        if (this.webSqlJs) {
          this.webDatabase = new this.webSqlJs.Database();

          // Recreate schema
          await this.createSchemaDirectly();

          // Restart auto-save
          this.autoSaveController = WebDatabasePersistence.startAutoSave(
            this.webDatabase,
            10000,
          );
        }
      }

      console.log("🔄 Database reset completed");
      return true;
    } catch (error) {
      console.error("❌ Database reset failed:", error);
      return false;
    }
  }
}

// Export both class and singleton instance
export const SQLiteUniversal = SQLiteUniversalService.getInstance();

// Make database utilities available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).SQLiteUniversal = SQLiteUniversal;
  (window as any).WebDatabasePersistence = WebDatabasePersistence;

  console.log(`
🔧 Database utilities available in console:

// Manual operations:
SQLiteUniversal.saveNow()           // Force save
SQLiteUniversal.exportDatabase()    // Download .db file
SQLiteUniversal.resetDatabase()     // Clear everything

// Persistence utilities:
WebDatabasePersistence.exportDatabaseFile(db)
WebDatabasePersistence.clearStoredDatabase()
  `);
}
