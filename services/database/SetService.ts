// services/database/SetService.ts
/**
 * Set Service - Manages word set CRUD operations
 * 
 * This service handles all set-related database operations including:
 * - Basic CRUD operations for sets
 * - Managing set-word relationships
 * - Set statistics and progress tracking
 * - Set search and filtering
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only handles set-related database operations
 * - Open/Closed: Can be extended with new set features without modification
 * - Interface Segregation: Provides specific methods for set operations
 * - Dependency Inversion: Depends on SQLiteUniversal abstraction
 */

import { SQLiteUniversal, DatabaseResult } from './SQLiteUniversalService';
import type { WordWithExamples } from './WordService';

export interface Set {
  id?: number | undefined;
  guid: string;
  title: string;
  description?: string | undefined;
  lastReviewDate?: string | undefined;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SetWithWords extends Set {
  words: WordWithExamples[];
  wordCount: number;
}

export interface SetCreateRequest {
  guid: string;
  title: string;
  description?: string;
}

export interface SetUpdateRequest {
  title?: string;
  description?: string;
}

export interface SetStats {
  id: number;
  title: string;
  wordCount: number;
  studiedWords: number;
  averageRate: number;
  lastReviewDate?: string;
  reviewCount: number;
}

export interface SetSearchFilter {
  searchTerm?: string | undefined;
  hasWords?: boolean | undefined;
  minWordCount?: number | undefined;
  maxWordCount?: number | undefined;
  lastReviewBefore?: string | undefined;
  lastReviewAfter?: string | undefined;
}

export class SetService {
  private static instance: SetService;

  private constructor() {}

  public static getInstance(): SetService {
    if (!SetService.instance) {
      SetService.instance = new SetService();
    }
    return SetService.instance;
  }

  /**
   * Create a new set
   */
  async createSet(request: SetCreateRequest): Promise<DatabaseResult<Set>> {
    const now = new Date().toISOString();
    
    const result = await SQLiteUniversal.execute<Set>(
      `INSERT INTO sets (guid, title, description, reviewCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [request.guid, request.title, request.description || null, 0, now, now]
    );

    if (!result.success) {
      return result;
    }

    // Return the created set
    return this.getSetById(result.insertId!);
  }

  /**
   * Get set by ID
   */
  async getSetById(id: number): Promise<DatabaseResult<Set>> {
    return SQLiteUniversal.execute<Set>(
      'SELECT * FROM sets WHERE id = ?',
      [id]
    );
  }

  /**
   * Get set by GUID
   */
  async getSetByGuid(guid: string): Promise<DatabaseResult<Set>> {
    return SQLiteUniversal.execute<Set>(
      'SELECT * FROM sets WHERE guid = ?',
      [guid]
    );
  }

  /**
   * Get set with words by ID
   */
  async getSetWithWords(id: number): Promise<DatabaseResult<SetWithWords>> {
    const setResult = await this.getSetById(id);
    
    if (!setResult.success || !setResult.data || setResult.data.length === 0) {
      return { success: false, error: setResult.error || 'Set not found' };
    }

    const set = setResult.data[0];
    const wordsResult = await this.getSetWords(id);
    
    if (!wordsResult.success) {
      return { success: false, error: wordsResult.error! };
    }

    const setWithWords: SetWithWords = {
      ...set,
      words: wordsResult.data || [],
      wordCount: wordsResult.data?.length || 0
    } as SetWithWords;

    return { success: true, data: [setWithWords] };
  }

  /**
   * Get all sets with optional pagination
   */
  async getAllSets(limit?: number, offset?: number): Promise<DatabaseResult<Set>> {
    let query = 'SELECT * FROM sets ORDER BY createdAt DESC';
    const params: any[] = [];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
      
      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return SQLiteUniversal.execute<Set>(query, params);
  }

  /**
   * Get all sets with statistics
   */
  async getAllSetsWithStats(): Promise<DatabaseResult<SetStats>> {
    const query = `
      SELECT 
        s.id, 
        s.title, 
        s.lastReviewDate,
        s.reviewCount,
        COUNT(sw.wordId) as wordCount,
        COUNT(CASE WHEN w.rate > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate ELSE NULL END), 2) as averageRate
      FROM sets s
      LEFT JOIN set_words sw ON s.id = sw.setId
      LEFT JOIN words w ON sw.wordId = w.id
      GROUP BY s.id, s.title, s.lastReviewDate, s.reviewCount
      ORDER BY s.createdAt DESC
    `;

    return SQLiteUniversal.execute<SetStats>(query);
  }

  /**
   * Update set
   */
  async updateSet(id: number, request: SetUpdateRequest): Promise<DatabaseResult<Set>> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (request.title !== undefined) {
      fields.push('title = ?');
      values.push(request.title);
    }
    if (request.description !== undefined) {
      fields.push('description = ?');
      values.push(request.description);
    }

    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const query = `UPDATE sets SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await SQLiteUniversal.execute(query, values);
    
    if (!result.success) {
      return result;
    }

    return this.getSetById(id);
  }

  /**
   * Delete set
   */
  async deleteSet(id: number): Promise<DatabaseResult> {
    return SQLiteUniversal.executeTransaction(async (execute) => {
      // Delete set-word relationships first
      await execute('DELETE FROM set_words WHERE setId = ?', [id]);
      
      // Delete the set
      await execute('DELETE FROM sets WHERE id = ?', [id]);
      
      return 'Set deleted successfully';
    });
  }

  /**
   * Search sets with filters
   */
  async searchSets(filter: SetSearchFilter, limit?: number): Promise<DatabaseResult<SetStats>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.searchTerm) {
      conditions.push('(s.title LIKE ? OR s.description LIKE ?)');
      const searchPattern = `%${filter.searchTerm}%`;
      params.push(searchPattern, searchPattern);
    }

    if (filter.minWordCount !== undefined) {
      conditions.push('wordCount >= ?');
      params.push(filter.minWordCount);
    }

    if (filter.maxWordCount !== undefined) {
      conditions.push('wordCount <= ?');
      params.push(filter.maxWordCount);
    }

    if (filter.hasWords === true) {
      conditions.push('wordCount > 0');
    } else if (filter.hasWords === false) {
      conditions.push('wordCount = 0');
    }

    if (filter.lastReviewBefore) {
      conditions.push('s.lastReviewDate < ?');
      params.push(filter.lastReviewBefore);
    }

    if (filter.lastReviewAfter) {
      conditions.push('s.lastReviewDate > ?');
      params.push(filter.lastReviewAfter);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';

    const query = `
      SELECT 
        s.id, 
        s.title, 
        s.lastReviewDate,
        s.reviewCount,
        COUNT(sw.wordId) as wordCount,
        COUNT(CASE WHEN w.rate > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate ELSE NULL END), 2) as averageRate
      FROM sets s
      LEFT JOIN set_words sw ON s.id = sw.setId
      LEFT JOIN words w ON sw.wordId = w.id
      GROUP BY s.id, s.title, s.lastReviewDate, s.reviewCount
      ${whereClause}
      ORDER BY s.createdAt DESC
      ${limitClause}
    `;

    return SQLiteUniversal.execute<SetStats>(query, params);
  }

  /**
   * Get words in a set
   */
  async getSetWords(setId: number): Promise<DatabaseResult<WordWithExamples>> {
    const query = `
      SELECT 
        w.id, w.guid, w.word, w.transcription, w.translation, w.explanation, 
        w.definition, w.partOfSpeech, w.language, w.level, w.isIrregular,
        w.dictionaryId, w.lastReviewDate, w.reviewCount, w.rate,
        w.createdAt, w.updatedAt
      FROM words w
      INNER JOIN set_words sw ON w.id = sw.wordId
      WHERE sw.setId = ?
      ORDER BY w.word ASC
    `;

    const wordsResult = await SQLiteUniversal.execute<WordWithExamples>(query, [setId]);
    
    if (!wordsResult.success || !wordsResult.data) {
      return wordsResult;
    }

    // Fetch examples for each word
    const wordsWithExamples: WordWithExamples[] = [];
    
    for (const word of wordsResult.data) {
      const examplesResult = await SQLiteUniversal.execute(
        'SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt ASC',
        [word.id]
      );
      
      const wordWithExamples: WordWithExamples = {
        ...word,
        examples: examplesResult.success ? examplesResult.data || [] : []
      };
      
      wordsWithExamples.push(wordWithExamples);
    }

    return { success: true, data: wordsWithExamples };
  }

  /**
   * Add word to set
   */
  async addWordToSet(setId: number, wordId: number): Promise<DatabaseResult> {
    // Check if relationship already exists
    const existingResult = await SQLiteUniversal.execute(
      'SELECT 1 FROM set_words WHERE setId = ? AND wordId = ?',
      [setId, wordId]
    );

    if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
      return { success: false, error: 'Word is already in the set' };
    }

    return SQLiteUniversal.execute(
      'INSERT INTO set_words (setId, wordId) VALUES (?, ?)',
      [setId, wordId]
    );
  }

  /**
   * Remove word from set
   */
  async removeWordFromSet(setId: number, wordId: number): Promise<DatabaseResult> {
    return SQLiteUniversal.execute(
      'DELETE FROM set_words WHERE setId = ? AND wordId = ?',
      [setId, wordId]
    );
  }

  /**
   * Add multiple words to set
   */
  async addWordsToSet(setId: number, wordIds: number[]): Promise<DatabaseResult> {
    if (wordIds.length === 0) {
      return { success: true, data: [] };
    }

    return SQLiteUniversal.executeTransaction(async (execute) => {
      const results = [];
      
      for (const wordId of wordIds) {
        // Check if relationship already exists
        const existingResult = await execute(
          'SELECT 1 FROM set_words WHERE setId = ? AND wordId = ?',
          [setId, wordId]
        );

        if (!existingResult.data || existingResult.data.length === 0) {
          await execute(
            'INSERT INTO set_words (setId, wordId) VALUES (?, ?)',
            [setId, wordId]
          );
          results.push(wordId);
        }
      }
      
      return `Added ${results.length} words to set`;
    });
  }

  /**
   * Remove multiple words from set
   */
  async removeWordsFromSet(setId: number, wordIds: number[]): Promise<DatabaseResult> {
    if (wordIds.length === 0) {
      return { success: true, data: [] };
    }

    const placeholders = wordIds.map(() => '?').join(',');
    const query = `DELETE FROM set_words WHERE setId = ? AND wordId IN (${placeholders})`;
    
    return SQLiteUniversal.execute(query, [setId, ...wordIds]);
  }

  /**
   * Get set statistics
   */
  async getSetStats(setId: number): Promise<DatabaseResult<SetStats>> {
    const query = `
      SELECT 
        s.id, 
        s.title, 
        s.lastReviewDate,
        s.reviewCount,
        COUNT(sw.wordId) as wordCount,
        COUNT(CASE WHEN w.rate > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate ELSE NULL END), 2) as averageRate
      FROM sets s
      LEFT JOIN set_words sw ON s.id = sw.setId
      LEFT JOIN words w ON sw.wordId = w.id
      WHERE s.id = ?
      GROUP BY s.id, s.title, s.lastReviewDate, s.reviewCount
    `;

    return SQLiteUniversal.execute<SetStats>(query, [setId]);
  }

  /**
   * Update set review date and count
   */
  async updateSetReview(setId: number): Promise<DatabaseResult> {
    const now = new Date().toISOString();
    
    return SQLiteUniversal.execute(
      'UPDATE sets SET lastReviewDate = ?, reviewCount = reviewCount + 1, updatedAt = ? WHERE id = ?',
      [now, now, setId]
    );
  }

  /**
   * Get sets for a specific word
   */
  async getSetsForWord(wordId: number): Promise<DatabaseResult<Set>> {
    const query = `
      SELECT s.* FROM sets s
      INNER JOIN set_words sw ON s.id = sw.setId
      WHERE sw.wordId = ?
      ORDER BY s.title ASC
    `;

    return SQLiteUniversal.execute<Set>(query, [wordId]);
  }

  /**
   * Get sets that need review
   */
  async getSetsForReview(daysAgo: number = 7, limit?: number): Promise<DatabaseResult<SetStats>> {
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - daysAgo);
    const reviewDateStr = reviewDate.toISOString();

    const limitClause = limit ? `LIMIT ${limit}` : '';

    const query = `
      SELECT 
        s.id, 
        s.title, 
        s.lastReviewDate,
        s.reviewCount,
        COUNT(sw.wordId) as wordCount,
        COUNT(CASE WHEN w.rate > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate ELSE NULL END), 2) as averageRate
      FROM sets s
      LEFT JOIN set_words sw ON s.id = sw.setId
      LEFT JOIN words w ON sw.wordId = w.id
      WHERE s.lastReviewDate IS NULL OR s.lastReviewDate < ?
      GROUP BY s.id, s.title, s.lastReviewDate, s.reviewCount
      HAVING wordCount > 0
      ORDER BY s.lastReviewDate ASC NULLS FIRST
      ${limitClause}
    `;

    return SQLiteUniversal.execute<SetStats>(query, [reviewDateStr]);
  }

  /**
   * Get sets stats for overview/listing
   */
  async getSetsStats(): Promise<DatabaseResult<{
    totalSets: number;
    totalWords: number;
    averageWordsPerSet: number;
    mostPopularSet: string;
  }>> {
    const query = `
      SELECT 
        COUNT(DISTINCT s.id) as totalSets,
        COUNT(sw.wordId) as totalWords,
        ROUND(CAST(COUNT(sw.wordId) AS FLOAT) / COUNT(DISTINCT s.id), 2) as averageWordsPerSet,
        (SELECT s2.title FROM sets s2 
         LEFT JOIN set_words sw2 ON s2.id = sw2.setId 
         GROUP BY s2.id 
         ORDER BY COUNT(sw2.wordId) DESC 
         LIMIT 1) as mostPopularSet
      FROM sets s
      LEFT JOIN set_words sw ON s.id = sw.setId
    `;

    return SQLiteUniversal.execute(query);
  }

  /**
   * Get random words from a set for study
   */
  async getRandomWordsFromSet(setId: number, count: number): Promise<DatabaseResult<WordWithExamples>> {
    const query = `
      SELECT 
        w.id, w.guid, w.word, w.transcription, w.translation, w.explanation, 
        w.definition, w.partOfSpeech, w.language, w.level, w.isIrregular,
        w.dictionaryId, w.lastReviewDate, w.reviewCount, w.rate,
        w.createdAt, w.updatedAt
      FROM words w
      INNER JOIN set_words sw ON w.id = sw.wordId
      WHERE sw.setId = ?
      ORDER BY RANDOM()
      LIMIT ?
    `;

    const wordsResult = await SQLiteUniversal.execute<WordWithExamples>(query, [setId, count]);
    
    if (!wordsResult.success || !wordsResult.data) {
      return wordsResult;
    }

    // Fetch examples for each word
    const wordsWithExamples: WordWithExamples[] = [];
    
    for (const word of wordsResult.data) {
      const examplesResult = await SQLiteUniversal.execute(
        'SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt ASC',
        [word.id]
      );
      
      const wordWithExamples: WordWithExamples = {
        ...word,
        examples: examplesResult.success ? examplesResult.data || [] : []
      };
      
      wordsWithExamples.push(wordWithExamples);
    }

    return { success: true, data: wordsWithExamples };
  }
}

// Export singleton instance
export const setService = SetService.getInstance();