// services/database/WordService.ts
/**
 * Word Service - Manages word CRUD operations and learning features
 *
 * This service handles all word-related database operations including:
 * - Basic CRUD operations
 * - Learning progress tracking
 * - Search and filtering
 * - Review scheduling
 *
 * Follows SOLID principles and provides comprehensive word management functionality
 */

import { DatabaseResult, SQLiteUniversal } from "./SQLiteUniversalService";

export enum PartOfSpeech {
  NOUN = "noun",
  VERB = "verb",
  ADJECTIVE = "adjective",
  ADVERB = "adverb",
  PREPOSITION = "preposition",
  PHRASE = "phrase",
  PHRASAL_VERB = "phrasal_verb",
  IDIOM = "idiom",
  PRONOUN = "pronoun",
  CONJUNCTION = "conjunction",
  INTERJECTION = "interjection",
  SLANG = "slang",
  ABBREVIATION = "abbreviation",
  FIXED_EXPRESSION = "fixed_expression",
}

export interface Word {
  id?: number;
  guid: string;
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  language: string;
  level?: string;
  isIrregular: boolean;
  dictionaryId: number;
  lastReviewDate?: string;
  reviewCount: number;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface WordWithExamples extends Word {
  examples: Example[];
}

export interface Example {
  id?: number;
  guid: string;
  sentence: string;
  translation?: string;
  wordId: number;
  createdAt: string;
  updatedAt: string;
}

export interface WordCreateRequest {
  guid: string;
  word: string;
  transcription?: string | undefined;
  translation?: string | undefined;
  explanation?: string | undefined;
  definition?: string | undefined;
  partOfSpeech: PartOfSpeech;
  language?: string | undefined;
  level?: string | undefined;
  isIrregular?: boolean | undefined;
  dictionaryId: number;
  examples?:
    | Omit<Example, "id" | "wordId" | "createdAt" | "updatedAt">[]
    | undefined;
}

export interface WordUpdateRequest {
  word?: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech?: PartOfSpeech;
  language?: string;
  level?: string;
  isIrregular?: boolean;
}

export interface WordSearchFilter {
  dictionaryId?: number | undefined;
  partOfSpeech?: PartOfSpeech | undefined;
  level?: string | undefined;
  language?: string | undefined;
  isIrregular?: boolean | undefined;
  searchTerm?: string | undefined;
  minRate?: number | undefined;
  maxRate?: number | undefined;
  needsReview?: boolean | undefined;
  maxReviewCount?: number | undefined; // Optional filter for max review count
  lastReviewAfter?: string | undefined; // Optional filter for last review date
}

export interface WordStats {
  totalWords: number;
  studiedWords: number;
  averageRate: number;
  byPartOfSpeech: Record<string, number>;
  byLevel: Record<string, number>;
  reviewsDue: number;
}

export class WordService {
  private static instance: WordService;

  private constructor() {}

  public static getInstance(): WordService {
    if (!WordService.instance) {
      WordService.instance = new WordService();
    }
    return WordService.instance;
  }

  /**
   * Create a new word with optional examples
   */
  async createWord(
    request: WordCreateRequest,
  ): Promise<DatabaseResult<WordWithExamples>> {
    const now = new Date().toISOString();

    // Start transaction for word creation
    return SQLiteUniversal.executeTransaction(async (execute) => {
      // Create word
      const wordResult = await execute(
        `INSERT INTO words (
          guid, word, transcription, translation, explanation, definition,
          partOfSpeech, language, level, isIrregular, dictionaryId,
          reviewCount, rate, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.guid,
          request.word,
          request.transcription || null,
          request.translation || null,
          request.explanation || null,
          request.definition || null,
          request.partOfSpeech,
          request.language || "en",
          request.level || null,
          request.isIrregular ? 1 : 0,
          request.dictionaryId,
          0, // reviewCount
          0, // rate
          now,
          now,
        ],
      );

      if (!wordResult.success) {
        throw new Error(wordResult.error || "Failed to create word");
      }

      const wordId = wordResult.insertId!;

      // Create examples if provided
      if (request.examples && request.examples.length > 0) {
        for (const example of request.examples) {
          const exampleResult = await execute(
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

          if (!exampleResult.success) {
            throw new Error(`Failed to create example: ${exampleResult.error}`);
          }
        }
      }

      // Return created word with examples
      const result = await this.getWordWithExamples(wordId);
      if (!result.success) {
        throw new Error("Failed to retrieve created word");
      }

      return result.data![0] as WordWithExamples;
    });
  }

  /**
   * Get word by ID with examples
   */
  async getWordWithExamples(
    id: number,
  ): Promise<DatabaseResult<WordWithExamples>> {
    const wordResult = await SQLiteUniversal.execute<Word>(
      "SELECT * FROM words WHERE id = ?",
      [id],
    );

    if (
      !wordResult.success ||
      !wordResult.data ||
      wordResult.data.length === 0
    ) {
      return wordResult as DatabaseResult<WordWithExamples>;
    }

    const word = wordResult.data[0];

    // Get examples for this word
    const examplesResult = await SQLiteUniversal.execute<Example>(
      "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt",
      [id],
    );

    const examples = examplesResult.success ? examplesResult.data || [] : [];

    const wordWithExamples: WordWithExamples = {
      ...word,
      examples,
    } as WordWithExamples;

    return {
      success: true,
      data: [wordWithExamples],
    };
  }

  /**
   * Get word by ID with examples
   */
  async getWordById(id: number): Promise<DatabaseResult<WordWithExamples>> {
    const wordResult = await SQLiteUniversal.execute<Word>(
      "SELECT * FROM words WHERE id = ?",
      [id],
    );

    if (
      !wordResult.success ||
      !wordResult.data ||
      wordResult.data.length === 0
    ) {
      return {
        success: false,
        error: "Word not found",
      };
    }

    const word = wordResult.data[0];

    // Get examples for this word
    const examplesResult = await SQLiteUniversal.execute<Example>(
      "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt ASC",
      [id],
    );

    const wordWithExamples: WordWithExamples = {
      ...word,
      examples: examplesResult.success ? examplesResult.data || [] : [],
    } as WordWithExamples;

    return {
      success: true,
      data: [wordWithExamples],
    };
  }

  /**
   * Get word by GUID with examples
   */
  async getWordByGuid(guid: string): Promise<DatabaseResult<WordWithExamples>> {
    const wordResult = await SQLiteUniversal.execute<Word>(
      "SELECT * FROM words WHERE guid = ?",
      [guid],
    );

    if (
      !wordResult.success ||
      !wordResult.data ||
      wordResult.data.length === 0
    ) {
      return {
        success: false,
        error: "Word not found",
      };
    }

    const word = wordResult.data[0];

    // Get examples for this word
    const examplesResult = await SQLiteUniversal.execute<Example>(
      "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt ASC",
      [word?.id!],
    );

    const wordWithExamples: WordWithExamples = {
      ...word,
      examples: examplesResult.success ? examplesResult.data || [] : [],
    } as WordWithExamples;

    return {
      success: true,
      data: [wordWithExamples],
    };
  }
  /**
   * Search and filter words
   */
  async searchWords(
    filter: WordSearchFilter,
    limit?: number,
    offset?: number,
  ): Promise<DatabaseResult<WordWithExamples>> {
    let query = `
      SELECT w.* FROM words w
      JOIN dictionaries d ON w.dictionaryId = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Apply filters
    if (filter.dictionaryId !== undefined) {
      query += " AND w.dictionaryId = ?";
      params.push(filter.dictionaryId);
    }

    if (filter.partOfSpeech !== undefined) {
      query += " AND w.partOfSpeech = ?";
      params.push(filter.partOfSpeech);
    }

    if (filter.level !== undefined) {
      query += " AND w.level = ?";
      params.push(filter.level);
    }

    if (filter.language !== undefined) {
      query += " AND w.language = ?";
      params.push(filter.language);
    }

    if (filter.isIrregular !== undefined) {
      query += " AND w.isIrregular = ?";
      params.push(filter.isIrregular ? 1 : 0);
    }

    if (filter.searchTerm) {
      query +=
        " AND (w.word LIKE ? OR w.translation LIKE ? OR w.definition LIKE ?)";
      const searchPattern = `%${filter.searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filter.minRate !== undefined) {
      query += " AND w.rate >= ?";
      params.push(filter.minRate);
    }

    if (filter.maxRate !== undefined) {
      query += " AND w.rate <= ?";
      params.push(filter.maxRate);
    }

    if (filter.needsReview) {
      // Words that need review: never reviewed or last review was more than 1 day ago
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      query += " AND (w.lastReviewDate IS NULL OR w.lastReviewDate < ?)";
      params.push(oneDayAgo);
    }

    query += " ORDER BY w.createdAt DESC";

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);

      if (offset !== undefined) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const wordsResult = await SQLiteUniversal.execute<Word>(query, params);

    if (!wordsResult.success) {
      return wordsResult as DatabaseResult<WordWithExamples>;
    }

    // Get examples for each word
    const wordsWithExamples: WordWithExamples[] = [];

    for (const word of wordsResult.data || []) {
      const examplesResult = await SQLiteUniversal.execute<Example>(
        "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt",
        [word.id!],
      );

      const examples = examplesResult.success ? examplesResult.data || [] : [];

      wordsWithExamples.push({
        ...word,
        examples,
      });
    }

    return {
      success: true,
      data: wordsWithExamples,
    };
  }

  /**
   * Get random words for study
   */
  async getRandomWords(
    count: number,
    dictionaryId?: number,
  ): Promise<DatabaseResult<WordWithExamples>> {
    let query = "SELECT * FROM words";
    const params: any[] = [];

    if (dictionaryId !== undefined) {
      query += " WHERE dictionaryId = ?";
      params.push(dictionaryId);
    }

    query += " ORDER BY RANDOM() LIMIT ?";
    params.push(count);

    const wordsResult = await SQLiteUniversal.execute<Word>(query, params);

    if (!wordsResult.success) {
      return wordsResult as DatabaseResult<WordWithExamples>;
    }

    // Get examples for each word
    const wordsWithExamples: WordWithExamples[] = [];

    for (const word of wordsResult.data || []) {
      const examplesResult = await SQLiteUniversal.execute<Example>(
        "SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt",
        [word.id!],
      );

      const examples = examplesResult.success ? examplesResult.data || [] : [];

      wordsWithExamples.push({
        ...word,
        examples,
      });
    }

    return {
      success: true,
      data: wordsWithExamples,
    };
  }

  /**
   * Update word
   */
  async updateWord(
    id: number,
    request: WordUpdateRequest,
  ): Promise<DatabaseResult<WordWithExamples>> {
    const fields: string[] = [];
    const params: any[] = [];

    // Build dynamic update query
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "isIrregular") {
          fields.push(`${key} = ?`);
          params.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          params.push(value);
        }
      }
    });

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
      `UPDATE words SET ${fields.join(", ")} WHERE id = ?`,
      params,
    );

    if (!updateResult.success) {
      return updateResult as DatabaseResult<WordWithExamples>;
    }

    // Return updated word with examples
    return this.getWordWithExamples(id);
  }

  /**
   * Update word review progress
   */
  async updateWordProgress(id: number, rate: number): Promise<DatabaseResult> {
    const now = new Date().toISOString();

    return SQLiteUniversal.execute(
      `UPDATE words 
       SET rate = ?, lastReviewDate = ?, reviewCount = reviewCount + 1, updatedAt = ?
       WHERE id = ?`,
      [rate, now, now, id],
    );
  }

  /**
   * Delete word and its examples
   */
  async deleteWord(id: number): Promise<DatabaseResult> {
    // Examples will be deleted by CASCADE constraint
    return SQLiteUniversal.execute("DELETE FROM words WHERE id = ?", [id]);
  }

  /**
   * Get words statistics
   */
  async getWordsStats(
    dictionaryId?: number,
  ): Promise<DatabaseResult<WordStats>> {
    let whereClause = "";
    const params: any[] = [];

    if (dictionaryId !== undefined) {
      whereClause = "WHERE dictionaryId = ?";
      params.push(dictionaryId);
    }

    const statsResult = await SQLiteUniversal.execute(
      `SELECT 
        COUNT(*) as totalWords,
        COUNT(CASE WHEN reviewCount > 0 THEN 1 END) as studiedWords,
        ROUND(AVG(CASE WHEN rate > 0 THEN rate END), 2) as averageRate
       FROM words ${whereClause}`,
      params,
    );

    if (!statsResult.success) {
      return statsResult as DatabaseResult<WordStats>;
    }

    // Get stats by part of speech
    const posStatsResult = await SQLiteUniversal.execute(
      `SELECT partOfSpeech, COUNT(*) as count 
       FROM words ${whereClause}
       GROUP BY partOfSpeech`,
      params,
    );

    // Get stats by level
    const levelStatsResult = await SQLiteUniversal.execute(
      `SELECT level, COUNT(*) as count 
       FROM words ${whereClause}
       GROUP BY level`,
      params,
    );

    // Count words that need review
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const reviewParams =
      dictionaryId !== undefined ? [oneDayAgo, dictionaryId] : [oneDayAgo];
    const reviewCountResult = await SQLiteUniversal.execute(
      `SELECT COUNT(*) as reviewsDue 
       FROM words 
       WHERE (lastReviewDate IS NULL OR lastReviewDate < ?) 
       ${dictionaryId !== undefined ? "AND dictionaryId = ?" : ""}`,
      reviewParams,
    );

    // Build response
    const baseStats = statsResult.data![0] as any;
    const byPartOfSpeech: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    (posStatsResult.data || []).forEach((row: any) => {
      byPartOfSpeech[row.partOfSpeech] = row.count;
    });

    (levelStatsResult.data || []).forEach((row: any) => {
      if (row.level) {
        byLevel[row.level] = row.count;
      }
    });

    const reviewsDue = reviewCountResult.success
      ? (reviewCountResult.data![0] as any).reviewsDue
      : 0;

    const stats: WordStats = {
      totalWords: baseStats.totalWords || 0,
      studiedWords: baseStats.studiedWords || 0,
      averageRate: baseStats.averageRate || 0,
      byPartOfSpeech,
      byLevel,
      reviewsDue,
    };

    return {
      success: true,
      data: [stats],
    };
  }

  /**
   * Get words due for review
   */
  async getWordsForReview(
    limit?: number,
    dictionaryId?: number,
  ): Promise<DatabaseResult<WordWithExamples>> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT * FROM words 
      WHERE (lastReviewDate IS NULL OR lastReviewDate < ?)
    `;
    const params: any[] = [oneDayAgo];

    if (dictionaryId !== undefined) {
      query += " AND dictionaryId = ?";
      params.push(dictionaryId);
    }

    query += " ORDER BY lastReviewDate ASC NULLS FIRST";

    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);
    }

    return this.searchWords({ needsReview: true, dictionaryId }, limit);
  }

  /**
   * Check if word exists by GUID
   */
  async wordExists(guid: string): Promise<boolean> {
    const result = await SQLiteUniversal.execute(
      "SELECT COUNT(*) as count FROM words WHERE guid = ?",
      [guid],
    );

    if (!result.success || !result.data || result.data.length === 0) {
      return false;
    }

    return (result.data[0] as any).count > 0;
  }
}

// Export singleton instance
export const wordService = WordService.getInstance();
