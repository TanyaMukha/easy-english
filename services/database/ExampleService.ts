// services/database/ExampleService.ts
/**
 * Example Service - Manages example sentences for words
 *
 * This service handles CRUD operations for word examples including:
 * - Creating new examples for words
 * - Updating existing examples
 * - Retrieving examples by various criteria
 * - Deleting examples
 *
 * Follows SOLID principles and provides clean interface for example management
 */

import { DatabaseResult, SQLiteUniversal } from "./SQLiteUniversalService";

export interface Example {
  id?: number;
  guid: string;
  sentence: string;
  translation?: string;
  wordId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExampleCreateRequest {
  guid: string;
  sentence: string;
  translation?: string;
  wordId: number;
}

export interface ExampleUpdateRequest {
  sentence?: string;
  translation?: string;
}

export interface ExampleWithWord extends Example {
  word: string;
  wordTranslation?: string;
  partOfSpeech: string;
}

export class ExampleService {
  private static instance: ExampleService;

  private constructor() {}

  public static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }

  /**
   * Create a new example for a word
   */
  async createExample(
    request: ExampleCreateRequest,
  ): Promise<DatabaseResult<Example>> {
    const now = new Date().toISOString();

    const result = await SQLiteUniversal.execute(
      `INSERT INTO examples (guid, sentence, translation, wordId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        request.guid,
        request.sentence,
        request.translation || null,
        request.wordId,
        now,
        now,
      ],
    );

    if (!result.success) {
      return result;
    }

    // Return the created example
    return this.getExampleById(result.insertId!);
  }

  /**
   * Create multiple examples for a word in a transaction
   */
  async createExamplesForWord(
    wordId: number,
    examples: Omit<ExampleCreateRequest, "wordId">[],
  ): Promise<DatabaseResult<Example[]>> {
    if (examples.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    return SQLiteUniversal.executeTransaction(async (execute) => {
      const createdExamples: Example[] = [];
      const now = new Date().toISOString();

      for (const example of examples) {
        const result = await execute(
          `INSERT INTO examples (guid, sentence, translation, wordId, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            example.guid,
            example.sentence,
            example.translation || null,
            wordId,
            now,
            now,
          ],
        );

        if (!result.success) {
          throw new Error(`Failed to create example: ${result.error}`);
        }

        // Get the created example
        const exampleResult = await execute(
          "SELECT * FROM examples WHERE id = ?",
          [result.insertId!],
        );

        if (
          exampleResult.success &&
          exampleResult.data &&
          exampleResult.data.length > 0
        ) {
          createdExamples.push(exampleResult.data[0]);
        }
      }

      return createdExamples;
    });
  }

  /**
   * Get example by ID
   */
  async getExampleById(id: number): Promise<DatabaseResult<Example>> {
    return SQLiteUniversal.execute(
      "SELECT * FROM examples WHERE id = ?",
      [id],
    );
  }

  /**
   * Get example by GUID
   */
  async getExampleByGuid(guid: string): Promise<DatabaseResult<Example>> {
    return SQLiteUniversal.execute(
      "SELECT * FROM examples WHERE guid = ?",
      [guid],
    );
  }

  /**
   * Get all examples for a specific word
   */
  async getExamplesByWordId(wordId: number): Promise<DatabaseResult<Example>> {
    return SQLiteUniversal.execute(
      "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt",
      [wordId],
    );
  }

  /**
   * Get examples with word information
   */
  async getExamplesWithWord(
    wordId?: number,
    limit?: number,
    offset?: number,
  ): Promise<DatabaseResult<ExampleWithWord>> {
    let query = `
      SELECT 
        e.*,
        w.word,
        w.translation as wordTranslation,
        w.partOfSpeech
      FROM examples e
      JOIN words w ON e.wordId = w.id
    `;
    const params: any[] = [];

    if (wordId !== undefined) {
      query += " WHERE e.wordId = ?";
      params.push(wordId);
    }

    query += " ORDER BY e.createdAt DESC";

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);

      if (offset !== undefined) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    return SQLiteUniversal.execute(query, params);
  }

  /**
   * Search examples by text content
   */
  async searchExamples(
    searchTerm: string,
    wordId?: number,
    limit?: number,
  ): Promise<DatabaseResult<ExampleWithWord>> {
    let query = `
      SELECT 
        e.*,
        w.word,
        w.translation as wordTranslation,
        w.partOfSpeech
      FROM examples e
      JOIN words w ON e.wordId = w.id
      WHERE (e.sentence LIKE ? OR e.translation LIKE ?)
    `;
    const searchPattern = `%${searchTerm}%`;
    const params: any[] = [searchPattern, searchPattern];

    if (wordId !== undefined) {
      query += " AND e.wordId = ?";
      params.push(wordId);
    }

    query += " ORDER BY e.createdAt DESC";

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);
    }

    return SQLiteUniversal.execute(query, params);
  }

  /**
   * Update example
   */
  async updateExample(
    id: number,
    request: ExampleUpdateRequest,
  ): Promise<DatabaseResult<Example>> {
    const fields: string[] = [];
    const params: any[] = [];

    if (request.sentence !== undefined) {
      fields.push("sentence = ?");
      params.push(request.sentence);
    }

    if (request.translation !== undefined) {
      fields.push("translation = ?");
      params.push(request.translation);
    }

    if (fields.length === 0) {
      return {
        success: false,
        error: "No fields to update",
      };
    }

    // Add updatedAt timestamp
    fields.push("updatedAt = ?");
    params.push(new Date().toISOString());

    // Add ID to params
    params.push(id);

    const updateResult = await SQLiteUniversal.execute(
      `UPDATE examples SET ${fields.join(", ")} WHERE id = ?`,
      params,
    );

    if (!updateResult.success) {
      return updateResult;
    }

    // Return updated example
    return this.getExampleById(id);
  }

  /**
   * Delete example
   */
  async deleteExample(id: number): Promise<DatabaseResult> {
    // First check if example exists
    const existsResult = await this.getExampleById(id);
    if (
      !existsResult.success ||
      !existsResult.data ||
      existsResult.data.length === 0
    ) {
      return {
        success: false,
        error: "Example not found",
      };
    }

    return SQLiteUniversal.execute("DELETE FROM examples WHERE id = ?", [id]);
  }

  /**
   * Delete all examples for a word
   */
  async deleteExamplesByWordId(wordId: number): Promise<DatabaseResult> {
    return SQLiteUniversal.execute("DELETE FROM examples WHERE wordId = ?", [
      wordId,
    ]);
  }

  /**
   * Get examples count for a word
   */
  async getExamplesCount(wordId: number): Promise<number> {
    const result = await SQLiteUniversal.execute(
      "SELECT COUNT(*) as count FROM examples WHERE wordId = ?",
      [wordId],
    );

    if (!result.success || !result.data || result.data.length === 0) {
      return 0;
    }

    return (result.data[0] as any).count;
  }

  /**
   * Get random examples from different words
   */
  async getRandomExamples(
    count: number,
    dictionaryId?: number,
  ): Promise<DatabaseResult<ExampleWithWord>> {
    let query = `
      SELECT 
        e.*,
        w.word,
        w.translation as wordTranslation,
        w.partOfSpeech
      FROM examples e
      JOIN words w ON e.wordId = w.id
    `;
    const params: any[] = [];

    if (dictionaryId !== undefined) {
      query += " WHERE w.dictionaryId = ?";
      params.push(dictionaryId);
    }

    query += " ORDER BY RANDOM() LIMIT ?";
    params.push(count);

    return SQLiteUniversal.execute(query, params);
  }

  /**
   * Check if example exists by GUID
   */
  async exampleExists(guid: string): Promise<boolean> {
    const result = await SQLiteUniversal.execute(
      "SELECT COUNT(*) as count FROM examples WHERE guid = ?",
      [guid],
    );

    if (!result.success || !result.data || result.data.length === 0) {
      return false;
    }

    return (result.data[0] as any).count > 0;
  }

  /**
   * Get examples statistics for a dictionary
   */
  async getExamplesStats(
    dictionaryId?: number,
  ): Promise<
    DatabaseResult<{
      totalExamples: number;
      wordsWithExamples: number;
      averageExamplesPerWord: number;
    }>
  > {
    let whereClause = "";
    const params: any[] = [];

    if (dictionaryId !== undefined) {
      whereClause = "WHERE w.dictionaryId = ?";
      params.push(dictionaryId);
    }

    const result = await SQLiteUniversal.execute(
      `SELECT 
        COUNT(e.id) as totalExamples,
        COUNT(DISTINCT e.wordId) as wordsWithExamples,
        ROUND(CAST(COUNT(e.id) AS FLOAT) / COUNT(DISTINCT e.wordId), 2) as averageExamplesPerWord
       FROM examples e
       JOIN words w ON e.wordId = w.id
       ${whereClause}`,
      params,
    );

    return result;
  }

  /**
   * Get all examples (for export/backup purposes)
   * This method is needed by QueryService for data export functionality
   */
  async getAllExamples(
    limit?: number,
    offset?: number,
  ): Promise<DatabaseResult<ExampleWithWord>> {
    let query = `
    SELECT 
      e.*,
      w.word,
      w.translation as wordTranslation,
      w.partOfSpeech
    FROM examples e
    JOIN words w ON e.wordId = w.id
    ORDER BY e.createdAt DESC
  `;
    const params: any[] = [];

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);

      if (offset !== undefined) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    return SQLiteUniversal.execute(query, params);
  }
}

// Export singleton instance
export const exampleService = ExampleService.getInstance();
