import { Dictionary } from "../data/DataModels";
import { Utils } from "../data/DataUtils";

// Mock database simulation - replace with actual SQLite operations
let mockDictionaries: Dictionary[] = [
  {
    id: 1,
    guid: "dict-001",
    title: "Oxford Dictionary",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    guid: "dict-002",
    title: "Cambridge Dictionary",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

// Mock words storage - словники без слів
const mockWordsCount: Record<number, number> = {
  1: 125,
  2: 89,
  // Нові словники автоматично матимуть 0 слів
};

let nextId = 3;

export interface CreateDictionaryRequest {
  title: string;
}

export interface UpdateDictionaryRequest {
  title?: string;
}

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

/**
 * Service for managing dictionary CRUD operations
 * Single Responsibility: Handle all dictionary data operations
 * Open/Closed: Can be extended with additional dictionary operations
 * Dependency Inversion: Abstracts database operations
 */
export class DictionaryService {
  /**
   * Get all dictionaries
   */
  static async getAll(): Promise<DictionariesListResponse> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        data: [...mockDictionaries].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
      };
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dictionary = mockDictionaries.find((d) => d.id === id);

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
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch dictionary",
      };
    }
  }

  /**
   * Create new dictionary
   */
  static async create(
    request: CreateDictionaryRequest,
  ): Promise<DictionaryResponse> {
    try {
      // Validate input
      const validation = this.validateCreateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check for duplicate titles
      const existingDictionary = mockDictionaries.find(
        (d) => d.title.toLowerCase() === request.title.toLowerCase(),
      );

      if (existingDictionary) {
        return {
          success: false,
          error: "A dictionary with this title already exists",
        };
      }

      // Create new dictionary
      const now = new Date().toISOString();
      const newId = nextId++;
      const newDictionary: Dictionary = {
        id: newId,
        guid: `dict-${Date.now()}`,
        title: request.title.trim(),
        createdAt: now,
        updatedAt: now,
      };

      // Add to mock storage
      mockDictionaries.push(newDictionary);
      // Ініціалізуємо лічильник слів для нового словника
      mockWordsCount[newId] = 0;

      return {
        success: true,
        data: newDictionary,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create dictionary",
      };
    }
  }

  /**
   * Update existing dictionary
   */
  static async update(
    id: number,
    request: UpdateDictionaryRequest,
  ): Promise<DictionaryResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const dictionaryIndex = mockDictionaries.findIndex((d) => d.id === id);

      if (dictionaryIndex === -1) {
        return {
          success: false,
          error: "Dictionary not found",
        };
      }

      // Check for duplicate titles (excluding current dictionary)
      if (request.title) {
        const existingDictionary = mockDictionaries.find(
          (d) =>
            d.id !== id &&
            d.title.toLowerCase() === request.title?.toLowerCase(),
        );

        if (existingDictionary) {
          return {
            success: false,
            error: "A dictionary with this title already exists",
          };
        }
      }

      // Update dictionary
      const updatedDictionary: Dictionary = {
        ...mockDictionaries[dictionaryIndex],
        ...(request.title && { title: request.title.trim() }),
        updatedAt: new Date().toISOString(),
      };

      mockDictionaries[dictionaryIndex] = updatedDictionary;

      return {
        success: true,
        data: updatedDictionary,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update dictionary",
      };
    }
  }

  /**
   * Delete dictionary
   */
  static async delete(
    id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dictionaryIndex = mockDictionaries.findIndex((d) => d.id === id);

      if (dictionaryIndex === -1) {
        return {
          success: false,
          error: "Dictionary not found",
        };
      }

      // Remove dictionary and its word count
      mockDictionaries.splice(dictionaryIndex, 1);
      delete mockWordsCount[id];

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete dictionary",
      };
    }
  }

  /**
   * Get dictionary statistics
   */
  static async getStatistics(id: number): Promise<{
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

      const dictionary = mockDictionaries.find((d) => d.id === id);

      if (!dictionary) {
        return {
          success: false,
          error: "Dictionary not found",
        };
      }

      // Отримуємо кількість слів (0 для нових словників)
      const wordCount = mockWordsCount[id] || 0;

      return {
        success: true,
        data: {
          wordCount,
          lastStudied: dictionary.updatedAt ?? undefined,
          averageProgress: wordCount > 0 ? Math.floor(Math.random() * 100) : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get dictionary statistics",
      };
    }
  }

  /**
   * Get word count for dictionary
   */
  static getWordCount(dictionaryId: number): number {
    return mockWordsCount[dictionaryId] || 0;
  }

  /**
   * Update word count for dictionary (for when words are added/removed)
   */
  static updateWordCount(dictionaryId: number, newCount: number): void {
    mockWordsCount[dictionaryId] = Math.max(0, newCount);
  }

  /**
   * Search dictionaries by title
   */
  static async search(query: string): Promise<DictionariesListResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const searchQuery = query.toLowerCase().trim();
      const filteredDictionaries = mockDictionaries.filter((dictionary) =>
        dictionary.title.toLowerCase().includes(searchQuery),
      );

      return {
        success: true,
        data: filteredDictionaries.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to search dictionaries",
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateDictionaryRequest): {
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

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateDictionaryRequest): {
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

    return { isValid: true };
  }

  /**
   * Export data for backup
   */
  static async exportData(): Promise<{
    success: boolean;
    data?: Dictionary[];
    error?: string;
  }> {
    try {
      return {
        success: true,
        data: [...mockDictionaries],
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to export data",
      };
    }
  }

  /**
   * Import data from backup
   */
  static async importData(dictionaries: Dictionary[]): Promise<{
    success: boolean;
    imported: number;
    error?: string;
  }> {
    try {
      let imported = 0;

      for (const dictionary of dictionaries) {
        // Check if dictionary already exists
        const exists = mockDictionaries.find((d) => d.guid === dictionary.guid);

        if (!exists) {
          const newDict = {
            ...dictionary,
            id: nextId++,
          };
          mockDictionaries.push(newDict);
          mockWordsCount[newDict.id] = 0; // Initialize word count
          imported++;
        }
      }

      return {
        success: true,
        imported,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        error: "Failed to import data",
      };
    }
  }
}
export default DictionaryService;