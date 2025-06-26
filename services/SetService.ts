// services/SetService.ts
import { Set, SetWord, Word, SetWithWords, WordWithExamples } from "../data/DataModels";
import { Utils } from "../data/DataUtils";

// Mock database simulation - replace with actual SQLite operations
let mockSets: Set[] = [
  {
    id: 1,
    guid: "set-001",
    title: "Basic Vocabulary",
    description: "Essential words for beginners",
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    guid: "set-002", 
    title: "Travel Phrases",
    description: "Common phrases for travelers",
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    guid: "set-003",
    title: "Business English", 
    description: "Professional vocabulary",
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

// Mock set-word relationships
let mockSetWords: SetWord[] = [
  { setId: 1, wordId: 1 },
  { setId: 1, wordId: 2 },
  { setId: 1, wordId: 3 },
  { setId: 2, wordId: 1 },
  { setId: 2, wordId: 4 },
  { setId: 3, wordId: 5 },
  { setId: 3, wordId: 6 },
];

// Mock words count storage
const mockWordsCount: Record<number, number> = {
  1: 25,
  2: 18,
  3: 12,
};

let nextId = 4;

export interface CreateSetRequest {
  title: string;
  description?: string | undefined;
}

export interface UpdateSetRequest {
  title?: string | undefined;
  description?: string | undefined;
}

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

export interface AddWordToSetRequest {
  setId: number;
  wordId: number;
}

export interface RemoveWordFromSetRequest {
  setId: number;
  wordId: number;
}

/**
 * Service for managing word sets CRUD operations
 * Single Responsibility: Handle all set data operations
 * Open/Closed: Can be extended with additional set operations
 * Dependency Inversion: Abstracts database operations
 */
export class SetService {
  /**
   * Get all sets
   */
  static async getAll(): Promise<SetsListResponse> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        data: [...mockSets].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
      };
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const set = mockSets.find((s) => s.id === id);

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
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 150));

      const set = mockSets.find((s) => s.id === id);

      if (!set) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      // Get word IDs for this set
      const setWordIds = mockSetWords
        .filter((sw) => sw.setId === id)
        .map((sw) => sw.wordId);

      // Mock getting words - in real implementation would fetch from WordService
      const words: WordWithExamples[] = []; // TODO: Implement actual word fetching

      const setWithWords: SetWithWords = {
        ...set,
        words,
        wordCount: setWordIds.length,
      };

      return {
        success: true,
        data: setWithWords,
      };
    } catch (error) {
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
      // Validate request
      const validation = this.validateCreateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error ?? "Invalid request data",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if set with same title already exists
      const existingSet = mockSets.find(
        (s) => s.title.toLowerCase().trim() === request.title.toLowerCase().trim(),
      );

      if (existingSet) {
        return {
          success: false,
          error: "Set with this title already exists",
        };
      }

      const newSet: Set = {
        id: nextId++,
        guid: "", //Utils.generateGuid(),
        title: request.title.trim(),
        description: request.description?.trim() || undefined,
        lastReviewDate: null,
        reviewCount: 0,
        rate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSets.push(newSet);
      mockWordsCount[newSet.id] = 0; // New set starts with 0 words

      return {
        success: true,
        data: newSet,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create set",
      };
    }
  }

  /**
   * Update set
   */
  static async update(
    id: number,
    request: UpdateSetRequest,
  ): Promise<SetResponse> {
    try {
      // Validate request
      const validation = this.validateUpdateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error ?? "Invalid request data",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const setIndex = mockSets.findIndex((s) => s.id === id);

      if (setIndex === -1) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      // Check if title already exists (excluding current set)
      if (request.title) {
        const existingSet = mockSets.find(
          (s) =>
            s.id !== id &&
            s.title.toLowerCase().trim() === request.title!.toLowerCase().trim(),
        );

        if (existingSet) {
          return {
            success: false,
            error: "Set with this title already exists",
          };
        }
      }

      if (!mockSets[setIndex]) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      const updatedSet: Set = {
        ...mockSets[setIndex],
        title: request.title !== undefined && typeof request.title === "string"
          ? request.title.trim()
          : mockSets[setIndex]!.title,
        description: request.description !== undefined ? (request.description.trim() || undefined) : mockSets[setIndex]!.description,
        updatedAt: new Date().toISOString(),
      };

      mockSets[setIndex] = updatedSet;

      return {
        success: true,
        data: updatedSet,
      };
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 200));

      const setIndex = mockSets.findIndex((s) => s.id === id);

      if (setIndex === -1) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      // Remove set from sets array
      mockSets.splice(setIndex, 1);

      // Remove all word associations
      mockSetWords = mockSetWords.filter((sw) => sw.setId !== id);

      // Remove word count tracking
      delete mockWordsCount[id];

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete set",
      };
    }
  }

  /**
   * Add word to set
   */
  static async addWordToSet(
    request: AddWordToSetRequest,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const { setId, wordId } = request;

      // Check if set exists
      const set = mockSets.find((s) => s.id === setId);
      if (!set) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      // Check if word already in set
      const existingRelation = mockSetWords.find(
        (sw) => sw.setId === setId && sw.wordId === wordId,
      );

      if (existingRelation) {
        return {
          success: false,
          error: "Word already in set",
        };
      }

      // Add word to set
      mockSetWords.push({ setId, wordId });

      // Update word count
      mockWordsCount[setId] = (mockWordsCount[setId] || 0) + 1;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to add word to set",
      };
    }
  }

  /**
   * Remove word from set
   */
  static async removeWordFromSet(
    request: RemoveWordFromSetRequest,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const { setId, wordId } = request;

      // Find and remove the relation
      const relationIndex = mockSetWords.findIndex(
        (sw) => sw.setId === setId && sw.wordId === wordId,
      );

      if (relationIndex === -1) {
        return {
          success: false,
          error: "Word not found in set",
        };
      }

      mockSetWords.splice(relationIndex, 1);

      // Update word count
      mockWordsCount[setId] = Math.max(0, (mockWordsCount[setId] || 0) - 1);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to remove word from set",
      };
    }
  }

  /**
   * Get set statistics
   */
  static async getSetStatistics(id: number): Promise<{
    success: boolean;
    data?: {
      wordCount: number;
      lastStudied?: string;
      averageProgress: number;
    };
    error?: string;
  }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const set = mockSets.find((s) => s.id === id);

      if (!set) {
        return {
          success: false,
          error: "Set not found",
        };
      }

      // Get word count
      const wordCount = mockWordsCount[id] || 0;

      const data: {
        wordCount: number;
        lastStudied?: string;
        averageProgress: number;
      } = {
        wordCount,
        averageProgress: wordCount > 0 ? Math.floor(Math.random() * 100) : 0,
      };
      if (set.lastReviewDate !== null && set.lastReviewDate !== undefined) {
        data.lastStudied = set.lastReviewDate;
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get set statistics",
      };
    }
  }

  /**
   * Get word count for set
   */
  static getWordCount(setId: number): number {
    return mockWordsCount[setId] || 0;
  }

  /**
   * Update word count for set
   */
  static updateWordCount(setId: number, newCount: number): void {
    mockWordsCount[setId] = Math.max(0, newCount);
  }

  /**
   * Search sets by title
   */
  static async search(query: string): Promise<SetsListResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const searchQuery = query.toLowerCase().trim();
      const filteredSets = mockSets.filter((set) =>
        set.title.toLowerCase().includes(searchQuery) ||
        (set.description && set.description.toLowerCase().includes(searchQuery)),
      );

      return {
        success: true,
        data: filteredSets.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to search sets",
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateSetRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.title || typeof request.title !== "string") {
      return {
        isValid: false,
        error: "Title is required",
      };
    }

    const title = request.title.trim();

    if (title.length < 1) {
      return {
        isValid: false,
        error: "Title cannot be empty",
      };
    }

    if (title.length > 100) {
      return {
        isValid: false,
        error: "Title must be less than 100 characters",
      };
    }

    if (request.description && request.description.length > 500) {
      return {
        isValid: false,
        error: "Description must be less than 500 characters",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateSetRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (request.title !== undefined) {
      if (typeof request.title !== "string") {
        return {
          isValid: false,
          error: "Title must be a string",
        };
      }

      const title = request.title.trim();

      if (title.length < 1) {
        return {
          isValid: false,
          error: "Title cannot be empty",
        };
      }

      if (title.length > 100) {
        return {
          isValid: false,
          error: "Title must be less than 100 characters",
        };
      }
    }

    if (request.description !== undefined) {
      if (typeof request.description !== "string") {
        return {
          isValid: false,
          error: "Description must be a string",
        };
      }

      if (request.description.length > 500) {
        return {
          isValid: false,
          error: "Description must be less than 500 characters",
        };
      }
    }

    return { isValid: true };
  }
}