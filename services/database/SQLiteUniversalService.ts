// services/database/SQLiteUniversalService.ts - Fixed version with proper WebAssembly loading
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
}

export class SQLiteUniversalService {
  private static instance: SQLiteUniversalService | null = null;
  private autoSaveController: any = null;

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
   * Fixed web database setup with proper WebAssembly configuration
   */
  private async setupWebDatabase(): Promise<void> {
    if (!initSqlJs) {
      throw new Error("SQL.js not available. Install with: npm install sql.js @types/sql.js");
    }

    console.log("🌐 Setting up web SQLite database with persistence...");

    try {
      // Try multiple WebAssembly loading strategies
      let sqlJsConfig: any = {};

      // Strategy 1: Try local WASM file first (if exists)
      try {
        const wasmResponse = await fetch('/sql-wasm.wasm');
        if (wasmResponse.ok) {
          console.log("📁 Using local WASM file");
          sqlJsConfig = {
            locateFile: (file: string) => {
              if (file.endsWith('.wasm')) {
                return '/sql-wasm.wasm';
              }
              return file;
            }
          };
        } else {
          throw new Error('Local WASM not found');
        }
      } catch (localError) {
        console.log("📡 Local WASM not available, using CDN...");
        
        // Strategy 2: Use reliable CDN
        sqlJsConfig = {
          locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
              return `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`;
            }
            return file;
          }
        };
      }

      // Initialize SQL.js with the chosen configuration
      this.webSqlJs = await initSqlJs(sqlJsConfig);
      console.log("✅ SQL.js WebAssembly module loaded successfully");

      // Try to load existing database
      let existingDb: Uint8Array | null = null;
      try {
        existingDb = await WebDatabasePersistence.loadExistingDatabase();
      } catch (error) {
        console.warn("⚠️ Could not load existing database, will create new one:", error);
      }

      if (existingDb) {
        this.webDatabase = new this.webSqlJs.Database(existingDb);
        console.log("✅ Existing database loaded from storage");
      } else {
        this.webDatabase = new this.webSqlJs.Database();
        console.log("✅ New database created");
      }

      // Start auto-save
      this.autoSaveController = WebDatabasePersistence.startAutoSave(
        this.webDatabase,
        15000, // 15 seconds
      );

      console.log("✅ Web SQLite database configured with auto-save");
    } catch (error) {
      console.error("❌ Failed to setup web database:", error);
      
      // Final fallback: Try with minimal configuration
      try {
        console.log("🔄 Trying minimal WebAssembly configuration...");
        
        this.webSqlJs = await initSqlJs();
        this.webDatabase = new this.webSqlJs.Database();
        
        console.log("✅ Minimal database created (no persistence)");
      } catch (fallbackError) {
        console.error("❌ All WebAssembly loading strategies failed:", fallbackError);
        throw new Error(`Failed to initialize SQL.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Set up native SQLite database (iOS/Android)
   */
  private async setupNativeDatabase(): Promise<void> {
    if (!ExpoSQLite) {
      throw new Error("Expo SQLite not available. Ensure you are running on a native platform.");
    }

    console.log("📱 Setting up native SQLite database...");

    this.nativeDatabase = await ExpoSQLite.openDatabaseAsync(this.databaseName, {
      enableChangeListener: true,
    });

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
      `CREATE TABLE IF NOT EXISTS dictionaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        language_code TEXT NOT NULL DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0
      )`,
      
      `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dictionary_id INTEGER NOT NULL,
        english_word TEXT NOT NULL,
        ukrainian_translation TEXT NOT NULL,
        part_of_speech TEXT,
        pronunciation TEXT,
        definition TEXT,
        example_sentence TEXT,
        example_translation TEXT,
        difficulty_level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (dictionary_id) REFERENCES dictionaries (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS learning_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        last_reviewed DATETIME,
        next_review DATETIME,
        review_interval INTEGER DEFAULT 1,
        ease_factor REAL DEFAULT 2.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
      )`,
      
      `CREATE INDEX IF NOT EXISTS idx_cards_dictionary_id ON cards (dictionary_id)`,
      `CREATE INDEX IF NOT EXISTS idx_cards_english_word ON cards (english_word)`,
      `CREATE INDEX IF NOT EXISTS idx_learning_progress_card_id ON learning_progress (card_id)`,
      `CREATE INDEX IF NOT EXISTS idx_learning_progress_next_review ON learning_progress (next_review)`
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
  async execute(
    sql: string,
    params: any[] = []
  ): Promise<DatabaseResult> {
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
        error: error instanceof Error ? error.message : "Unknown database error",
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
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        result.insertId = this.webDatabase.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0;
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
  private async executeNativeQuery(sql: string, params: any[]): Promise<DatabaseResult> {
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
      platform: Platform.OS === "web" ? "Web (SQL.js)" : `Native (${Platform.OS})`,
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
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );

      const tables = tablesResult.data || [];
      let totalRecords = 0;

      for (const table of tables) {
        try {
          const countResult = await this.execute(
            `SELECT COUNT(*) as count FROM "${(table as any).name}"`
          );
          if (countResult.success && countResult.data?.[0]) {
            totalRecords += (countResult.data[0] as any).count || 0;
          }
        } catch (error) {
          console.warn(`Could not count records in table ${(table as any).name}:`, error);
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