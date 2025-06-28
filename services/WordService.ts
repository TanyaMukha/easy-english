}
  }

  /**
   * Update word with examples
   */
  static async update(id: number, request: UpdateWordRequest): Promise<WordResponse> {
    try {
      const validation = this.validateUpdateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || "Invalid data",
        };
      }

      await MockDataService.delay();

      const now = new Date().toISOString();

      if (DatabaseService.isWeb()) {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return {
            success: false,
            error: "Word not found",
          };
        }

        // Update word
        const updatedWord = {
          ...MockDataService.mockWords[wordIndex],
          ...(request.word && { word: request.word.trim() }),
          ...(request.transcription !== undefined && { transcription: request.transcription?.trim() }),
          ...(request.translation !== undefined && { translation: request.translation?.trim() }),
          ...(request.explanation !== undefined && { explanation: request.explanation?.trim() }),
          ...(request.definition !== undefined && { definition: request.definition?.trim() }),
          ...(request.partOfSpeech && { partOfSpeech: request.partOfSpeech }),
          ...(request.language && { language: request.language }),
          ...(request.level && { level: request.level }),
          ...(request.isIrregular !== undefined && { isIrregular: request.isIrregular }),
          ...(request.dictionaryId && { dictionaryId: request.dictionaryId }),
          updatedAt: now,
        };

        MockDataService.mockWords[wordIndex] = updatedWord;

        // Update examples if provided
        if (request.examples) {
          // Remove old examples
          MockDataService.mockExamples = MockDataService.mockExamples.filter(e => e.wordId !== id);
          
          // Add new examples
          for (const exampleData of request.examples) {
            if (exampleData.sentence.trim()) {
              const example: Example = {
                id: MockDataService.getNextId('example'),
                guid: MockDataService.generateGuid(),
                sentence: exampleData.sentence.trim(),
                translation: exampleData.translation?.trim(),
                wordId: id,
                createdAt: now,
                updatedAt: null,
              };
              
              MockDataService.mockExamples.push(example);
            }
          }
        }

        const examples = MockDataService.mockExamples.filter(e => e.wordId === id);
        const dictionary = MockDataService.mockDictionaries.find(d => d.id === updatedWord.dictionaryId)!;

        const wordWithExamples: WordWithExamples = {
          ...updatedWord,
          examples,
          tags: [],
          dictionary,
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Update word
        const updateFields: string[] = [];
        const values: any[] = [];

        if (request.word) {
          updateFields.push('word = ?');
          values.push(request.word.trim());
        }

        if (request.transcription !== undefined) {
          updateFields.push('transcription = ?');
          values.push(request.transcription?.trim() || null);
        }

        if (request.translation !== undefined) {
          updateFields.push('translation = ?');
          values.push(request.translation?.trim() || null);
        }

        if (request.explanation !== undefined) {
          updateFields.push('explanation = ?');
          values.push(request.explanation?.trim() || null);
        }

        if (request.definition !== undefined) {
          updateFields.push('definition = ?');
          values.push(request.definition?.trim() || null);
        }

        if (request.partOfSpeech) {
          updateFields.push('partOfSpeech = ?');
          values.push(request.partOfSpeech);
        }

        if (request.language) {
          updateFields.push('language = ?');
          values.push(request.language);
        }

        if (request.level) {
          updateFields.push('level = ?');
          values.push(request.level);
        }

        if (request.isIrregular !== undefined) {
          updateFields.push('isIrregular = ?');
          values.push(request.isIrregular ? 1 : 0);
        }

        if (request.dictionaryId) {
          updateFields.push('dictionaryId = ?');
          values.push(request.dictionaryId);
        }

        updateFields.push('updatedAt = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
          `UPDATE words SET ${updateFields.join(', ')} WHERE id = ?`,
          values
        );

        // Update examples if provided
        if (request.examples) {
          // Delete old examples
          await db.runAsync('DELETE FROM examples WHERE wordId = ?', [id]);
          
          // Insert new examples
          for (const exampleData of request.examples) {
            if (exampleData.sentence.trim()) {
              const exampleGuid = MockDataService.generateGuid();
              await db.runAsync(
                'INSERT INTO examples (guid, sentence, translation, wordId, createdAt) VALUES (?, ?, ?, ?, ?)',
                [exampleGuid, exampleData.sentence.trim(), exampleData.translation?.trim() || null, id, now]
              );
            }
          }
        }

        // Get updated word with examples
        const updated = await db.getFirstAsync(`
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          WHERE w.id = ?
        `, [id]);

        const examples = await db.getAllAsync(
          'SELECT * FROM examples WHERE wordId = ?',
          [id]
        );

        const wordWithExamples: WordWithExamples = {
          ...updated,
          examples,
          tags: [],
          dictionary: { id: updated.dictionaryId, title: updated.dictionaryTitle },
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      }
    } catch (error) {
      console.error('Error updating word:', error);
      return {
        success: false,
        error: "Failed to update word",
      };
    }
  }

  /**
   * Delete word and its examples
   */
  static async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return {
            success: false,
            error: "Word not found",
          };
        }

        // Remove word, its examples, and set relationships
        MockDataService.mockWords.splice(wordIndex, 1);
        MockDataService.mockExamples = MockDataService.mockExamples.filter(e => e.wordId !== id);
        MockDataService.mockSetWords = MockDataService.mockSetWords.filter(sw => sw.wordId !== id);

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Delete examples first (foreign key constraint)
        await db.runAsync('DELETE FROM examples WHERE wordId = ?', [id]);
        
        // Delete set-word relationships
        await db.runAsync('DELETE FROM set_words WHERE wordId = ?', [id]);
        
        // Delete word
        await db.runAsync('DELETE FROM words WHERE id = ?', [id]);

        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      return {
        success: false,
        error: "Failed to delete word",
      };
    }
  }

  /**
   * Update word review statistics
   */
  static async updateReviewStats(id: number, rate: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      const now = new Date().toISOString();

      if (DatabaseService.isWeb()) {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return {
            success: false,
            error: "Word not found",
          };
        }

        MockDataService.mockWords[wordIndex] = {
          ...MockDataService.mockWords[wordIndex],
          lastReviewDate: now,
          reviewCount: MockDataService.mockWords[wordIndex].reviewCount + 1,
          rate: Math.max(0, Math.min(5, rate)), // Clamp between 0-5
          updatedAt: now,
        };

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        await db.runAsync(`
          UPDATE words 
          SET lastReviewDate = ?, reviewCount = reviewCount + 1, rate = ?, updatedAt = ?
          WHERE id = ?
        `, [now, Math.max(0, Math.min(5, rate)), now, id]);

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating review stats:', error);
      return {
        success: false,
        error: "Failed to update review statistics",
      };
    }
  }

  /**
   * Get words by dictionary ID
   */
  static async getByDictionaryId(dictionaryId: number, limit?: number): Promise<WordsListResponse> {
    const filters: WordFilters = {
      dictionaryId,
      limit: limit || 50,
      offset: 0,
      sortBy: 'word',
      sortOrder: 'asc',
    };

    return this.getAll(filters);
  }

  /**
   * Search words by query
   */
  static async search(query: string, limit?: number): Promise<WordsListResponse> {
    const filters: WordFilters = {
      search: query,
      limit: limit || 20,
      offset: 0,
      sortBy: 'word',
      sortOrder: 'asc',
    };

    return this.getAll(filters);
  }

  /**
   * Get random words for practice
   */
  static async getRandomWords(count: number = 10, filters?: Partial<WordFilters>): Promise<WordsListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        let filteredWords = [...MockDataService.mockWords];

        // Apply basic filters
        if (filters?.dictionaryId) {
          filteredWords = filteredWords.filter(w => w.dictionaryId === filters.dictionaryId);
        }

        if (filters?.level) {
          filteredWords = filteredWords.filter(w => w.level === filters.level);
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          filteredWords = filteredWords.filter(w => 
            filters.partOfSpeech!.includes(w.partOfSpeech)
          );
        }

        // Shuffle and take random words
        const shuffled = filteredWords.sort(() => Math.random() - 0.5);
        const randomWords = shuffled.slice(0, Math.min(count, shuffled.length));

        // Add examples and dictionary info
        const wordsWithExamples: WordWithExamples[] = randomWords.map(word => ({
          ...word,
          examples: MockDataService.mockExamples.filter(e => e.wordId === word.id),
          tags: [],
          dictionary: MockDataService.mockDictionaries.find(d => d.id === word.dictionaryId)!,
          nextReviewDate: null,
        }));

        return {
          success: true,
          data: wordsWithExamples,
          total: filteredWords.length,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        let whereClause = '';
        const params: any[] = [];
        const conditions: string[] = [];

        if (filters?.dictionaryId) {
          conditions.push('w.dictionaryId = ?');
          params.push(filters.dictionaryId);
        }

        if (filters?.level) {
          conditions.push('w.level = ?');
          params.push(filters.level);
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          const placeholders = filters.partOfSpeech.map(() => '?').join(',');
          conditions.push(`w.partOfSpeech IN (${placeholders})`);
          params.push(...filters.partOfSpeech);
        }

        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const query = `
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          ${whereClause}
          ORDER BY RANDOM()
          LIMIT ${count}
        `;

        const words = await db.getAllAsync(query, params);

        // Get examples for each word
        const wordsWithExamples: WordWithExamples[] = [];
        for (const word of words) {
          const examples = await db.getAllAsync(
            'SELECT * FROM examples WHERE wordId = ?',
            [word.id]
          );
          
          wordsWithExamples.push({
            ...word,
            examples,
            tags: [],
            dictionary: { id: word.dictionaryId, title: word.dictionaryTitle },
            nextReviewDate: null,
          });
        }

        return {
          success: true,
          data: wordsWithExamples,
          total: words.length,
        };
      }
    } catch (error) {
      console.error('Error getting random words:', error);
      return {
        success: false,
        error: "Failed to get random words",
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateWordRequest): ValidationResult {
    if (!request.word || typeof request.word !== 'string') {
      return { isValid: false, error: "Word is required" };
    }

    if (request.word.trim().length === 0) {
      return { isValid: false, error: "Word cannot be empty" };
    }

    if (request.word.trim().length > 100) {
      return { isValid: false, error: "Word too long (max 100 characters)" };
    }

    if (!request.partOfSpeech || !Object.values(PartOfSpeech).includes(request.partOfSpeech)) {
      return { isValid: false, error: "Valid part of speech is required" };
    }

    if (!request.dictionaryId || typeof request.dictionaryId !== 'number') {
      return { isValid: false, error: "Dictionary ID is required" };
    }

    if (request.transcription && request.transcription.length > 200) {
      return { isValid: false, error: "Transcription too long (max 200 characters)" };
    }

    if (request.translation && request.translation.length > 500) {
      return { isValid: false, error: "Translation too long (max 500 characters)" };
    }

    if (request.explanation && request.explanation.length > 1000) {
      return { isValid: false, error: "Explanation too long (max 1000 characters)" };
    }

    if (request.definition && request.definition.length > 1000) {
      return { isValid: false, error: "Definition too long (max 1000 characters)" };
    }

    if (request.language && !Object.values(LanguageCode).includes(request.language)) {
      return { isValid: false, error: "Invalid language code" };
    }

    if (request.level && !Object.values(Level).includes(request.level)) {
      return { isValid: false, error: "Invalid level" };
    }

    // Validate examples
    if (request.examples) {
      for (const example of request.examples) {
        if (example.sentence && example.sentence.length > 500) {
          return { isValid: false, error: "Example sentence too long (max 500 characters)" };
        }
        if (example.translation && example.translation.length > 500) {
          return { isValid: false, error: "Example translation too long (max 500 characters)" };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateWordRequest): ValidationResult {
    if (request.word !== undefined) {
      if (typeof request.word !== 'string') {
        return { isValid: false, error: "Word must be a string" };
      }

      if (request.word.trim().length === 0) {
        return { isValid: false, error: "Word cannot be empty" };
      }

      if (request.word.trim().length > 100) {
        return { isValid: false, error: "Word too long (max 100 characters)" };
      }
    }

    if (request.partOfSpeech && !Object.values(PartOfSpeech).includes(request.partOfSpeech)) {
      return { isValid: false, error: "Invalid part of speech" };
    }

    if (request.dictionaryId !== undefined && (typeof request.dictionaryId !== 'number' || request.dictionaryId <= 0)) {
      return { isValid: false, error: "Invalid dictionary ID" };
    }

    if (request.transcription !== undefined && request.transcription && request.transcription.length > 200) {
      return { isValid: false, error: "Transcription too long (max 200 characters)" };
    }

    if (request.translation !== undefined && request.translation && request.translation.length > 500) {
      return { isValid: false, error: "Translation too long (max 500 characters)" };
    }

    if (request.explanation !== undefined && request.explanation && request.explanation.length > 1000) {
      return { isValid: false, error: "Explanation too long (max 1000 characters)" };
    }

    if (request.definition !== undefined && request.definition && request.definition.length > 1000) {
      return { isValid: false, error: "Definition too long (max 1000 characters)" };
    }

    if (request.language && !Object.values(LanguageCode).includes(request.language)) {
      return { isValid: false, error: "Invalid language code" };
    }

    if (request.level && !Object.values(Level).includes(request.level)) {
      return { isValid: false, error: "Invalid level" };
    }

    // Validate examples
    if (request.examples) {
      for (const example of request.examples) {
        if (example.sentence && example.sentence.length > 500) {
          return { isValid: false, error: "Example sentence too long (max 500 characters)" };
        }
        if (example.translation && example.translation.length > 500) {
          return { isValid: false, error: "Example translation too long (max 500 characters)" };
        }
      }
    }

    return { isValid: true };
  }
}// services/WordService.ts
import { 
  Word, 
  WordWithExamples, 
  Example, 
  PartOfSpeech, 
  LanguageCode, 
  Level 
} from "../data/DataModels";
import { DatabaseService } from "./DatabaseService";
import { MockDataService } from "./MockDataService";

// Request interfaces
export interface CreateWordRequest {
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  dictionaryId: number;
  examples?: Array<{
    sentence: string;
    translation?: string;
  }>;
}

export interface UpdateWordRequest {
  word?: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech?: PartOfSpeech;
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  dictionaryId?: number;
  examples?: Array<{
    sentence: string;
    translation?: string;
  }>;
}

export interface WordFilters {
  dictionaryId?: number;
  search?: string;
  partOfSpeech?: PartOfSpeech[];
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'word' | 'createdAt' | 'reviewCount' | 'rate';
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces
export interface WordResponse {
  success: boolean;
  data?: WordWithExamples;
  error?: string;
}

export interface WordsListResponse {
  success: boolean;
  data?: WordWithExamples[];
  error?: string;
  total?: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Word Service with platform-aware data management
 * Single Responsibility: Handle all word CRUD operations with examples
 * Open/Closed: Can be extended with additional word operations
 * Dependency Inversion: Abstracts database operations
 */
export class WordService {
  /**
   * Get all words with filtering and pagination
   */
  static async getAll(filters?: WordFilters): Promise<WordsListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        let filteredWords = [...MockDataService.mockWords];

        // Apply filters
        if (filters?.dictionaryId) {
          filteredWords = filteredWords.filter(w => w.dictionaryId === filters.dictionaryId);
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredWords = filteredWords.filter(w => 
            w.word.toLowerCase().includes(searchLower) ||
            w.translation?.toLowerCase().includes(searchLower) ||
            w.explanation?.toLowerCase().includes(searchLower)
          );
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          filteredWords = filteredWords.filter(w => 
            filters.partOfSpeech!.includes(w.partOfSpeech)
          );
        }

        if (filters?.level) {
          filteredWords = filteredWords.filter(w => w.level === filters.level);
        }

        if (filters?.isIrregular !== undefined) {
          filteredWords = filteredWords.filter(w => w.isIrregular === filters.isIrregular);
        }

        // Sort
        filteredWords.sort((a, b) => {
          switch (filters?.sortBy) {
            case 'word':
              return filters.sortOrder === 'desc' 
                ? b.word.localeCompare(a.word)
                : a.word.localeCompare(b.word);
            case 'reviewCount':
              return filters.sortOrder === 'desc'
                ? b.reviewCount - a.reviewCount
                : a.reviewCount - b.reviewCount;
            case 'rate':
              return filters.sortOrder === 'desc'
                ? b.rate - a.rate
                : a.rate - b.rate;
            default: // createdAt
              return filters?.sortOrder === 'desc'
                ? new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                : new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          }
        });

        // Apply pagination
        const offset = filters?.offset || 0;
        const limit = filters?.limit || 50;
        const paginatedWords = filteredWords.slice(offset, offset + limit);

        // Add examples and dictionary info
        const wordsWithExamples: WordWithExamples[] = paginatedWords.map(word => ({
          ...word,
          examples: MockDataService.mockExamples.filter(e => e.wordId === word.id),
          tags: [], // TODO: Implement tags
          dictionary: MockDataService.mockDictionaries.find(d => d.id === word.dictionaryId)!,
          nextReviewDate: null,
        }));

        return {
          success: true,
          data: wordsWithExamples,
          total: filteredWords.length,
        };
      } else {
        // Native SQLite implementation
        const db = await DatabaseService.getDatabase();
        
        let whereClause = '';
        let orderClause = '';
        let limitClause = '';
        const params: any[] = [];

        // Build WHERE clause
        const conditions: string[] = [];
        
        if (filters?.dictionaryId) {
          conditions.push('w.dictionaryId = ?');
          params.push(filters.dictionaryId);
        }

        if (filters?.search) {
          conditions.push('(w.word LIKE ? OR w.translation LIKE ? OR w.explanation LIKE ?)');
          const searchPattern = `%${filters.search}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          const placeholders = filters.partOfSpeech.map(() => '?').join(',');
          conditions.push(`w.partOfSpeech IN (${placeholders})`);
          params.push(...filters.partOfSpeech);
        }

        if (filters?.level) {
          conditions.push('w.level = ?');
          params.push(filters.level);
        }

        if (filters?.isIrregular !== undefined) {
          conditions.push('w.isIrregular = ?');
          params.push(filters.isIrregular ? 1 : 0);
        }

        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        // Build ORDER clause
        switch (filters?.sortBy) {
          case 'word':
            orderClause = `ORDER BY w.word ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
            break;
          case 'reviewCount':
            orderClause = `ORDER BY w.reviewCount ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
            break;
          case 'rate':
            orderClause = `ORDER BY w.rate ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
            break;
          default:
            orderClause = `ORDER BY w.createdAt ${filters?.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }

        // Build LIMIT clause
        if (filters?.limit) {
          limitClause = `LIMIT ${filters.limit}`;
          if (filters.offset) {
            limitClause += ` OFFSET ${filters.offset}`;
          }
        }

        const query = `
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          ${whereClause} 
          ${orderClause} 
          ${limitClause}
        `;

        const words = await db.getAllAsync(query, params);

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          ${whereClause}
        `;
        const countResult = await db.getFirstAsync(countQuery, params);

        // Get examples for each word
        const wordsWithExamples: WordWithExamples[] = [];
        for (const word of words) {
          const examples = await db.getAllAsync(
            'SELECT * FROM examples WHERE wordId = ?',
            [word.id]
          );
          
          wordsWithExamples.push({
            ...word,
            examples,
            tags: [], // TODO: Implement tags
            dictionary: { id: word.dictionaryId, title: word.dictionaryTitle },
            nextReviewDate: null,
          });
        }

        return {
          success: true,
          data: wordsWithExamples,
          total: countResult.total,
        };
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      return {
        success: false,
        error: "Failed to fetch words",
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Get word by ID with examples
   */
  static async getById(id: number): Promise<WordResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const word = MockDataService.mockWords.find(w => w.id === id);
        
        if (!word) {
          return {
            success: false,
            error: "Word not found",
          };
        }

        const wordWithExamples: WordWithExamples = {
          ...word,
          examples: MockDataService.mockExamples.filter(e => e.wordId === id),
          tags: [], // TODO: Implement tags
          dictionary: MockDataService.mockDictionaries.find(d => d.id === word.dictionaryId)!,
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const word = await db.getFirstAsync(`
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          WHERE w.id = ?
        `, [id]);

        if (!word) {
          return {
            success: false,
            error: "Word not found",
          };
        }

        const examples = await db.getAllAsync(
          'SELECT * FROM examples WHERE wordId = ?',
          [id]
        );

        const wordWithExamples: WordWithExamples = {
          ...word,
          examples,
          tags: [], // TODO: Implement tags
          dictionary: { id: word.dictionaryId, title: word.dictionaryTitle },
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      }
    } catch (error) {
      console.error('Error fetching word:', error);
      return {
        success: false,
        error: "Failed to fetch word",
      };
    }
  }

  /**
   * Create new word with examples
   */
  static async create(request: CreateWordRequest): Promise<WordResponse> {
    try {
      const validation = this.validateCreateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || "Invalid data",
        };
      }

      await MockDataService.delay();

      const now = new Date().toISOString();
      
      if (DatabaseService.isWeb()) {
        const newWord: Word = {
          id: MockDataService.getNextId('word'),
          guid: MockDataService.generateGuid(),
          word: request.word.trim(),
          transcription: request.transcription?.trim(),
          translation: request.translation?.trim(),
          explanation: request.explanation?.trim(),
          definition: request.definition?.trim(),
          partOfSpeech: request.partOfSpeech,
          language: request.language || LanguageCode.EN_GB,
          level: request.level || Level.A1,
          isIrregular: request.isIrregular || false,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
          dictionaryId: request.dictionaryId!,
        };

        MockDataService.mockWords.push(newWord);

        // Add examples
        const examples: Example[] = [];
        if (request.examples && request.examples.length > 0) {
          for (const exampleData of request.examples) {
            if (exampleData.sentence.trim()) {
              const example: Example = {
                id: MockDataService.getNextId('example'),
                guid: MockDataService.generateGuid(),
                sentence: exampleData.sentence.trim(),
                translation: exampleData.translation?.trim(),
                wordId: newWord.id,
                createdAt: now,
                updatedAt: null,
              };
              
              MockDataService.mockExamples.push(example);
              examples.push(example);
            }
          }
        }

        const wordWithExamples: WordWithExamples = {
          ...newWord,
          examples,
          tags: [],
          dictionary: MockDataService.mockDictionaries.find(d => d.id === newWord.dictionaryId)!,
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const guid = MockDataService.generateGuid();
        
        // Insert word
        const wordResult = await db.runAsync(`
          INSERT INTO words (
            guid, word, transcription, translation, explanation, definition,
            partOfSpeech, language, level, isIrregular, dictionaryId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          guid, request.word.trim(), request.transcription?.trim() || null,
          request.translation?.trim() || null, request.explanation?.trim() || null,
          request.definition?.trim() || null, request.partOfSpeech,
          request.language || LanguageCode.EN_GB, request.level || Level.A1,
          request.isIrregular ? 1 : 0, request.dictionaryId, now, now
        ]);

        const wordId = wordResult.lastInsertRowId;

        // Insert examples
        const examples: Example[] = [];
        if (request.examples && request.examples.length > 0) {
          for (const exampleData of request.examples) {
            if (exampleData.sentence.trim()) {
              const exampleGuid = MockDataService.generateGuid();
              const exampleResult = await db.runAsync(
                'INSERT INTO examples (guid, sentence, translation, wordId, createdAt) VALUES (?, ?, ?, ?, ?)',
                [exampleGuid, exampleData.sentence.trim(), exampleData.translation?.trim() || null, wordId, now]
              );

              examples.push({
                id: exampleResult.lastInsertRowId,
                guid: exampleGuid,
                sentence: exampleData.sentence.trim(),
                translation: exampleData.translation?.trim(),
                wordId,
                createdAt: now,
                updatedAt: null,
              });
            }
          }
        }

        // Get dictionary info
        const dictionary = await db.getFirstAsync(
          'SELECT * FROM dictionaries WHERE id = ?',
          [request.dictionaryId]
        );

        const newWord: Word = {
          id: wordId,
          guid,
          word: request.word.trim(),
          transcription: request.transcription?.trim(),
          translation: request.translation?.trim(),
          explanation: request.explanation?.trim(),
          definition: request.definition?.trim(),
          partOfSpeech: request.partOfSpeech,
          language: request.language || LanguageCode.EN_GB,
          level: request.level || Level.A1,
          isIrregular: request.isIrregular || false,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
          dictionaryId: request.dictionaryId!,
        };

        const wordWithExamples: WordWithExamples = {
          ...newWord,
          examples,
          tags: [],
          dictionary,
          nextReviewDate: null,
        };

        return {
          success: true,
          data: wordWithExamples,
        };
      }
    } catch (error) {
      console.error('Error creating word:', error);
      return {
        success: false,
        error: "Failed to create word",
      };
    }
  }