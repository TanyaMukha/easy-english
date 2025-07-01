// services/database/DictionaryService.ts
/**
 * Dictionary Service - Manages dictionary CRUD operations
 * 
 * This service follows SOLID principles:
 * - Single Responsibility: Only handles dictionary-related database operations
 * - Open/Closed: Can be extended with new dictionary features without modification
 * - Interface Segregation: Provides specific methods for dictionary operations
 * - Dependency Inversion: Depends on SQLiteUniversal abstraction
 */

import { SQLiteUniversal, DatabaseResult } from './SQLiteUniversalService';

export interface Dictionary {
  id?: number;
  guid: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryCreateRequest {
  guid: string;
  title: string;
  description?: string;
}

export interface DictionaryUpdateRequest {
  title?: string;
  description?: string;
}

export interface DictionaryStats {
  id: number;
  title: string;
  totalWords: number;
  studiedWords: number;
  averageRate: number;
}

export class DictionaryService {
  private static instance: DictionaryService;

  private constructor() {}

  public static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  /**
   * Create a new dictionary
   */
  async createDictionary(request: DictionaryCreateRequest): Promise<DatabaseResult<Dictionary>> {
    const now = new Date().toISOString();
    
    const result = await SQLiteUniversal.execute<Dictionary>(
      `INSERT INTO dictionaries (guid, title, description, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [request.guid, request.title, request.description || null, now, now]
    );

    if (!result.success) {
      return result;
    }

    // Return the created dictionary
    return this.getDictionaryById(result.insertId!);
  }

  /**
   * Get dictionary by ID
   */
  async getDictionaryById(id: number): Promise<DatabaseResult<Dictionary>> {
    return SQLiteUniversal.execute<Dictionary>(
      'SELECT * FROM dictionaries WHERE id = ?',
      [id]
    );
  }

  /**
   * Get dictionary by GUID
   */
  async getDictionaryByGuid(guid: string): Promise<DatabaseResult<Dictionary>> {
    return SQLiteUniversal.execute<Dictionary>(
      'SELECT * FROM dictionaries WHERE guid = ?',
      [guid]
    );
  }

  /**
   * Get all dictionaries with optional pagination
   */
  async getAllDictionaries(limit?: number, offset?: number): Promise<DatabaseResult<Dictionary>> {
    let query = 'SELECT * FROM dictionaries ORDER BY createdAt DESC';
    const params: any[] = [];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
      
      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return SQLiteUniversal.execute<Dictionary>(query, params);
  }

  /**
   * Update dictionary
   */
  async updateDictionary(id: number, request: DictionaryUpdateRequest): Promise<DatabaseResult<Dictionary>> {
    const fields: string[] = [];
    const params: any[] = [];

    if (request.title !== undefined) {
      fields.push('title = ?');
      params.push(request.title);
    }

    if (request.description !== undefined) {
      fields.push('description = ?');
      params.push(request.description);
    }

    if (fields.length === 0) {
      return {
        success: false,
        error: 'No fields to update'
      };
    }

    // Add updatedAt timestamp
    fields.push('updatedAt = ?');
    params.push(new Date().toISOString());

    // Add ID to params
    params.push(id);

    const updateResult = await SQLiteUniversal.execute(
      `UPDATE dictionaries SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    if (!updateResult.success) {
      return updateResult;
    }

    // Return updated dictionary
    return this.getDictionaryById(id);
  }

  /**
   * Delete dictionary and all its words
   */
  async deleteDictionary(id: number): Promise<DatabaseResult> {
    // First check if dictionary exists
    const existsResult = await this.getDictionaryById(id);
    if (!existsResult.success || !existsResult.data || existsResult.data.length === 0) {
      return {
        success: false,
        error: 'Dictionary not found'
      };
    }

    // Delete dictionary (words and examples will be deleted by CASCADE)
    return SQLiteUniversal.execute(
      'DELETE FROM dictionaries WHERE id = ?',
      [id]
    );
  }

  /**
   * Get dictionary statistics
   */
  async getDictionaryStats(id: number): Promise<DatabaseResult<DictionaryStats>> {
    const result = await SQLiteUniversal.execute<DictionaryStats>(
      `SELECT 
        d.id,
        d.title,
        COUNT(w.id) as totalWords,
        COUNT(CASE WHEN w.reviewCount > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate END), 2) as averageRate
       FROM dictionaries d
       LEFT JOIN words w ON d.id = w.dictionaryId
       WHERE d.id = ?
       GROUP BY d.id, d.title`,
      [id]
    );

    return result;
  }

  /**
   * Get all dictionaries with their statistics
   */
  async getAllDictionariesWithStats(): Promise<DatabaseResult<DictionaryStats>> {
    return SQLiteUniversal.execute<DictionaryStats>(
      `SELECT 
        d.id,
        d.title,
        COUNT(w.id) as totalWords,
        COUNT(CASE WHEN w.reviewCount > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN w.rate > 0 THEN w.rate END), 2) as averageRate
       FROM dictionaries d
       LEFT JOIN words w ON d.id = w.dictionaryId
       GROUP BY d.id, d.title
       ORDER BY d.createdAt DESC`
    );
  }

  /**
   * Search dictionaries by title
   */
  async searchDictionaries(searchTerm: string): Promise<DatabaseResult<Dictionary>> {
    return SQLiteUniversal.execute<Dictionary>(
      `SELECT * FROM dictionaries 
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY title`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
  }

  /**
   * Check if dictionary exists by GUID
   */
  async dictionaryExists(guid: string): Promise<boolean> {
    const result = await SQLiteUniversal.execute(
      'SELECT COUNT(*) as count FROM dictionaries WHERE guid = ?',
      [guid]
    );

    if (!result.success || !result.data || result.data.length === 0) {
      return false;
    }

    return (result.data[0] as any).count > 0;
  }
}

// Export singleton instance
export const dictionaryService = DictionaryService.getInstance();