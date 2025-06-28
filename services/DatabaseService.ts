// services/DatabaseService.ts
import { Platform } from "react-native";

const DATABASE_NAME = "easy_english.db";

// Import SQLite only for native platforms to avoid web compilation issues
let SQLite: any = null;
let FileSystem: any = null;

if (Platform.OS !== "web") {
  try {
    // Dynamic import for native platforms only
    SQLite = require("expo-sqlite");
    FileSystem = require("expo-file-system");
  } catch (error) {
    console.warn("SQLite modules not available:", error);
  }
}

interface DatabaseInterface {
  execAsync: (sql: string, params?: any[]) => Promise<void>;
  getFirstAsync: (sql: string, params?: any[]) => Promise<any>;
  getAllAsync: (sql: string, params?: any[]) => Promise<any[]>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  closeAsync: () => Promise<void>;
}

/**
 * Database Service with platform detection and proper SQLite handling
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
    if (!SQLite || !FileSystem) {
      throw new Error("SQLite modules are not available on this platform");
    }

    try {
      // For Expo SDK 52+, use the new openDatabaseSync API
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      
      // Initialize tables
      await this.initializeTables(db);
      
      console.log("SQLite database opened successfully");
      return db;
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
      )`,

      // Grammar tests table
      `CREATE TABLE IF NOT EXISTS grammar_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL
      )`,

      // Grammar topics table
      `CREATE TABLE IF NOT EXISTS grammar_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'en',
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL,
        topicId INTEGER,
        FOREIGN KEY (topicId) REFERENCES grammar_topics(id)
      )`,

      // Grammar topic tests junction table
      `CREATE TABLE IF NOT EXISTS grammar_topic_tests (
        topicId INTEGER,
        testId INTEGER,
        PRIMARY KEY (topicId, testId),
        FOREIGN KEY (topicId) REFERENCES grammar_topics(id),
        FOREIGN KEY (testId) REFERENCES grammar_tests(id)
      )`,

      // Test cards table
      `CREATE TABLE IF NOT EXISTS test_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        testType TEXT,
        title TEXT NOT NULL,
        description TEXT,
        text TEXT,
        mask TEXT,
        options TEXT,
        correctAnswers TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL,
        testId INTEGER,
        FOREIGN KEY (testId) REFERENCES grammar_tests(id)
      )`,

      // Study cards table
      `CREATE TABLE IF NOT EXISTS study_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        dialogue TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        rate INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL,
        unitId INTEGER
      )`,

      // Units table
      `CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        lastReviewDate TEXT,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT NULL,
        updatedAt TEXT NULL
      )`,

      // Study card items junction table
      `CREATE TABLE IF NOT EXISTS study_card_items (
        cardId INTEGER,
        wordId INTEGER,
        PRIMARY KEY (cardId, wordId),
        FOREIGN KEY (cardId) REFERENCES study_cards(id),
        FOREIGN KEY (wordId) REFERENCES words(id)
      )`,

      // Irregular forms table
      `CREATE TABLE IF NOT EXISTS irregular_forms (
        firstFormId INTEGER NOT NULL,
        secondFormId INTEGER NOT NULL,
        thirdFormId INTEGER,
        PRIMARY KEY (firstFormId, secondFormId),
        FOREIGN KEY (firstFormId) REFERENCES words(id),
        FOREIGN KEY (secondFormId) REFERENCES words(id),
        FOREIGN KEY (thirdFormId) REFERENCES words(id)
      )`
    ];

    for (const query of createQueries) {
      try {
        await db.execAsync(query);
      } catch (error) {
        console.error(`Failed to execute query: ${query}`, error);
        throw error;
      }
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

  /**
   * Test database connection and operations
   */
  static async testConnection(): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      
      if (this.isWebPlatform) {
        // For web, just check that mock database works
        await db.getAllAsync("SELECT 1");
        return true;
      } else {
        // For native, test actual SQLite operations
        const result = await db.getFirstAsync("SELECT 1 as test");
        return result?.test === 1;
      }
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
}