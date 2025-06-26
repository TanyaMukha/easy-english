// services/WordService.ts
import { 
  Word, 
  WordWithExamples, 
  Example, 
  Tag, 
  Dictionary,
  PartOfSpeech, 
  Level, 
  LanguageCode, 
  WordFilters 
} from "../data/DataModels";
import { Utils } from "../data/DataUtils";

// Mock database simulation - replace with actual SQLite operations
let mockWords: Word[] = [
  {
    id: 1,
    guid: "word-001",
    word: "book",
    transcription: "bʊk",
    translation: "бронювати, книга",
    explanation: "Can be used as both noun (книга) and verb (бронювати)",
    definition: "A written or printed work consisting of pages",
    partOfSpeech: PartOfSpeech.VERB,
    language: LanguageCode.EN_GB,
    level: Level.A1,
    isIrregular: false,
    dictionaryId: 1,
    lastReviewDate: "2024-01-15T10:30:00Z",
    reviewCount: 5,
    rate: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    guid: "word-002",
    word: "cat",
    transcription: "kæt",
    translation: "кішка",
    explanation: "A small domesticated carnivorous mammal",
    definition: "A small pet animal with soft fur, four legs, and a tail",
    partOfSpeech: PartOfSpeech.NOUN,
    language: LanguageCode.EN_GB,
    level: Level.A1,
    isIrregular: false,
    dictionaryId: 1,
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 3,
    guid: "word-003",
    word: "run",
    transcription: "rʌn",
    translation: "бігати",
    explanation: "To move quickly on foot",
    definition: "To move at a speed faster than walking",
    partOfSpeech: PartOfSpeech.VERB,
    language: LanguageCode.EN_GB,
    level: Level.A1,
    isIrregular: true,
    dictionaryId: 1,
    lastReviewDate: "2024-01-10T14:20:00Z",
    reviewCount: 8,
    rate: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
  },
];

let mockExamples: Example[] = [
  {
    id: 1,
    guid: "example-001",
    sentence: "I need to **book** a flight to London.",
    translation: "Мені потрібно забронювати рейс до Лондона.",
    wordId: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 2,
    guid: "example-002",
    sentence: "The **cat** is sleeping on the sofa.",
    translation: "Кішка спить на дивані.",
    wordId: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 3,
    guid: "example-003",
    sentence: "She **runs** every morning in the park.",
    translation: "Вона бігає кожного ранку в парку.",
    wordId: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

let mockTags: Tag[] = [
  {
    id: 1,
    guid: "tag-001",
    title: "Animals",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 2,
    guid: "tag-002",
    title: "Actions",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 3,
    guid: "tag-003",
    title: "Travel",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

let mockDictionaries: Dictionary[] = [
  {
    id: 1,
    guid: "dict-001",
    title: "General Dictionary",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Mock word-tag relationships
let mockWordTags: { wordId: number; tagId: number }[] = [
  { wordId: 1, tagId: 3 }, // book - travel
  { wordId: 2, tagId: 1 }, // cat - animals
  { wordId: 3, tagId: 2 }, // run - actions
];

let nextWordId = 4;
let nextExampleId = 4;

export interface CreateWordRequest {
  word: string;
  transcription?: string | undefined;
  translation?: string | undefined;
  explanation?: string | undefined;
  definition?: string | undefined;
  partOfSpeech: PartOfSpeech;
  language: LanguageCode;
  level: Level;
  isIrregular?: boolean | undefined;
  dictionaryId: number;
  examples?: Omit<Example, 'id' | 'guid' | 'wordId' | 'createdAt' | 'updatedAt'>[] | undefined;
  tagIds?: number[] | undefined;
}

export interface UpdateWordRequest {
  word?: string | undefined;
  transcription?: string | undefined;
  translation?: string | undefined;
  explanation?: string | undefined;
  definition?: string | undefined;
  partOfSpeech?: PartOfSpeech | undefined;
  language?: LanguageCode | undefined;
  level?: Level | undefined;
  isIrregular?: boolean | undefined;
  examples?: Omit<Example, 'id' | 'guid' | 'wordId' | 'createdAt' | 'updatedAt'>[] | undefined;
  tagIds?: number[] | undefined;
}

export interface WordResponse {
  success: boolean;
  data?: WordWithExamples;
  error?: string;
}

export interface WordListResponse {
  success: boolean;
  data?: {
    words: WordWithExamples[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

/**
 * Service for managing word CRUD operations
 * Single Responsibility: Handle all word data operations
 * Open/Closed: Can be extended with additional word operations
 * Dependency Inversion: Abstracts database operations
 */
export class WordService {
  /**
   * Get all words with optional filters and pagination
   */
  static async getWords(
    filters: WordFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<WordListResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));

      let filteredWords = [...mockWords];

      // Apply filters
      if (filters.dictionaryId) {
        filteredWords = filteredWords.filter(w => w.dictionaryId === filters.dictionaryId);
      }

      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        filteredWords = filteredWords.filter(w =>
          w.word.toLowerCase().includes(searchQuery) ||
          w.translation?.toLowerCase().includes(searchQuery) ||
          w.definition?.toLowerCase().includes(searchQuery)
        );
      }

      if (filters.partOfSpeech && filters.partOfSpeech.length > 0) {
        filteredWords = filteredWords.filter(w => filters.partOfSpeech!.includes(w.partOfSpeech));
      }

      if (filters.level && filters.level.length > 0) {
        filteredWords = filteredWords.filter(w => filters.level!.includes(w.level));
      }

      if (filters.language) {
        filteredWords = filteredWords.filter(w => w.language === filters.language);
      }

      if (filters.isIrregular !== undefined) {
        filteredWords = filteredWords.filter(w => w.isIrregular === filters.isIrregular);
      }

      if (filters.tagIds && filters.tagIds.length > 0) {
        filteredWords = filteredWords.filter(w =>
          mockWordTags.some(wt => 
            wt.wordId === w.id && filters.tagIds!.includes(wt.tagId)
          )
        );
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'word';
      const sortOrder = filters.sortOrder || 'asc';

      filteredWords.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
          case 'reviewCount':
            aValue = a.reviewCount || 0;
            bValue = b.reviewCount || 0;
            break;
          case 'rate':
            aValue = a.rate || 0;
            bValue = b.rate || 0;
            break;
          default: // word
            aValue = a.word.toLowerCase();
            bValue = b.word.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const total = filteredWords.length;
      const offset = (page - 1) * limit;
      const paginatedWords = filteredWords.slice(offset, offset + limit);

      // Populate with examples and tags
      const wordsWithExamples: WordWithExamples[] = paginatedWords.map(word => ({
        ...word,
        examples: mockExamples.filter(ex => ex.wordId === word.id),
        tags: mockWordTags
          .filter(wt => wt.wordId === word.id)
          .map(wt => mockTags.find(tag => tag.id === wt.tagId)!)
          .filter(Boolean),
        dictionary: mockDictionaries.find(dict => dict.id === word.dictionaryId)!,
        nextReviewDate: undefined,
      }));

      return {
        success: true,
        data: {
          words: wordsWithExamples,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch words',
      };
    }
  }

  /**
   * Get word by ID
   */
  static async getById(id: number): Promise<WordResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const word = mockWords.find(w => w.id === id);

      if (!word) {
        return {
          success: false,
          error: 'Word not found',
        };
      }

      const wordWithExamples: WordWithExamples = {
        ...word,
        examples: mockExamples.filter(ex => ex.wordId === word.id),
        tags: mockWordTags
          .filter(wt => wt.wordId === word.id)
          .map(wt => mockTags.find(tag => tag.id === wt.tagId)!)
          .filter(Boolean),
        dictionary: mockDictionaries.find(dict => dict.id === word.dictionaryId)!,
        nextReviewDate: undefined
      };

      return {
        success: true,
        data: wordWithExamples,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch word',
      };
    }
  }

  /**
   * Create new word
   */
  static async create(request: CreateWordRequest): Promise<WordResponse> {
    try {
      // Validate input
      const validation = this.validateCreateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error ?? "Invalid request",
        };
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Check for duplicate words in the same dictionary
      const existingWord = mockWords.find(w =>
        w.word.toLowerCase() === request.word.toLowerCase() &&
        w.dictionaryId === request.dictionaryId &&
        w.partOfSpeech === request.partOfSpeech
      );

      if (existingWord) {
        return {
          success: false,
          error: 'A word with this spelling and part of speech already exists in this dictionary',
        };
      }

      // Create new word
      const now = new Date().toISOString();
      const newWordId = nextWordId++;
      const newWord: Word = {
        id: newWordId,
        guid: `word-${Date.now()}`,
        word: request.word.trim(),
        transcription: request.transcription?.trim() || undefined,
        translation: request.translation?.trim() || undefined,
        explanation: request.explanation?.trim() || undefined,
        definition: request.definition?.trim() || undefined,
        partOfSpeech: request.partOfSpeech,
        language: request.language,
        level: request.level,
        isIrregular: request.isIrregular || false,
        dictionaryId: request.dictionaryId,
        lastReviewDate: null,
        reviewCount: 0,
        rate: 0,
        createdAt: now,
        updatedAt: now,
      };

      // Add to mock storage
      mockWords.push(newWord);

      // Add examples if provided
      if (request.examples && request.examples.length > 0) {
        const newExamples = request.examples.map(ex => ({
          id: nextExampleId++,
          guid: `example-${Date.now()}-${Math.random()}`,
          sentence: ex.sentence,
          translation: ex.translation ?? "",
          wordId: newWordId,
          createdAt: now,
          updatedAt: now,
        }));
        mockExamples.push(...newExamples);
      }

      // Add tag associations if provided
      if (request.tagIds && request.tagIds.length > 0) {
        const newWordTags = request.tagIds.map(tagId => ({
          wordId: newWordId,
          tagId,
        }));
        mockWordTags.push(...newWordTags);
      }

      return this.getById(newWordId);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create word',
      };
    }
  }

  /**
   * Update existing word
   */
  static async update(id: number, request: UpdateWordRequest): Promise<WordResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error ?? "Invalid request",
        };
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      const wordIndex = mockWords.findIndex(w => w.id === id);

      if (wordIndex === -1) {
        return {
          success: false,
          error: 'Word not found',
        };
      }

      const existingWord = mockWords[wordIndex];

      if (!existingWord) {
        return {
          success: false,
          error: 'Word not found',
        };
      }

      // Check for duplicate words if word or part of speech is being changed
      if (request.word || request.partOfSpeech) {
        const newWord = request.word?.toLowerCase() || existingWord.word.toLowerCase();
        const newPartOfSpeech = request.partOfSpeech || existingWord.partOfSpeech;

        const duplicateWord = mockWords.find(w =>
          w.id !== id &&
          w.word.toLowerCase() === newWord &&
          w.dictionaryId === existingWord.dictionaryId &&
          w.partOfSpeech === newPartOfSpeech
        );

        if (duplicateWord) {
          return {
            success: false,
            error: 'A word with this spelling and part of speech already exists in this dictionary',
          };
        }
      }

      // Update word
      const updatedWord: Word = {
        ...existingWord,
        word: request.word !== undefined ? request.word.trim() : existingWord.word,
        ...(request.transcription !== undefined && { transcription: request.transcription?.trim() || undefined }),
        ...(request.translation !== undefined && { translation: request.translation?.trim() || undefined }),
        ...(request.explanation !== undefined && { explanation: request.explanation?.trim() || undefined }),
        ...(request.definition !== undefined && { definition: request.definition?.trim() || undefined }),
        ...(request.partOfSpeech && { partOfSpeech: request.partOfSpeech }),
        ...(request.language && { language: request.language }),
        ...(request.level && { level: request.level }),
        ...(request.isIrregular !== undefined && { isIrregular: request.isIrregular }),
        updatedAt: new Date().toISOString(),
      };

      mockWords[wordIndex] = updatedWord;

      // Update examples if provided
      if (request.examples !== undefined) {
        // Remove existing examples
        mockExamples = mockExamples.filter(ex => ex.wordId !== id);

        // Add new examples
        if (request.examples.length > 0) {
          const now = new Date().toISOString();
          const newExamples = request.examples.map(ex => ({
            id: nextExampleId++,
            guid: `example-${Date.now()}-${Math.random()}`,
            sentence: ex.sentence,
            translation: ex.translation ?? "",
            wordId: id,
            createdAt: now,
            updatedAt: now,
          }));
          mockExamples.push(...newExamples);
        }
      }

      // Update tag associations if provided
      if (request.tagIds !== undefined) {
        // Remove existing tag associations
        mockWordTags = mockWordTags.filter(wt => wt.wordId !== id);

        // Add new tag associations
        if (request.tagIds.length > 0) {
          const newWordTags = request.tagIds.map(tagId => ({
            wordId: id,
            tagId,
          }));
          mockWordTags.push(...newWordTags);
        }
      }

      return this.getById(id);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update word',
      };
    }
  }

  /**
   * Delete word
   */
  static async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const wordIndex = mockWords.findIndex(w => w.id === id);

      if (wordIndex === -1) {
        return {
          success: false,
          error: 'Word not found',
        };
      }

      // Remove word
      mockWords.splice(wordIndex, 1);

      // Remove related examples
      mockExamples = mockExamples.filter(ex => ex.wordId !== id);

      // Remove tag associations
      mockWordTags = mockWordTags.filter(wt => wt.wordId !== id);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete word',
      };
    }
  }

  /**
   * Search words
   */
  static async search(query: string, dictionaryId?: number): Promise<WordListResponse> {
    return this.getWords({
      search: query,
      dictionaryId,
    });
  }

  /**
   * Update word progress (after review/test)
   */
  static async updateProgress(
    id: number,
    correct: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const wordIndex = mockWords.findIndex(w => w.id === id);

      if (wordIndex === -1) {
        return {
          success: false,
          error: 'Word not found',
        };
      }

      const word = mockWords[wordIndex];
      if (!word) {
        return {
          success: false,
          error: 'Word not found',
        };
      }
      const newReviewCount = (word.reviewCount || 0) + 1;
      const currentRate = word.rate || 0;

      let newRate = currentRate;
      if (correct) {
        newRate = Math.min(currentRate + 1, 5);
      } else {
        newRate = Math.max(currentRate - 1, 0);
      }

      mockWords[wordIndex] = {
        ...word,
        lastReviewDate: new Date().toISOString(),
        reviewCount: newReviewCount,
        rate: newRate,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update word progress',
      };
    }
  }

  /**
   * Get random words for practice
   */
  static async getRandomWords(
    count: number = 10,
    dictionaryId?: number,
    filters?: Partial<WordFilters>
  ): Promise<WordListResponse> {
    try {
      const response = await this.getWords({
        ...filters,
        dictionaryId,
      }, 1, 1000); // Get all matching words

      if (!response.success || !response.data) {
        return response;
      }

      // Shuffle and take requested count
      const shuffledWords = Utils.RandomUtils.shuffle(response.data.words);
      const randomWords = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

      return {
        success: true,
        data: {
          words: randomWords,
          total: randomWords.length,
          page: 1,
          limit: count,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get random words',
      };
    }
  }

  /**
   * Get word statistics
   */
  static async getStatistics(dictionaryId?: number): Promise<{
    success: boolean;
    data?: {
      totalWords: number;
      reviewedWords: number;
      averageRate: number;
      levelDistribution: Record<Level, number>;
      partOfSpeechDistribution: Record<PartOfSpeech, number>;
    };
    error?: string;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      let words = mockWords;
      if (dictionaryId) {
        words = words.filter(w => w.dictionaryId === dictionaryId);
      }

      const totalWords = words.length;
      const reviewedWords = words.filter(w => w.reviewCount > 0).length;
      const averageRate = words.reduce((sum, w) => sum + (w.rate || 0), 0) / totalWords;

      const levelDistribution: Record<Level, number> = {
        [Level.A1]: 0,
        [Level.A2]: 0,
        [Level.B1]: 0,
        [Level.B2]: 0,
        [Level.C1]: 0,
        [Level.C2]: 0,
      };

      const partOfSpeechDistribution: Record<PartOfSpeech, number> = Object.keys(PartOfSpeech).reduce(
        (acc, key) => ({ ...acc, [PartOfSpeech[key as keyof typeof PartOfSpeech]]: 0 }),
        {} as Record<PartOfSpeech, number>
      );

      words.forEach(word => {
        levelDistribution[word.level]++;
        partOfSpeechDistribution[word.partOfSpeech]++;
      });

      return {
        success: true,
        data: {
          totalWords,
          reviewedWords,
          averageRate: Math.round(averageRate * 100) / 100,
          levelDistribution,
          partOfSpeechDistribution,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get statistics',
      };
    }
  }

  /**
   * Validate create request
   */
  private static validateCreateRequest(request: CreateWordRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.word || typeof request.word !== 'string') {
      return { isValid: false, error: 'Word is required' };
    }

    if (request.word.trim().length < 1) {
      return { isValid: false, error: 'Word cannot be empty' };
    }

    if (request.word.trim().length > 100) {
      return { isValid: false, error: 'Word must be less than 100 characters' };
    }

    if (!Object.values(PartOfSpeech).includes(request.partOfSpeech)) {
      return { isValid: false, error: 'Invalid part of speech' };
    }

    if (!Object.values(LanguageCode).includes(request.language)) {
      return { isValid: false, error: 'Invalid language' };
    }

    if (!Object.values(Level).includes(request.level)) {
      return { isValid: false, error: 'Invalid level' };
    }

    if (!request.dictionaryId || request.dictionaryId <= 0) {
      return { isValid: false, error: 'Valid dictionary ID is required' };
    }

    return { isValid: true };
  }

  /**
   * Validate update request
   */
  private static validateUpdateRequest(request: UpdateWordRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (request.word !== undefined) {
      if (typeof request.word !== 'string' || request.word.trim().length < 1) {
        return { isValid: false, error: 'Word cannot be empty' };
      }
      if (request.word.trim().length > 100) {
        return { isValid: false, error: 'Word must be less than 100 characters' };
      }
    }

    if (request.partOfSpeech !== undefined && !Object.values(PartOfSpeech).includes(request.partOfSpeech)) {
      return { isValid: false, error: 'Invalid part of speech' };
    }

    if (request.language !== undefined && !Object.values(LanguageCode).includes(request.language)) {
      return { isValid: false, error: 'Invalid language' };
    }

    if (request.level !== undefined && !Object.values(Level).includes(request.level)) {
      return { isValid: false, error: 'Invalid level' };
    }

    return { isValid: true };
  }

  /**
   * Export words data for backup
   */
  static async exportWords(dictionaryId?: number): Promise<{
    success: boolean;
    data?: WordWithExamples[];
    error?: string;
  }> {
    try {
      const response = await this.getWords({ dictionaryId }, 1, 1000);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.words,
        };
      } else {
        return {
          success: false,
          error: response.error ?? 'Unknown error',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export words',
      };
    }
  }

  /**
   * Import words data from backup
   */
  static async importWords(words: WordWithExamples[]): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    error?: string;
  }> {
    try {
      let imported = 0;
      let skipped = 0;

      for (const wordData of words) {
        // Check if word already exists
        const exists = mockWords.find(w => 
          w.guid === wordData.guid || 
          (w.word.toLowerCase() === wordData.word.toLowerCase() && 
           w.dictionaryId === wordData.dictionaryId &&
           w.partOfSpeech === wordData.partOfSpeech)
        );

        if (!exists) {
          // Create word without examples and tags first
          const createRequest: CreateWordRequest = {
            word: wordData.word,
            transcription: wordData.transcription,
            translation: wordData.translation,
            explanation: wordData.explanation,
            definition: wordData.definition,
            partOfSpeech: wordData.partOfSpeech,
            language: wordData.language,
            level: wordData.level,
            isIrregular: wordData.isIrregular,
            dictionaryId: wordData.dictionaryId,
            examples: wordData.examples?.map(ex => ({
              sentence: ex.sentence,
              translation: ex.translation ?? "",
            })),
          };

          const response = await this.create(createRequest);
          if (response.success) {
            imported++;
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      }

      return {
        success: true,
        imported,
        skipped,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        error: 'Failed to import words',
      };
    }
  }

  /**
   * Get words that need review (based on spaced repetition)
   */
  static async getWordsForReview(limit: number = 20): Promise<WordListResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get words that haven't been reviewed recently or have low rates
      const now = new Date();
      const wordsNeedingReview = mockWords.filter(word => {
        if (word.reviewCount === 0) return true; // Never reviewed
        
        if (!word.lastReviewDate) return true;
        
        const lastReview = new Date(word.lastReviewDate);
        const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
        
        // Review interval based on rate (spaced repetition)
        const reviewInterval = Math.pow(2, word.rate || 0); // 1, 2, 4, 8, 16, 32 days
        
        return daysSinceReview >= reviewInterval;
      });

      // Sort by priority (lower rate and older reviews first)
      wordsNeedingReview.sort((a, b) => {
        const aPriority = (a.rate || 0) * 1000 + (a.reviewCount || 0);
        const bPriority = (b.rate || 0) * 1000 + (b.reviewCount || 0);
        return aPriority - bPriority;
      });

      const selectedWords = wordsNeedingReview.slice(0, limit);

      // Populate with examples and tags
      const wordsWithExamples: WordWithExamples[] = selectedWords.map(word => ({
        ...word,
        examples: mockExamples.filter(ex => ex.wordId === word.id),
        tags: mockWordTags
          .filter(wt => wt.wordId === word.id)
          .map(wt => mockTags.find(tag => tag.id === wt.tagId)!)
          .filter(Boolean),
        dictionary: mockDictionaries.find(dict => dict.id === word.dictionaryId)!,
        nextReviewDate: undefined,
      }));

      return {
        success: true,
        data: {
          words: wordsWithExamples,
          total: wordsNeedingReview.length,
          page: 1,
          limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get words for review',
      };
    }
  }
}

export default WordService;