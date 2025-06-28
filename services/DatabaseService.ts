// services/DatabaseService.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

const DATABASE_NAME = "easy_english.db";

interface DatabaseInterface {
  execAsync: (sql: string, params?: any[]) => Promise<void>;
  getFirstAsync: (sql: string, params?: any[]) => Promise<any>;
  getAllAsync: (sql: string, params?: any[]) => Promise<any[]>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  closeAsync: () => Promise<void>;
}

/**
 * Database Service with platform detection
 * Single Responsibility: Manage database connections and platform detection
 * Open/Closed: Extensible for new platforms
 * Dependency Inversion: Interface-based database operations
 */
export class DatabaseService {
  private static db: DatabaseInterface | null = null;
  private static isWebPlatform = Platform.OS === "web";

  /**
   * Initialize database connection
   */
  static async initialize(): Promise<DatabaseInterface> {
    if (this.db) {
      return this.db;
    }

    if (this.isWebPlatform) {
      console.log("Web platform detected - using mock database");
      this.db = this.createMockDatabase();
    } else {
      console.log("Native platform detected - using SQLite");
      this.db = await this.createSQLiteDatabase();
    }

    return this.db;
  }

  /**
   * Create mock database for web platform
   */
  private static createMockDatabase(): DatabaseInterface {
    return {
      execAsync: async (sql: string, params?: any[]) => {
        console.log(`Mock execAsync: ${sql}`, params);
      },
      getFirstAsync: async (sql: string, params?: any[]) => {
        console.log(`Mock getFirstAsync: ${sql}`, params);
        return null;
      },
      getAllAsync: async (sql: string, params?: any[]) => {
        console.log(`Mock getAllAsync: ${sql}`, params);
        return [];
      },
      runAsync: async (sql: string, params?: any[]) => {
        console.log(`Mock runAsync: ${sql}`, params);
        return { lastInsertRowId: 1, changes: 1 };
      },
      closeAsync: async () => {
        console.log("Mock database closed");
      },
    };
  }

  /**
   * Create SQLite database for native platforms
   */
  private static async createSQLiteDatabase(): Promise<DatabaseInterface> {
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    
    try {
      const dbInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!dbInfo.exists) {
        console.log("Creating new SQLite database...");
      } else {
        console.log("Opening existing SQLite database...");
      }

      const db = SQLite.openDatabaseSync(dbPath);
      await this.initializeTables(db as DatabaseInterface);
      
      return db as DatabaseInterface;
    } catch (error) {
      console.error("Error creating SQLite database:", error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   */
  private static async initializeTables(db: DatabaseInterface): Promise<void> {
    const createQueries = [
      // Dictionaries table
      `CREATE TABLE IF NOT EXISTS dictionaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        createdAt TEXT NULL,
        updatedAt TEXT NULL
      )`,
      
      // Words table
      `CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        word TEXT NOT NULL,
        transcription TEXT,
        translation TEXT,
        explanation TEXT,
        definition TEXT,
        partOfSpeech TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'en-gb',
        level TEXT NOT NULL DEFAULT 'A1',
        isIrregular BOOLEAN DEFAULT 0,
        pronunciation BLOB,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL,
        dictionaryId INTEGER,
        FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id)
      )`,
      
      // Examples table
      `CREATE TABLE IF NOT EXISTS examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        sentence TEXT NOT NULL,
        translation TEXT,
        wordId INTEGER,
        createdAt TEXT NULL,
        updatedAt TEXT NULL,
        FOREIGN KEY (wordId) REFERENCES words(id)
      )`,
      
      // Sets table
      `CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL
      )`,
      
      // Set Words junction table
      `CREATE TABLE IF NOT EXISTS set_words (
        setId INTEGER,
        wordId INTEGER,
        PRIMARY KEY (setId, wordId),
        FOREIGN KEY (setId) REFERENCES sets(id),
        FOREIGN KEY (wordId) REFERENCES words(id)
      )`,
      
      // Tags table
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        createdAt TEXT NULL,
        updatedAt TEXT NULL
      )`,
      
      // Word Tags junction table
      `CREATE TABLE IF NOT EXISTS word_tags (
        wordId INTEGER,
        tagId INTEGER,
        PRIMARY KEY (wordId, tagId),
        FOREIGN KEY (wordId) REFERENCES words(id),
        FOREIGN KEY (tagId) REFERENCES tags(id)
      )`
    ];

    for (const query of createQueries) {
      await db.execAsync(query);
    }
    
    console.log("Database tables initialized successfully");
  }

  /**
   * Get database instance
   */
  static async getDatabase(): Promise<DatabaseInterface> {
    if (!this.db) {
      return await this.initialize();
    }
    return this.db;
  }

  /**
   * Check if running on web platform
   */
  static isWeb(): boolean {
    return this.isWebPlatform;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}