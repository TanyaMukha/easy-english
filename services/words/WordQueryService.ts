// services/words/WordQueryService.ts
/**
 * Word Query Service - пошук та фільтрація слів
 * Single Responsibility: Тільки запити та пошук
 */

import { Platform } from "react-native";

import { ExampleService } from "./ExampleService";
import { DatabaseService } from "../DatabaseService";
import { MockDataService } from "../MockDataService";
import {
  LanguageCode,
  Level,
  PartOfSpeech,
  WordWithExamples,
} from "../../data/DataModels";

export interface WordFilters {
  dictionaryId?: number;
  search?: string;
  partOfSpeech?: PartOfSpeech[];
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "word" | "createdAt" | "reviewCount" | "rate";
  sortOrder?: "asc" | "desc";
}

export interface WordsListResponse {
  success: boolean;
  data?: WordWithExamples[];
  error?: string;
  total?: number;
}

export class WordQueryService {
  /**
   * Get all words with filtering and pagination
   */
  static async getAll(filters?: WordFilters): Promise<WordsListResponse> {
    try {
      await MockDataService.delay();

      if (Platform.OS === "web") {
        return this.getAllFromMockData(filters);
      } else {
        return this.getAllFromDatabase(filters);
      }
    } catch (error) {
      console.error("Error getting words:", error);
      return { success: false, error: "Failed to retrieve words" };
    }
  }

  /**
   * Search words by query
   */
  static async search(
    query: string,
    limit?: number,
  ): Promise<WordsListResponse> {
    const filters: WordFilters = {
      search: query,
      limit: limit || 20,
      offset: 0,
      sortBy: "word",
      sortOrder: "asc",
    };

    return this.getAll(filters);
  }

  /**
   * Get words by dictionary ID
   */
  static async getByDictionaryId(
    dictionaryId: number,
    limit?: number,
  ): Promise<WordsListResponse> {
    const filters: WordFilters = {
      dictionaryId,
      limit: limit || 50,
      offset: 0,
      sortBy: "word",
      sortOrder: "asc",
    };

    return this.getAll(filters);
  }

  /**
   * Get random words for practice
   */
  static async getRandomWords(
    count: number = 10,
    filters?: Partial<WordFilters>,
  ): Promise<WordsListResponse> {
    try {
      await MockDataService.delay(50);

      if (Platform.OS === "web") {
        let availableWords = [...MockDataService.mockWords];

        // Apply filters
        if (filters?.dictionaryId) {
          availableWords = availableWords.filter(
            (w) => w.dictionaryId === filters.dictionaryId,
          );
        }

        if (filters?.level) {
          availableWords = availableWords.filter(
            (w) => w.level === filters.level,
          );
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          availableWords = availableWords.filter((w) =>
            filters.partOfSpeech!.includes(w.partOfSpeech),
          );
        }

        // Shuffle and take random words
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        const randomWords = shuffled.slice(0, count);

        return {
          success: true,
          data: randomWords as WordWithExamples[],
          total: randomWords.length,
        };
      } else {
        const db = await DatabaseService.getDatabase();

        let query = `
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (filters?.dictionaryId) {
          conditions.push("w.dictionaryId = ?");
          params.push(filters.dictionaryId);
        }

        if (filters?.level) {
          conditions.push("w.level = ?");
          params.push(filters.level);
        }

        if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
          const placeholders = filters.partOfSpeech.map(() => "?").join(",");
          conditions.push(`w.partOfSpeech IN (${placeholders})`);
          params.push(...filters.partOfSpeech);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY RANDOM() LIMIT ?";
        params.push(count);

        const words = await db.getAllAsync(query, params);

        const wordsWithExamples: WordWithExamples[] = await Promise.all(
          words.map(async (word: any) => {
            const examples = await ExampleService.getByWordId(word.id);

            return {
              ...word,
              isIrregular: Boolean(word.isIrregular),
              examples: examples.data || [],
              tags: [],
              dictionary: {
                id: word.dictionaryId,
                title: word.dictionaryTitle,
              },
              nextReviewDate: null,
            };
          }),
        );

        return {
          success: true,
          data: wordsWithExamples,
          total: wordsWithExamples.length,
        };
      }
    } catch (error) {
      console.error("Error getting random words:", error);
      return { success: false, error: "Failed to get random words" };
    }
  }

  private static getAllFromMockData(filters?: WordFilters): WordsListResponse {
    let filteredWords = [...MockDataService.mockWords];

    // Apply filters
    if (filters?.dictionaryId) {
      filteredWords = filteredWords.filter(
        (w) => w.dictionaryId === filters.dictionaryId,
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredWords = filteredWords.filter(
        (w) =>
          w.word.toLowerCase().includes(searchLower) ||
          w.translation?.toLowerCase().includes(searchLower) ||
          w.explanation?.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
      filteredWords = filteredWords.filter((w) =>
        filters.partOfSpeech!.includes(w.partOfSpeech),
      );
    }

    if (filters?.level) {
      filteredWords = filteredWords.filter((w) => w.level === filters.level);
    }

    if (filters?.isIrregular !== undefined) {
      filteredWords = filteredWords.filter(
        (w) => w.isIrregular === filters.isIrregular,
      );
    }

    // Sort
    filteredWords.sort((a, b) => {
      switch (filters?.sortBy) {
        case "word":
          return filters.sortOrder === "desc"
            ? b.word.localeCompare(a.word)
            : a.word.localeCompare(b.word);
        case "reviewCount":
          return filters.sortOrder === "desc"
            ? b.reviewCount - a.reviewCount
            : a.reviewCount - b.reviewCount;
        case "rate":
          return filters.sortOrder === "desc"
            ? b.rate - a.rate
            : a.rate - b.rate;
        case "createdAt":
        default:
          const aDate = new Date(a.createdAt || 0).getTime();
          const bDate = new Date(b.createdAt || 0).getTime();
          return filters?.sortOrder === "desc" ? bDate - aDate : aDate - bDate;
      }
    });

    // Pagination
    const total = filteredWords.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginatedWords = filteredWords.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedWords as WordWithExamples[],
      total,
    };
  }

  private static async getAllFromDatabase(
    filters?: WordFilters,
  ): Promise<WordsListResponse> {
    const db = await DatabaseService.getDatabase();

    // Build dynamic query
    let query = `
      SELECT w.*, d.title as dictionaryTitle 
      FROM words w 
      JOIN dictionaries d ON w.dictionaryId = d.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.dictionaryId) {
      conditions.push("w.dictionaryId = ?");
      params.push(filters.dictionaryId);
    }

    if (filters?.search) {
      conditions.push(`(
        w.word LIKE ? OR 
        w.translation LIKE ? OR 
        w.explanation LIKE ?
      )`);
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
      const placeholders = filters.partOfSpeech.map(() => "?").join(",");
      conditions.push(`w.partOfSpeech IN (${placeholders})`);
      params.push(...filters.partOfSpeech);
    }

    if (filters?.level) {
      conditions.push("w.level = ?");
      params.push(filters.level);
    }

    if (filters?.isIrregular !== undefined) {
      conditions.push("w.isIrregular = ?");
      params.push(filters.isIrregular ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Add sorting
    const sortBy = filters?.sortBy || "word";
    const sortOrder = filters?.sortOrder || "asc";
    query += ` ORDER BY w.${sortBy} ${sortOrder.toUpperCase()}`;

    // Add pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const words = await db.getAllAsync(query, params);

    // Get examples for each word
    const wordsWithExamples: WordWithExamples[] = await Promise.all(
      words.map(async (word: any) => {
        const examples = await ExampleService.getByWordId(word.id);

        return {
          ...word,
          isIrregular: Boolean(word.isIrregular),
          examples: examples.data || [],
          tags: [],
          dictionary: { id: word.dictionaryId, title: word.dictionaryTitle },
          nextReviewDate: null,
        };
      }),
    );

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM words w 
      JOIN dictionaries d ON w.dictionaryId = d.id
    `;

    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }

    const countParams = params.slice(0, -2); // Remove limit and offset
    const totalResult = await db.getFirstAsync(countQuery, countParams);
    const total = (totalResult as any)?.total || 0;

    return {
      success: true,
      data: wordsWithExamples,
      total,
    };
  }
}
