// services/SetService.ts
import { Set, SetWithWords, SetWord, WordWithExamples } from "../data/DataModels";
import { DatabaseService } from "./DatabaseService";
import { MockDataService } from "./MockDataService";

// Request interfaces
export interface CreateSetRequest {
  title: string;
  description?: string;
}

export interface UpdateSetRequest {
  title?: string;
  description?: string;
}

export interface AddWordToSetRequest {
  setId: number;
  wordId: number;
}

export interface RemoveWordFromSetRequest {
  setId: number;
  wordId: number;
}

// Response interfaces
export interface SetResponse {
  success: boolean;
  data?: Set;
  error?: string;
}

export interface SetsListResponse {
  success: boolean;
  data?: Set[];
  error?: string;
}

export interface SetWithWordsResponse {
  success: boolean;
  data?: SetWithWords;
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Set Service with platform-aware data management  
 * Single Responsibility: Handle all word set CRUD operations
 * Open/Closed: Can be extended with additional set operations
 * Dependency Inversion: Abstracts database operations
 */
export class SetService {
  /**
   * Get all sets
   */
  static async getAll(): Promise<SetsListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        // Web platform - use mock data
        return {
          success: true,
          data: [...MockDataService.mockSets].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          ),
        };
      } else {
        // Native platform - use SQLite
        const db = await DatabaseService.getDatabase();
        const rows = await db.getAllAsync(
          'SELECT * FROM sets ORDER BY createdAt DESC'
        );
        
        return {
          success: true,
          data: rows,
        };
      }
    } catch (error) {
      console.error('Error fetching sets:', error);
      return {
        success: false,
        error: "Failed to fetch sets",
      };
    }
  }

  /**
   * Get set by ID
   */
  static async getById(id: number): Promise<SetResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const set = MockDataService.mockSets.find(s => s.id === id);
        
        if (!set) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        return {
          success: true,
          data: set,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const set = await db.getFirstAsync(
          'SELECT * FROM sets WHERE id = ?',
          [id]
        );

        if (!set) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        return {
          success: true,
          data: set,
        };
      }
    } catch (error) {
      console.error('Error fetching set:', error);
      return {
        success: false,
        error: "Failed to fetch set",
      };
    }
  }

  /**
   * Get set with words by ID
   */
  static async getSetWithWords(id: number): Promise<SetWithWordsResponse> {
    try {
      await MockDataService.delay(150);

      if (DatabaseService.isWeb()) {
        const set = MockDataService.mockSets.find(s => s.id === id);
        
        if (!set) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        // Get word IDs for this set
        const setWordIds = MockDataService.mockSetWords
          .filter(sw => sw.setId === id)
          .map(sw => sw.wordId);

        // Get words with examples
        const words: WordWithExamples[] = MockDataService.mockWords
          .filter(w => setWordIds.includes(w.id))
          .map(word => ({
            ...word,
            examples: MockDataService.mockExamples.filter(e => e.wordId === word.id),
            tags: [], // TODO: Implement tags if needed
            dictionary: MockDataService.mockDictionaries.find(d => d.id === word.dictionaryId)!,
            nextReviewDate: null,
          }));

        const setWithWords: SetWithWords = {
          ...set,
          words,
          wordCount: words.length,
        };

        return {
          success: true,
          data: setWithWords,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Get set
        const set = await db.getFirstAsync('SELECT * FROM sets WHERE id = ?', [id]);
        if (!set) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        // Get words in set with examples
        const words = await db.getAllAsync(`
          SELECT w.*, d.title as dictionaryTitle
          FROM words w
          JOIN set_words sw ON w.id = sw.wordId  
          JOIN dictionaries d ON w.dictionaryId = d.id
          WHERE sw.setId = ?
          ORDER BY w.word ASC
        `, [id]);

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

        const setWithWords: SetWithWords = {
          ...set,
          words: wordsWithExamples,
          wordCount: wordsWithExamples.length,
        };

        return {
          success: true,
          data: setWithWords,
        };
      }
    } catch (error) {
      console.error('Error fetching set with words:', error);
      return {
        success: false,
        error: "Failed to fetch set with words",
      };
    }
  }

  /**
   * Create new set
   */
  static async create(request: CreateSetRequest): Promise<SetResponse> {
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
        const newSet: Set = {
          id: MockDataService.getNextId('set'),
          guid: MockDataService.generateGuid(),
          title: request.title.trim(),
          description: request.description?.trim() || undefined,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
        };

        MockDataService.mockSets.push(newSet);

        return {
          success: true,
          data: newSet,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const guid = MockDataService.generateGuid();
        
        const result = await db.runAsync(
          'INSERT INTO sets (guid, title, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
          [guid, request.title.trim(), request.description?.trim() || null, now, now]
        );

        const newSet: Set = {
          id: result.lastInsertRowId,
          guid,
          title: request.title.trim(),
          description: request.description?.trim() || undefined,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
        };

        return {
          success: true,
          data: newSet,
        };
      }
    } catch (error) {
      console.error('Error creating set:', error);
      return {
        success: false,
        error: "Failed to create set",
      };
    }
  }

  /**
   * Update set
   */
  static async update(id: number, request: UpdateSetRequest): Promise<SetResponse> {
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
        const setIndex = MockDataService.mockSets.findIndex(s => s.id === id);
        
        if (setIndex === -1) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        const updatedSet = {
          ...MockDataService.mockSets[setIndex],
          ...(request.title && { title: request.title.trim() }),
          ...(request.description !== undefined && { description: request.description?.trim() || undefined }),
          updatedAt: now,
        };

        MockDataService.mockSets[setIndex] = updatedSet as Set;

        return {
          success: true,
          data: updatedSet as Set,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const updateFields: string[] = [];
        const values: any[] = [];

        if (request.title) {
          updateFields.push('title = ?');
          values.push(request.title.trim());
        }

        if (request.description !== undefined) {
          updateFields.push('description = ?');
          values.push(request.description?.trim() || null);
        }

        updateFields.push('updatedAt = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
          `UPDATE sets SET ${updateFields.join(', ')} WHERE id = ?`,
          values
        );

        const updated = await db.getFirstAsync(
          'SELECT * FROM sets WHERE id = ?',
          [id]
        );

        return {
          success: true,
          data: updated,
        };
      }
    } catch (error) {
      console.error('Error updating set:', error);
      return {
        success: false,
        error: "Failed to update set",
      };
    }
  }

  /**
   * Delete set
   */
  static async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const setIndex = MockDataService.mockSets.findIndex(s => s.id === id);
        
        if (setIndex === -1) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        // Remove set and its word relationships
        MockDataService.mockSets.splice(setIndex, 1);
        MockDataService.mockSetWords = MockDataService.mockSetWords.filter(sw => sw.setId !== id);

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Delete set words relationships first
        await db.runAsync('DELETE FROM set_words WHERE setId = ?', [id]);
        
        // Delete set
        await db.runAsync('DELETE FROM sets WHERE id = ?', [id]);

        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting set:', error);
      return {
        success: false,
        error: "Failed to delete set",
      };
    }
  }

  /**
   * Add word to set
   */
  static async addWordToSet(request: AddWordToSetRequest): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        // Check if relationship already exists
        const exists = MockDataService.mockSetWords.some(
          sw => sw.setId === request.setId && sw.wordId === request.wordId
        );

        if (exists) {
          return {
            success: false,
            error: "Word already in set",
          };
        }

        // Check if set and word exist
        const setExists = MockDataService.mockSets.some(s => s.id === request.setId);
        const wordExists = MockDataService.mockWords.some(w => w.id === request.wordId);

        if (!setExists || !wordExists) {
          return {
            success: false,
            error: "Set or word not found",
          };
        }

        MockDataService.mockSetWords.push({
          setId: request.setId,
          wordId: request.wordId,
        });

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Check if relationship already exists
        const exists = await db.getFirstAsync(
          'SELECT 1 FROM set_words WHERE setId = ? AND wordId = ?',
          [request.setId, request.wordId]
        );

        if (exists) {
          return {
            success: false,
            error: "Word already in set",
          };
        }

        await db.runAsync(
          'INSERT INTO set_words (setId, wordId) VALUES (?, ?)',
          [request.setId, request.wordId]
        );

        return { success: true };
      }
    } catch (error) {
      console.error('Error adding word to set:', error);
      return {
        success: false,
        error: "Failed to add word to set",
      };
    }
  }

  /**
   * Remove word from set
   */
  static async removeWordFromSet(request: RemoveWordFromSetRequest): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const index = MockDataService.mockSetWords.findIndex(
          sw => sw.setId === request.setId && sw.wordId === request.wordId
        );

        if (index === -1) {
          return {
            success: false,
            error: "Word not found in set",
          };
        }

        MockDataService.mockSetWords.splice(index, 1);

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const result = await db.runAsync(
          'DELETE FROM set_words WHERE setId = ? AND wordId = ?',
          [request.setId, request.wordId]
        );

        if (result.changes === 0) {
          return {
            success: false,
            error: "Word not found in set",
          };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error removing word from set:', error);
      return {
        success: false,
        error: "Failed to remove word from set",
      };
    }
  }

  /**
   * Get sets that contain a specific word
   */
  static async getSetsContainingWord(wordId: number): Promise<SetsListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const setIds = MockDataService.mockSetWords
          .filter(sw => sw.wordId === wordId)
          .map(sw => sw.setId);

        const sets = MockDataService.mockSets.filter(s => setIds.includes(s.id));

        return {
          success: true,
          data: sets,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const sets = await db.getAllAsync(`
          SELECT s.* 
          FROM sets s
          JOIN set_words sw ON s.id = sw.setId
          WHERE sw.wordId = ?
          ORDER BY s.title ASC
        `, [wordId]);

        return {
          success: true,
          data: sets,
        };
      }
    } catch (error) {
      console.error('Error getting sets containing word:', error);
      return {
        success: false,
        error: "Failed to get sets containing word",
      };
    }
  }

  /**
   * Get set statistics
   */
  static async getStatistics(id: number): Promise<{ success: boolean; data?: { wordCount: number; reviewCount: number }; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const set = MockDataService.mockSets.find(s => s.id === id);
        if (!set) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        const wordIds = MockDataService.mockSetWords
          .filter(sw => sw.setId === id)
          .map(sw => sw.wordId);

        const wordCount = wordIds.length;
        const reviewCount = set.reviewCount;

        return {
          success: true,
          data: { wordCount, reviewCount },
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const stats = await db.getFirstAsync(`
          SELECT 
            COUNT(sw.wordId) as wordCount,
            s.reviewCount
          FROM sets s
          LEFT JOIN set_words sw ON s.id = sw.setId
          WHERE s.id = ?
          GROUP BY s.id
        `, [id]);

        if (!stats) {
          return {
            success: false,
            error: "Set not found",
          };
        }

        return {
          success: true,
          data: { wordCount: stats.wordCount || 0, reviewCount: stats.reviewCount || 0 },
        };
      }
    } catch (error) {
      console.error('Error getting set statistics:', error);
      return {
        success: false,
        error: "Failed to get set statistics",
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateSetRequest): ValidationResult {
    if (!request.title || typeof request.title !== 'string') {
      return { isValid: false, error: "Title is required" };
    }

    if (request.title.trim().length === 0) {
      return { isValid: false, error: "Title cannot be empty" };
    }

    if (request.title.trim().length > 100) {
      return { isValid: false, error: "Title too long (max 100 characters)" };
    }

    if (request.description && request.description.length > 500) {
      return { isValid: false, error: "Description too long (max 500 characters)" };
    }

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateSetRequest): ValidationResult {
    if (request.title !== undefined) {
      if (typeof request.title !== 'string') {
        return { isValid: false, error: "Title must be a string" };
      }

      if (request.title.trim().length === 0) {
        return { isValid: false, error: "Title cannot be empty" };
      }

      if (request.title.trim().length > 100) {
        return { isValid: false, error: "Title too long (max 100 characters)" };
      }
    }

    if (request.description !== undefined && request.description && request.description.length > 500) {
      return { isValid: false, error: "Description too long (max 500 characters)" };
    }

    return { isValid: true };
  }
}