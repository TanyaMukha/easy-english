// services/DictionaryService.ts
import { Dictionary } from "../data/DataModels";
import { DatabaseService } from "./DatabaseService";
import { MockDataService } from "./MockDataService";

// Request interfaces
export interface CreateDictionaryRequest {
  title: string;
}

export interface UpdateDictionaryRequest {
  title?: string;
}

// Response interfaces
export interface DictionaryResponse {
  success: boolean;
  data?: Dictionary;
  error?: string;
}

export interface DictionariesListResponse {
  success: boolean;
  data?: Dictionary[];
  error?: string;
}

export interface DictionaryStatsResponse {
  success: boolean;
  data?: {
    wordCount: number;
    reviewCount: number;
    lastStudied?: string;
    averageProgress?: number;
  };
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Dictionary Service with platform-aware data management
 * Single Responsibility: Handle all dictionary CRUD operations
 * Open/Closed: Can be extended with additional dictionary operations
 * Dependency Inversion: Abstracts database operations
 */
export class DictionaryService {
  /**
   * Get all dictionaries
   */
  static async getAll(): Promise<DictionariesListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        // Web platform - use mock data
        return {
          success: true,
          data: [...MockDataService.mockDictionaries].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          ),
        };
      } else {
        // Native platform - use SQLite
        const db = await DatabaseService.getDatabase();
        const rows = await db.getAllAsync(
          'SELECT * FROM dictionaries ORDER BY createdAt DESC'
        );
        
        return {
          success: true,
          data: rows,
        };
      }
    } catch (error) {
      console.error('Error fetching dictionaries:', error);
      return {
        success: false,
        error: "Failed to fetch dictionaries",
      };
    }
  }

  /**
   * Get dictionary by ID
   */
  static async getById(id: number): Promise<DictionaryResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const dictionary = MockDataService.mockDictionaries.find(d => d.id === id);
        
        if (!dictionary) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        return {
          success: true,
          data: dictionary,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const dictionary = await db.getFirstAsync(
          'SELECT * FROM dictionaries WHERE id = ?',
          [id]
        );

        if (!dictionary) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        return {
          success: true,
          data: dictionary,
        };
      }
    } catch (error) {
      console.error('Error fetching dictionary:', error);
      return {
        success: false,
        error: "Failed to fetch dictionary",
      };
    }
  }

  /**
   * Create new dictionary
   */
  static async create(request: CreateDictionaryRequest): Promise<DictionaryResponse> {
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
        // Check for duplicate titles
        const existingDictionary = MockDataService.mockDictionaries.find(
          d => d.title.toLowerCase() === request.title.toLowerCase()
        );

        if (existingDictionary) {
          return {
            success: false,
            error: "A dictionary with this title already exists",
          };
        }

        const newDictionary: Dictionary = {
          id: MockDataService.getNextId('dictionary'),
          guid: MockDataService.generateGuid(),
          title: request.title.trim(),
          createdAt: now,
          updatedAt: now,
        };

        MockDataService.mockDictionaries.push(newDictionary);

        return {
          success: true,
          data: newDictionary,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Check for duplicate titles
        const existing = await db.getFirstAsync(
          'SELECT id FROM dictionaries WHERE LOWER(title) = LOWER(?)',
          [request.title.trim()]
        );

        if (existing) {
          return {
            success: false,
            error: "A dictionary with this title already exists",
          };
        }

        const guid = MockDataService.generateGuid();
        
        const result = await db.runAsync(
          'INSERT INTO dictionaries (guid, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
          [guid, request.title.trim(), now, now]
        );

        const newDictionary: Dictionary = {
          id: result.lastInsertRowId,
          guid,
          title: request.title.trim(),
          createdAt: now,
          updatedAt: now,
        };

        return {
          success: true,
          data: newDictionary,
        };
      }
    } catch (error) {
      console.error('Error creating dictionary:', error);
      return {
        success: false,
        error: "Failed to create dictionary",
      };
    }
  }

  /**
   * Update dictionary
   */
  static async update(id: number, request: UpdateDictionaryRequest): Promise<DictionaryResponse> {
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
        const dictionaryIndex = MockDataService.mockDictionaries.findIndex(d => d.id === id);
        
        if (dictionaryIndex === -1) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        // Check for duplicate titles (excluding current dictionary)
        if (request.title) {
          const existingDictionary = MockDataService.mockDictionaries.find(
            d => d.id !== id && d.title.toLowerCase() === request.title!.toLowerCase()
          );

          if (existingDictionary) {
            return {
              success: false,
              error: "A dictionary with this title already exists",
            };
          }
        }

        const updatedDictionary = {
          ...MockDataService.mockDictionaries[dictionaryIndex],
          ...(request.title && { title: request.title.trim() }),
          updatedAt: now,
        };

        MockDataService.mockDictionaries[dictionaryIndex] = updatedDictionary as Dictionary;

        return {
          success: true,
          data: updatedDictionary as Dictionary,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Check for duplicate titles (excluding current dictionary)
        if (request.title) {
          const existing = await db.getFirstAsync(
            'SELECT id FROM dictionaries WHERE LOWER(title) = LOWER(?) AND id != ?',
            [request.title.trim(), id]
          );

          if (existing) {
            return {
              success: false,
              error: "A dictionary with this title already exists",
            };
          }
        }

        const updateFields: string[] = [];
        const values: any[] = [];

        if (request.title) {
          updateFields.push('title = ?');
          values.push(request.title.trim());
        }

        updateFields.push('updatedAt = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
          `UPDATE dictionaries SET ${updateFields.join(', ')} WHERE id = ?`,
          values
        );

        const updated = await db.getFirstAsync(
          'SELECT * FROM dictionaries WHERE id = ?',
          [id]
        );

        return {
          success: true,
          data: updated,
        };
      }
    } catch (error) {
      console.error('Error updating dictionary:', error);
      return {
        success: false,
        error: "Failed to update dictionary",
      };
    }
  }

  /**
   * Delete dictionary
   */
  static async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const dictionaryIndex = MockDataService.mockDictionaries.findIndex(d => d.id === id);
        
        if (dictionaryIndex === -1) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        // Remove dictionary and associated words
        MockDataService.mockDictionaries.splice(dictionaryIndex, 1);
        MockDataService.mockWords = MockDataService.mockWords.filter(w => w.dictionaryId !== id);
        MockDataService.mockExamples = MockDataService.mockExamples.filter(e => 
          !MockDataService.mockWords.some(w => w.id === e.wordId && w.dictionaryId === id)
        );

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Delete examples first (foreign key constraint)
        await db.runAsync(
          'DELETE FROM examples WHERE wordId IN (SELECT id FROM words WHERE dictionaryId = ?)',
          [id]
        );
        
        // Delete words
        await db.runAsync('DELETE FROM words WHERE dictionaryId = ?', [id]);
        
        // Delete dictionary
        await db.runAsync('DELETE FROM dictionaries WHERE id = ?', [id]);

        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting dictionary:', error);
      return {
        success: false,
        error: "Failed to delete dictionary",
      };
    }
  }

  /**
   * Get dictionary statistics
   */
  static async getStatistics(id: number): Promise<DictionaryStatsResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const dictionary = MockDataService.mockDictionaries.find(d => d.id === id);
        if (!dictionary) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        const wordCount = MockDataService.mockWords.filter(w => w.dictionaryId === id).length;
        const reviewCount = MockDataService.mockWords
          .filter(w => w.dictionaryId === id)
          .reduce((sum, w) => sum + w.reviewCount, 0);

        const lastStudied = MockDataService.mockWords
          .filter(w => w.dictionaryId === id && w.lastReviewDate)
          .sort((a, b) => new Date(b.lastReviewDate!).getTime() - new Date(a.lastReviewDate!).getTime())[0]?.lastReviewDate;

        const averageProgress = wordCount > 0 
          ? Math.round(MockDataService.mockWords
              .filter(w => w.dictionaryId === id)
              .reduce((sum, w) => sum + (w.rate * 20), 0) / wordCount) // Convert 0-5 rating to 0-100%
          : 0;

        return {
          success: true,
          data: { 
            wordCount, 
            reviewCount,
            lastStudied,
            averageProgress
          } as DictionaryStatsResponse['data'],
        } as DictionaryStatsResponse;
      } else {
        const db = await DatabaseService.getDatabase();
        
        const stats = await db.getFirstAsync(`
          SELECT 
            COUNT(*) as wordCount,
            COALESCE(SUM(reviewCount), 0) as reviewCount,
            MAX(lastReviewDate) as lastStudied,
            CASE 
              WHEN COUNT(*) > 0 THEN ROUND(AVG(rate) * 20)
              ELSE 0 
            END as averageProgress
          FROM words 
          WHERE dictionaryId = ?
        `, [id]);

        if (!stats) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        return {
          success: true,
          data: stats,
        };
      }
    } catch (error) {
      console.error('Error getting dictionary statistics:', error);
      return {
        success: false,
        error: "Failed to get dictionary statistics",
      };
    }
  }

  /**
   * Search dictionaries by title
   */
  static async search(query: string): Promise<DictionariesListResponse> {
    try {
      await MockDataService.delay(150);

      if (DatabaseService.isWeb()) {
        const searchQuery = query.toLowerCase().trim();
        const filteredDictionaries = MockDataService.mockDictionaries.filter(dictionary =>
          dictionary.title.toLowerCase().includes(searchQuery)
        );

        return {
          success: true,
          data: filteredDictionaries.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          ),
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const searchPattern = `%${query}%`;
        
        const dictionaries = await db.getAllAsync(
          'SELECT * FROM dictionaries WHERE title LIKE ? ORDER BY createdAt DESC',
          [searchPattern]
        );

        return {
          success: true,
          data: dictionaries,
        };
      }
    } catch (error) {
      console.error('Error searching dictionaries:', error);
      return {
        success: false,
        error: "Failed to search dictionaries",
      };
    }
  }

  /**
   * Get word count for dictionary (helper method for components)
   */
  static getWordCount(dictionaryId: number): number {
    if (DatabaseService.isWeb()) {
      return MockDataService.mockWords.filter(w => w.dictionaryId === dictionaryId).length;
    }
    // For native, this would require async call - use statistics method instead
    return 0;
  }

  /**
   * Duplicate dictionary
   */
  static async duplicate(id: number, newTitle?: string): Promise<DictionaryResponse> {
    try {
      // Get original dictionary
      const originalResult = await this.getById(id);
      if (!originalResult.success || !originalResult.data) {
        return {
          success: false,
          error: "Dictionary not found",
        };
      }

      const original = originalResult.data;
      const title = newTitle || `${original.title} (Copy)`;

      // Create new dictionary
      const newDictResult = await this.create({ title });
      if (!newDictResult.success || !newDictResult.data) {
        return newDictResult;
      }

      // TODO: Copy words when WordService integration is completed
      console.log(`Dictionary "${original.title}" duplicated as "${title}"`);

      return newDictResult;
    } catch (error) {
      console.error('Error duplicating dictionary:', error);
      return {
        success: false,
        error: "Failed to duplicate dictionary",
      };
    }
  }

  /**
   * Export dictionary data
   */
  static async export(id: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const dictResult = await this.getById(id);
      if (!dictResult.success || !dictResult.data) {
        return {
          success: false,
          error: "Dictionary not found",
        };
      }

      // TODO: Include words and examples when WordService is integrated
      const exportData = {
        dictionary: dictResult.data,
        words: [], // Will be populated when WordService is available
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      console.error('Error exporting dictionary:', error);
      return {
        success: false,
        error: "Failed to export dictionary",
      };
    }
  }

  /**
   * Import dictionary data
   */
  static async import(importData: any): Promise<DictionaryResponse> {
    try {
      if (!importData || !importData.dictionary) {
        return {
          success: false,
          error: "Invalid import data",
        };
      }

      await MockDataService.delay(500); // Longer delay for import

      // Create dictionary from import data
      const createResult = await this.create({
        title: `${importData.dictionary.title} (Imported)`,
      });

      if (!createResult.success) {
        return createResult;
      }

      // TODO: Import words and examples when WordService is available
      console.log('Dictionary imported successfully:', createResult.data);

      return createResult;
    } catch (error) {
      console.error('Error importing dictionary:', error);
      return {
        success: false,
        error: "Failed to import dictionary",
      };
    }
  }

  /**
   * Get recent dictionaries (most recently updated)
   */
  static async getRecent(limit: number = 5): Promise<DictionariesListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const recentDictionaries = [...MockDataService.mockDictionaries]
          .filter(d => d.updatedAt) // Only dictionaries that have been updated
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
          .slice(0, limit);

        return {
          success: true,
          data: recentDictionaries,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const dictionaries = await db.getAllAsync(
          'SELECT * FROM dictionaries WHERE updatedAt IS NOT NULL ORDER BY updatedAt DESC LIMIT ?',
          [limit]
        );

        return {
          success: true,
          data: dictionaries,
        };
      }
    } catch (error) {
      console.error('Error getting recent dictionaries:', error);
      return {
        success: false,
        error: "Failed to get recent dictionaries",
      };
    }
  }

  /**
   * Get popular dictionaries (by word count or usage)
   */
  static async getPopular(limit: number = 5): Promise<DictionariesListResponse> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        // Sort by word count for mock data
        const dictionaries = [...MockDataService.mockDictionaries]
          .map(dict => ({
            ...dict,
            wordCount: MockDataService.mockWords.filter(w => w.dictionaryId === dict.id).length
          }))
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, limit);

        return {
          success: true,
          data: dictionaries,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const dictionaries = await db.getAllAsync(`
          SELECT d.*, COUNT(w.id) as wordCount 
          FROM dictionaries d 
          LEFT JOIN words w ON d.id = w.dictionaryId 
          GROUP BY d.id 
          ORDER BY wordCount DESC, d.createdAt DESC 
          LIMIT ?
        `, [limit]);

        return {
          success: true,
          data: dictionaries,
        };
      }
    } catch (error) {
      console.error('Error getting popular dictionaries:', error);
      return {
        success: false,
        error: "Failed to get popular dictionaries",
      };
    }
  }

  /**
   * Check if dictionary title exists
   */
  static async titleExists(title: string, excludeId?: number): Promise<{ success: boolean; exists: boolean; error?: string }> {
    try {
      await MockDataService.delay(50);

      if (DatabaseService.isWeb()) {
        const exists = MockDataService.mockDictionaries.some(d => 
          d.title.toLowerCase() === title.toLowerCase() && d.id !== excludeId
        );

        return {
          success: true,
          exists,
        };
      } else {
        const db = await DatabaseService.getDatabase();
        const query = excludeId 
          ? 'SELECT 1 FROM dictionaries WHERE LOWER(title) = LOWER(?) AND id != ? LIMIT 1'
          : 'SELECT 1 FROM dictionaries WHERE LOWER(title) = LOWER(?) LIMIT 1';
        
        const params = excludeId ? [title.toLowerCase(), excludeId] : [title.toLowerCase()];
        const result = await db.getFirstAsync(query, params);

        return {
          success: true,
          exists: !!result,
        };
      }
    } catch (error) {
      console.error('Error checking title existence:', error);
      return {
        success: false,
        exists: false,
        error: "Failed to check title existence",
      };
    }
  }

  /**
   * Bulk delete dictionaries
   */
  static async bulkDelete(ids: number[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      if (ids.length === 0) {
        return {
          success: true,
          deletedCount: 0,
        };
      }

      await MockDataService.delay(200);

      let deletedCount = 0;

      if (DatabaseService.isWeb()) {
        for (const id of ids) {
          const result = await this.delete(id);
          if (result.success) {
            deletedCount++;
          }
        }
      } else {
        const db = await DatabaseService.getDatabase();
        const placeholders = ids.map(() => '?').join(',');
        
        // Delete examples
        await db.runAsync(
          `DELETE FROM examples WHERE wordId IN (SELECT id FROM words WHERE dictionaryId IN (${placeholders}))`,
          ids
        );
        
        // Delete words
        await db.runAsync(`DELETE FROM words WHERE dictionaryId IN (${placeholders})`, ids);
        
        // Delete dictionaries
        const result = await db.runAsync(`DELETE FROM dictionaries WHERE id IN (${placeholders})`, ids);
        deletedCount = result.changes || 0;
      }

      return {
        success: true,
        deletedCount,
      };
    } catch (error) {
      console.error('Error bulk deleting dictionaries:', error);
      return {
        success: false,
        deletedCount: 0,
        error: "Failed to delete dictionaries",
      };
    }
  }

  /**
   * Update dictionary last accessed time
   */
  static async updateLastAccessed(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();

      if (DatabaseService.isWeb()) {
        const dictionaryIndex = MockDataService.mockDictionaries.findIndex(d => d.id === id);
        
        if (dictionaryIndex === -1) {
          return {
            success: false,
            error: "Dictionary not found",
          };
        }

        MockDataService.mockDictionaries[dictionaryIndex] = {
          ...MockDataService.mockDictionaries[dictionaryIndex],
          updatedAt: now,
        } as Dictionary;

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        await db.runAsync(
          'UPDATE dictionaries SET updatedAt = ? WHERE id = ?',
          [now, id]
        );

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating last accessed:', error);
      return {
        success: false,
        error: "Failed to update last accessed time",
      };
    }
  }

  /**
   * Get dictionary learning progress overview
   */
  static async getLearningProgress(id: number): Promise<{
    success: boolean;
    data?: {
      totalWords: number;
      learnedWords: number;
      reviewingWords: number;
      newWords: number;
      averageRating: number;
      streakDays: number;
      lastStudyDate?: string;
    };
    error?: string;
  }> {
    try {
      await MockDataService.delay();

      if (DatabaseService.isWeb()) {
        const words = MockDataService.mockWords.filter(w => w.dictionaryId === id);
        
        const totalWords = words.length;
        const learnedWords = words.filter(w => w.reviewCount >= 5 && w.rate >= 4).length;
        const reviewingWords = words.filter(w => w.reviewCount > 0 && w.reviewCount < 5).length;
        const newWords = words.filter(w => w.reviewCount === 0).length;
        
        const averageRating = totalWords > 0 
          ? words.reduce((sum, w) => sum + w.rate, 0) / totalWords 
          : 0;

        const lastStudyDate = words
          .filter(w => w.lastReviewDate)
          .sort((a, b) => new Date(b.lastReviewDate!).getTime() - new Date(a.lastReviewDate!).getTime())[0]?.lastReviewDate;

        return {
          success: true,
          data: {
            totalWords,
            learnedWords,
            reviewingWords,
            newWords,
            averageRating: Math.round(averageRating * 100) / 100,
            streakDays: Math.floor(Math.random() * 30), // Mock streak
            ...(lastStudyDate ? { lastStudyDate } : {}),
          },
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const stats = await db.getFirstAsync(`
          SELECT 
            COUNT(*) as totalWords,
            COUNT(CASE WHEN reviewCount >= 5 AND rate >= 4 THEN 1 END) as learnedWords,
            COUNT(CASE WHEN reviewCount > 0 AND reviewCount < 5 THEN 1 END) as reviewingWords,
            COUNT(CASE WHEN reviewCount = 0 THEN 1 END) as newWords,
            AVG(CASE WHEN rate > 0 THEN rate ELSE NULL END) as averageRating,
            MAX(lastReviewDate) as lastStudyDate
          FROM words 
          WHERE dictionaryId = ?
        `, [id]);

        return {
          success: true,
          data: {
            ...stats,
            averageRating: Math.round((stats.averageRating || 0) * 100) / 100,
            streakDays: 0, // Would need more complex calculation
          },
        };
      }
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return {
        success: false,
        error: "Failed to get learning progress",
      };
    }
  }

  /**
   * Reset dictionary progress (clear all word progress)
   */
  static async resetProgress(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(300);

      if (DatabaseService.isWeb()) {
        MockDataService.mockWords
          .filter(w => w.dictionaryId === id)
          .forEach(word => {
            word.reviewCount = 0;
            word.rate = 0;
            word.lastReviewDate = null;
            word.updatedAt = new Date().toISOString();
          });

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        const now = new Date().toISOString();
        
        await db.runAsync(`
          UPDATE words 
          SET reviewCount = 0, rate = 0, lastReviewDate = NULL, updatedAt = ?
          WHERE dictionaryId = ?
        `, [now, id]);

        return { success: true };
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      return {
        success: false,
        error: "Failed to reset progress",
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateDictionaryRequest): ValidationResult {
    if (!request.title || typeof request.title !== 'string') {
      return { isValid: false, error: "Title is required" };
    }

    if (request.title.trim().length === 0) {
      return { isValid: false, error: "Title cannot be empty" };
    }

    if (request.title.trim().length > 100) {
      return { isValid: false, error: "Title too long (max 100 characters)" };
    }

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateDictionaryRequest): ValidationResult {
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

    return { isValid: true };
  }
}