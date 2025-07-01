// services/database/MigrationService.ts
/**
 * Migration Service - Handles database migrations and initial data setup
 * 
 * This service manages:
 * - Database schema versioning
 * - Data migrations between versions
 * - Initial seed data loading
 * - Development data setup
 * 
 * Ensures database consistency across app updates and fresh installations
 */

// Import services directly instead of through index
import { SQLiteUniversal } from './SQLiteUniversalService';
import { DictionaryService } from './DictionaryService';
import { WordService } from './WordService';

// Import types directly
import type { DatabaseResult } from './SQLiteUniversalService';

// Get service instances when needed (lazy initialization)
const dictionaryService = DictionaryService.getInstance();
const wordService = WordService.getInstance();

import { PartOfSpeech } from './WordService';

export interface MigrationResult {
  success: boolean;
  currentVersion: number;
  migrationsApplied: string[];
  errors: string[];
}

export interface SeedDataOptions {
  includeSampleDictionary?: boolean;
  includeSampleWords?: boolean;
  includeExamples?: boolean;
  wordCount?: number;
}

export class MigrationService {
  private static instance: MigrationService;
  private readonly CURRENT_VERSION = 1;
  private readonly VERSION_TABLE = 'schema_version';

  private constructor() {}

  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Initialize database with version tracking
   */
  async initializeWithVersioning(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      currentVersion: 0,
      migrationsApplied: [],
      errors: []
    };

    try {
      // Ensure the database is initialized
      await SQLiteUniversal.initialize();

      // Create version table if it doesn't exist
      await this.createVersionTable();

      // Get current version
      const currentVersion = await this.getCurrentVersion();
      result.currentVersion = currentVersion;

      // Apply any needed migrations
      const migrationResults = await this.applyMigrations(currentVersion);
      result.migrationsApplied = migrationResults.applied;
      result.errors = migrationResults.errors;

      // Update version if migrations were successful
      if (migrationResults.errors.length === 0) {
        await this.updateVersion(this.CURRENT_VERSION);
        result.currentVersion = this.CURRENT_VERSION;
        result.success = true;
      }

      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown migration error');
      return result;
    }
  }

  /**
   * Create version tracking table
   */
  private async createVersionTable(): Promise<void> {
    await SQLiteUniversal.execute(
      `CREATE TABLE IF NOT EXISTS ${this.VERSION_TABLE} (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL,
        applied_at TEXT NOT NULL
      )`
    );
  }

  /**
   * Get current database version
   */
  private async getCurrentVersion(): Promise<number> {
    const result = await SQLiteUniversal.execute(
      `SELECT version FROM ${this.VERSION_TABLE} ORDER BY id DESC LIMIT 1`
    );

    if (result.success && result.data && result.data.length > 0) {
      return (result.data[0] as any).version;
    }

    return 0; // No version found, assume fresh database
  }

  /**
   * Update database version
   */
  private async updateVersion(version: number): Promise<void> {
    await SQLiteUniversal.execute(
      `INSERT INTO ${this.VERSION_TABLE} (version, applied_at) VALUES (?, ?)`,
      [version, new Date().toISOString()]
    );
  }

  /**
   * Apply migrations from current version to latest
   */
  private async applyMigrations(fromVersion: number): Promise<{
    applied: string[];
    errors: string[];
  }> {
    const applied: string[] = [];
    const errors: string[] = [];

    // Define migrations
    const migrations = [
      {
        version: 1,
        name: 'Initial Schema',
        migrate: async () => {
          // Schema is already created by SQLiteUniversalService
          // This migration is just for version tracking
          applied.push('Initial schema setup');
        }
      }
      // Future migrations would be added here
    ];

    // Apply migrations in order
    for (const migration of migrations) {
      if (migration.version > fromVersion) {
        try {
          await migration.migrate();
          applied.push(`Migration ${migration.version}: ${migration.name}`);
        } catch (error) {
          const errorMsg = `Failed migration ${migration.version}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          break; // Stop on first error
        }
      }
    }

    return { applied, errors };
  }

  /**
   * Load seed data for development and testing
   */
  async loadSeedData(options: SeedDataOptions = {}): Promise<DatabaseResult> {
    const {
      includeSampleDictionary = true,
      includeSampleWords = true,
      includeExamples = true,
      wordCount = 20
    } = options;

    try {
      let dictionaryId: number | undefined;

      // Create sample dictionary
      if (includeSampleDictionary) {
        const dictResult = await dictionaryService.createDictionary({
          guid: 'sample-dict-001',
          title: 'Sample English Dictionary',
          description: 'A sample dictionary with common English words for learning'
        });

        if (!dictResult.success) {
          return dictResult;
        }

        dictionaryId = dictResult.data![0]?.id!;
      }

      // Add sample words
      if (includeSampleWords && dictionaryId) {
        await this.createSampleWords(dictionaryId, wordCount, includeExamples);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load seed data'
      };
    }
  }

  /**
   * Create sample words with examples
   */
  private async createSampleWords(dictionaryId: number, count: number, includeExamples: boolean): Promise<void> {
    const sampleWords = [
      {
        word: 'hello',
        transcription: '/həˈləʊ/',
        translation: 'привіт',
        definition: 'A greeting used when meeting someone',
        explanation: 'Common greeting in English',
        partOfSpeech: PartOfSpeech.INTERJECTION,
        level: 'A1',
        examples: includeExamples ? [
          { sentence: 'Hello, how are you?', translation: 'Привіт, як справи?' },
          { sentence: 'She said hello to everyone.', translation: 'Вона привіталася з усіма.' }
        ] : []
      },
      {
        word: 'computer',
        transcription: '/kəmˈpjuːtə/',
        translation: 'комп\'ютер',
        definition: 'An electronic device for processing data',
        explanation: 'A machine that can store, retrieve, and process data',
        partOfSpeech: PartOfSpeech.NOUN,
        level: 'A2',
        examples: includeExamples ? [
          { sentence: 'I use my computer for work.', translation: 'Я використовую свій комп\'ютер для роботи.' },
          { sentence: 'The computer is very fast.', translation: 'Комп\'ютер дуже швидкий.' }
        ] : []
      },
      {
        word: 'beautiful',
        transcription: '/ˈbjuːtɪfʊl/',
        translation: 'красивий',
        definition: 'Pleasing to the senses, especially to look at',
        explanation: 'Used to describe something that looks very good',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        level: 'A2',
        examples: includeExamples ? [
          { sentence: 'What a beautiful day!', translation: 'Який прекрасний день!' },
          { sentence: 'She has beautiful eyes.', translation: 'У неї красиві очі.' }
        ] : []
      },
      {
        word: 'run',
        transcription: '/rʌn/',
        translation: 'бігти',
        definition: 'To move quickly on foot',
        explanation: 'To move at a speed faster than walking',
        partOfSpeech: PartOfSpeech.VERB,
        level: 'A1',
        isIrregular: true,
        examples: includeExamples ? [
          { sentence: 'I run every morning.', translation: 'Я бігаю щоранку.' },
          { sentence: 'He runs very fast.', translation: 'Він бігає дуже швидко.' }
        ] : []
      },
      {
        word: 'quickly',
        transcription: '/ˈkwɪkli/',
        translation: 'швидко',
        definition: 'At a fast speed',
        explanation: 'In a quick manner',
        partOfSpeech: PartOfSpeech.ADVERB,
        level: 'A2',
        examples: includeExamples ? [
          { sentence: 'Please come here quickly.', translation: 'Будь ласка, швидко йди сюди.' },
          { sentence: 'Time passes quickly.', translation: 'Час швидко минає.' }
        ] : []
      },
      {
        word: 'give up',
        transcription: '/ɡɪv ʌp/',
        translation: 'здаватися',
        definition: 'To stop trying to do something',
        explanation: 'To abandon an attempt or effort',
        partOfSpeech: PartOfSpeech.PHRASAL_VERB,
        level: 'B1',
        examples: includeExamples ? [
          { sentence: 'Don\'t give up on your dreams.', translation: 'Не здавайся своїх мрій.' },
          { sentence: 'I will never give up.', translation: 'Я ніколи не здамся.' }
        ] : []
      },
      {
        word: 'break a leg',
        transcription: '/breɪk ə leɡ/',
        translation: 'ні пуху ні пера',
        definition: 'Good luck (used especially in theater)',
        explanation: 'An idiom meaning "good luck", commonly used before performances',
        partOfSpeech: PartOfSpeech.IDIOM,
        level: 'B2',
        examples: includeExamples ? [
          { sentence: 'Break a leg at your audition!', translation: 'Ні пуху ні пера на прослуховуванні!' },
          { sentence: 'The director told the actors to break a leg.', translation: 'Режисер побажав акторам ні пуху ні пера.' }
        ] : []
      },
      {
        word: 'book',
        transcription: '/bʊk/',
        translation: 'книга',
        definition: 'A written or printed work consisting of pages',
        explanation: 'A set of written, printed, or blank pages bound together',
        partOfSpeech: PartOfSpeech.NOUN,
        level: 'A1',
        examples: includeExamples ? [
          { sentence: 'I love reading books.', translation: 'Я люблю читати книги.' },
          { sentence: 'This book is very interesting.', translation: 'Ця книга дуже цікава.' }
        ] : []
      },
      {
        word: 'learn',
        transcription: '/lɜːn/',
        translation: 'вчитися',
        definition: 'To acquire knowledge or skill',
        explanation: 'To gain knowledge through study or experience',
        partOfSpeech: PartOfSpeech.VERB,
        level: 'A1',
        examples: includeExamples ? [
          { sentence: 'I want to learn English.', translation: 'Я хочу вивчити англійську.' },
          { sentence: 'Children learn quickly.', translation: 'Діти швидко вчаться.' }
        ] : []
      },
      {
        word: 'important',
        transcription: '/ɪmˈpɔːtənt/',
        translation: 'важливий',
        definition: 'Of great significance or value',
        explanation: 'Having great meaning or influence',
        partOfSpeech: PartOfSpeech.ADJECTIVE,
        level: 'A2',
        examples: includeExamples ? [
          { sentence: 'Education is very important.', translation: 'Освіта дуже важлива.' },
          { sentence: 'This is an important meeting.', translation: 'Це важлива зустріч.' }
        ] : []
      }
    ];

    // Create words up to the requested count
    const wordsToCreate = sampleWords.slice(0, Math.min(count, sampleWords.length));

    for (let i = 0; i < wordsToCreate.length; i++) {
      const sampleWord = wordsToCreate[i];
      
      const wordRequest = {
        guid: `sample-word-${String(i + 1).padStart(3, '0')}`,
        word: sampleWord?.word ?? '',
        transcription: sampleWord?.transcription,
        translation: sampleWord?.translation,
        definition: sampleWord?.definition,
        explanation: sampleWord?.explanation,
        partOfSpeech: sampleWord?.partOfSpeech ?? PartOfSpeech.NOUN,
        level: sampleWord?.level,
        isIrregular: sampleWord?.isIrregular || false,
        dictionaryId,
        examples: sampleWord?.examples.map((example, exIndex) => ({
          guid: `sample-example-${String(i + 1).padStart(3, '0')}-${exIndex + 1}`,
          sentence: example.sentence,
          translation: example.translation
        }))
      };

      const result = await wordService.createWord(wordRequest);
      if (!result.success) {
        console.warn(`Failed to create sample word: ${sampleWord?.word}`, result.error);
      }
    }
  }

  /**
   * Clear all data from the database
   */
  async clearAllData(): Promise<DatabaseResult> {
    try {
      // Delete in correct order due to foreign key constraints
      await SQLiteUniversal.execute('DELETE FROM examples');
      await SQLiteUniversal.execute('DELETE FROM words');
      await SQLiteUniversal.execute('DELETE FROM dictionaries');
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear data'
      };
    }
  }

  /**
   * Reset database to fresh state
   */
  async resetDatabase(): Promise<DatabaseResult> {
    try {
      // Clear all data
      const clearResult = await this.clearAllData();
      if (!clearResult.success) {
        return clearResult;
      }

      // Reset version tracking
      await SQLiteUniversal.execute(`DELETE FROM ${this.VERSION_TABLE}`);

      // Re-initialize
      const initResult = await this.initializeWithVersioning();
      
      return {
        success: initResult.success,
        error: initResult.success ? undefined : initResult.errors.join(', ')
      } as DatabaseResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset database'
      };
    }
  }

  /**
   * Check if database needs migration
   */
  async needsMigration(): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion();
      return currentVersion < this.CURRENT_VERSION;
    } catch (error) {
      // If we can't check version, assume migration is needed
      return true;
    }
  }

  /**
   * Get database status information
   */
  async getDatabaseStatus(): Promise<{
    isInitialized: boolean;
    currentVersion: number;
    latestVersion: number;
    needsMigration: boolean;
    hasData: boolean;
  }> {
    try {
      const isInitialized = SQLiteUniversal.isReady();
      const currentVersion = await this.getCurrentVersion();
      const needsMigration = currentVersion < this.CURRENT_VERSION;
      
      // Check if database has any data
      const wordCountResult = await SQLiteUniversal.execute(
        'SELECT COUNT(*) as count FROM words'
      );
      const hasData = wordCountResult.success && 
        wordCountResult.data && 
        (wordCountResult.data[0] as any).count > 0;

      return {
        isInitialized,
        currentVersion,
        latestVersion: this.CURRENT_VERSION,
        needsMigration,
        hasData: hasData ?? false
      };
    } catch (error) {
      return {
        isInitialized: false,
        currentVersion: 0,
        latestVersion: this.CURRENT_VERSION,
        needsMigration: true,
        hasData: false
      };
    }
  }
}

// Export singleton instance
export const migrationService = MigrationService.getInstance();