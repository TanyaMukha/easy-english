// data/MockData.ts - Fixed version with getRandomWords method

import {
  DailyProgress,
  Dictionary,
  Example,
  LanguageCode,
  Level,
  PartOfSpeech,
  Set,
  SetWord,
  Tag,
  UserStatistics,
  Word,
  WordWithExamples,
} from "../data/DataModels";

export interface WordsQueryResponse {
  words: WordWithExamples[];
  total: number;
}

export interface WordFilters {
  dictionaryId?: number;
  search?: string;
  partOfSpeech?: PartOfSpeech[];
  level?: Level;
  language?: LanguageCode;
  isIrregular?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "word" | "createdAt" | "reviewCount" | "rate";
  sortOrder?: "asc" | "desc";
}

/**
 * MockDataService - Central service for managing mock data during development
 * Single Responsibility: Provide consistent mock data for all components
 * Open/Closed: Easy to extend with new mock data entities
 */
export class MockDataService {
  // Mock dictionaries data
  static mockDictionaries: Dictionary[] = [
    {
      id: 1,
      guid: "dict-001",
      title: "Business English",
      description: "Essential vocabulary for business communication",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      guid: "dict-002",
      title: "Travel & Tourism",
      description: "Words and phrases for travelers",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: 3,
      guid: "dict-003",
      title: "Daily Conversations",
      description: "Everyday English for casual conversations",
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
  ];

  // Mock words data
  static mockWords: Word[] = [
    {
      id: 1,
      guid: "word-001",
      word: "book",
      transcription: "/bʊk/",
      translation: "книга",
      explanation: "A written or printed work consisting of pages",
      definition:
        "A set of written, printed, or blank pages fastened together along one side and encased between protective covers",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      dictionaryId: 1,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      guid: "word-002",
      word: "travel",
      transcription: "/ˈtrævəl/",
      translation: "подорожувати",
      explanation: "To go from one place to another",
      definition:
        "Go from one place to another, typically over a distance of some length",
      partOfSpeech: PartOfSpeech.VERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      dictionaryId: 2,
      lastReviewDate: "2024-01-10T09:00:00Z",
      reviewCount: 3,
      rate: 5,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-10T09:00:00Z",
    },
    {
      id: 3,
      guid: "word-003",
      word: "meeting",
      transcription: "/ˈmiːtɪŋ/",
      translation: "зустріч, нарада",
      explanation: "A gathering of people for discussion",
      definition:
        "An assembly of people, especially the members of a society or committee, for discussion or entertainment",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.B1,
      isIrregular: false,
      dictionaryId: 1,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
    {
      id: 4,
      guid: "word-004",
      word: "beautiful",
      transcription: "/ˈbjuːtɪfʊl/",
      translation: "красивий, гарний",
      explanation: "Pleasing to the senses or mind",
      definition: "Pleasing the senses or mind aesthetically",
      partOfSpeech: PartOfSpeech.ADJECTIVE,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      dictionaryId: 3,
      lastReviewDate: "2024-01-12T16:45:00Z",
      reviewCount: 2,
      rate: 4,
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: "2024-01-12T16:45:00Z",
    },
    {
      id: 5,
      guid: "word-005",
      word: "run",
      transcription: "/rʌn/",
      translation: "бігти",
      explanation: "To move at a speed faster than a walk",
      definition:
        "Move at a speed faster than a walk, never having both or all the feet on the ground at the same time",
      partOfSpeech: PartOfSpeech.VERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: true,
      dictionaryId: 3,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-05T00:00:00Z",
    },
    {
      id: 6,
      guid: "word-006",
      word: "presentation",
      transcription: "/ˌprezənˈteɪʃən/",
      translation: "презентація",
      explanation: "The action of showing something to others",
      definition: "The action of showing or offering something to others",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.B1,
      isIrregular: false,
      dictionaryId: 1,
      lastReviewDate: "2024-01-18T11:20:00Z",
      reviewCount: 1,
      rate: 3,
      createdAt: "2024-01-06T00:00:00Z",
      updatedAt: "2024-01-18T11:20:00Z",
    },
    {
      id: 7,
      guid: "word-007",
      word: "airport",
      transcription: "/ˈeəpɔːt/",
      translation: "аеропорт",
      explanation: "A place where aircraft take off and land",
      definition:
        "A complex of runways and buildings for the takeoff, landing, and maintenance of civil aircraft",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      dictionaryId: 2,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-07T00:00:00Z",
      updatedAt: "2024-01-07T00:00:00Z",
    },
    {
      id: 8,
      guid: "word-008",
      word: "quickly",
      transcription: "/ˈkwɪkli/",
      translation: "швидко",
      explanation: "At a fast speed",
      definition: "At a fast speed; rapidly",
      partOfSpeech: PartOfSpeech.ADVERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      dictionaryId: 3,
      lastReviewDate: "2024-01-14T13:10:00Z",
      reviewCount: 4,
      rate: 5,
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: "2024-01-14T13:10:00Z",
    },
    {
      id: 9,
      guid: "word-009",
      word: "break down",
      transcription: "/breɪk daʊn/",
      translation: "зламатися, перестати працювати",
      explanation: "To stop working or functioning",
      definition: "(of a machine or motor vehicle) suddenly cease to work",
      partOfSpeech: PartOfSpeech.PHRASAL_VERB,
      language: LanguageCode.EN_GB,
      level: Level.B1,
      isIrregular: false,
      dictionaryId: 3,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-09T00:00:00Z",
      updatedAt: "2024-01-09T00:00:00Z",
    },
    {
      id: 10,
      guid: "word-010",
      word: "piece of cake",
      transcription: "/piːs əv keɪk/",
      translation: "дуже легко, як пароп'я",
      explanation: "Something very easy to do",
      definition: "A thing that is very easy to do",
      partOfSpeech: PartOfSpeech.IDIOM,
      language: LanguageCode.EN_GB,
      level: Level.C1,
      isIrregular: false,
      dictionaryId: 3,
      lastReviewDate: "2024-01-16T08:30:00Z",
      reviewCount: 2,
      rate: 4,
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-16T08:30:00Z",
    },
  ];

  // Mock examples data
  static mockExamples: Example[] = [
    {
      id: 1,
      guid: "example-001",
      sentence: "I love reading a good **book** before bed.",
      translation: "Я люблю читати хорошу книгу перед сном.",
      wordId: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 2,
      guid: "example-002",
      sentence: "We plan to **travel** to Europe this summer.",
      translation: "Ми плануємо подорожувати до Європи цього літа.",
      wordId: 2,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 3,
      guid: "example-003",
      sentence: "The **meeting** starts at 3 PM.",
      translation: "Нарада починається о 15:00.",
      wordId: 3,
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 4,
      guid: "example-004",
      sentence: "The sunset was absolutely **beautiful**.",
      translation: "Захід сонця був абсолютно гарним.",
      wordId: 4,
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 5,
      guid: "example-005",
      sentence: "I like to **run** in the park every morning.",
      translation: "Я люблю бігати в парку щоранку.",
      wordId: 5,
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 6,
      guid: "example-006",
      sentence: "Her **presentation** was very informative.",
      translation: "Її презентація була дуже інформативною.",
      wordId: 6,
      createdAt: "2024-01-06T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 7,
      guid: "example-007",
      sentence: "We arrived at the **airport** two hours early.",
      translation: "Ми прибули в аеропорт на два години раніше.",
      wordId: 7,
      createdAt: "2024-01-07T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 8,
      guid: "example-008",
      sentence: "Please walk **quickly**, we're late!",
      translation: "Будь ласка, йди швидко, ми запізнюємося!",
      wordId: 8,
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 9,
      guid: "example-009",
      sentence: "My car **broke down** on the highway.",
      translation: "Моя машина зламалася на шосе.",
      wordId: 9,
      createdAt: "2024-01-09T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 10,
      guid: "example-010",
      sentence: "This exam will be a **piece of cake** for you.",
      translation: "Цей іспит буде для тебе дуже легким.",
      wordId: 10,
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: null,
    },
  ];

  // Mock sets data
  static mockSets: Set[] = [
    {
      id: 1,
      guid: "set-001",
      title: "Business Essentials",
      description: "Essential vocabulary for business communication",
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      guid: "set-002",
      title: "Travel Kit",
      description: "Must-know words for travelers",
      lastReviewDate: "2024-01-15T14:30:00Z",
      reviewCount: 3,
      rate: 4,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: 3,
      guid: "set-003",
      title: "Daily Basics",
      description: "Everyday conversation starters",
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
    {
      id: 4,
      guid: "set-004",
      title: "Phrasal Verbs Collection",
      description: "Common phrasal verbs and idioms",
      lastReviewDate: "2024-01-20T10:15:00Z",
      reviewCount: 2,
      rate: 5,
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: "2024-01-20T10:15:00Z",
    },
  ];

  // Mock set-word relationships
  static mockSetWords: SetWord[] = [
    { setId: 1, wordId: 1 }, // Business Essentials: book
    { setId: 1, wordId: 3 }, // Business Essentials: meeting
    { setId: 1, wordId: 6 }, // Business Essentials: presentation
    { setId: 2, wordId: 2 }, // Travel Kit: travel
    { setId: 2, wordId: 4 }, // Travel Kit: beautiful
    { setId: 2, wordId: 7 }, // Travel Kit: airport
    { setId: 3, wordId: 4 }, // Daily Basics: beautiful
    { setId: 3, wordId: 5 }, // Daily Basics: run
    { setId: 3, wordId: 8 }, // Daily Basics: quickly
    { setId: 4, wordId: 9 }, // Phrasal Verbs: break down
    { setId: 4, wordId: 10 }, // Phrasal Verbs: piece of cake
  ];

  // Mock tags data
  static mockTags: Tag[] = [
    {
      id: 1,
      guid: "tag-001",
      title: "Work",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 2,
      guid: "tag-002",
      title: "Vacation",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 3,
      guid: "tag-003",
      title: "Sport",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 4,
      guid: "tag-004",
      title: "Academic",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 5,
      guid: "tag-005",
      title: "Informal",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
  ];

  /**
   * Simulate API delay to mimic real network requests
   */
  static async delay(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get all dictionaries with pagination support
   */
  static async getDictionaries(
    limit?: number,
    offset: number = 0,
  ): Promise<Dictionary[]> {
    await this.delay(150);

    const startIndex = offset;
    const endIndex = limit ? startIndex + limit : undefined;

    return this.mockDictionaries
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(startIndex, endIndex);
  }

  /**
   * Get dictionary by ID
   */
  static async getDictionary(id: number): Promise<Dictionary | null> {
    await this.delay(100);
    return this.mockDictionaries.find((d) => d.id === id) || null;
  }

  /**
   * Get words with filtering and pagination
   */
  static async getWords(
    filters: WordFilters = {},
  ): Promise<WordsQueryResponse> {
    await this.delay(200);

    let filteredWords = [...this.mockWords];

    // Apply filters
    if (filters.dictionaryId) {
      filteredWords = filteredWords.filter(
        (w) => w.dictionaryId === filters.dictionaryId,
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredWords = filteredWords.filter(
        (w) =>
          w.word.toLowerCase().includes(searchLower) ||
          w.translation?.toLowerCase().includes(searchLower) ||
          w.explanation?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.partOfSpeech && filters.partOfSpeech.length > 0) {
      filteredWords = filteredWords.filter((w) =>
        filters.partOfSpeech!.includes(w.partOfSpeech),
      );
    }

    if (filters.level) {
      filteredWords = filteredWords.filter((w) => w.level === filters.level);
    }

    if (filters.isIrregular !== undefined) {
      filteredWords = filteredWords.filter(
        (w) => w.isIrregular === filters.isIrregular,
      );
    }

    // Apply sorting
    filteredWords.sort((a, b) => {
      switch (filters.sortBy) {
        case "word":
          return filters.sortOrder === "desc"
            ? b.word.localeCompare(a.word)
            : a.word.localeCompare(b.word);
        case "createdAt":
          return filters.sortOrder === "desc"
            ? new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            : new Date(a.createdAt || 0).getTime() -
                new Date(b.createdAt || 0).getTime();
        case "reviewCount":
          return filters.sortOrder === "desc"
            ? (b.reviewCount || 0) - (a.reviewCount || 0)
            : (a.reviewCount || 0) - (b.reviewCount || 0);
        case "rate":
          return filters.sortOrder === "desc"
            ? (b.rate || 0) - (a.rate || 0)
            : (a.rate || 0) - (b.rate || 0);
        default:
          return 0;
      }
    });

    // Apply pagination
    const startIndex = filters.offset || 0;
    const endIndex = filters.limit ? startIndex + filters.limit : undefined;
    const paginatedWords = filteredWords.slice(startIndex, endIndex);

    // Convert to WordWithExamples format
    const wordsWithExamples: WordWithExamples[] = paginatedWords.map(
      (word) => ({
        ...word,
        examples: this.mockExamples.filter((ex) => ex.wordId === word.id),
        tags: [], // TODO: Implement tags relationship if needed
        dictionary: this.mockDictionaries.find(
          (d) => d.id === word.dictionaryId,
        )!,
        nextReviewDate: null, // TODO: Calculate based on spaced repetition algorithm
      }),
    );

    return {
      words: wordsWithExamples,
      total: filteredWords.length,
    };
  }

  /**
   * Get random words for practice
   * This method was missing and causing the error in useHomeData hook
   */
  static async getRandomWords(
    count: number = 10,
    filters?: Partial<WordFilters>,
  ): Promise<WordWithExamples[]> {
    await this.delay(150);

    let availableWords = [...this.mockWords];

    // Apply filters if provided
    if (filters?.dictionaryId) {
      availableWords = availableWords.filter(
        (w) => w.dictionaryId === filters.dictionaryId,
      );
    }

    if (filters?.level) {
      availableWords = availableWords.filter((w) => w.level === filters.level);
    }

    if (filters?.partOfSpeech && filters.partOfSpeech.length > 0) {
      availableWords = availableWords.filter((w) =>
        filters.partOfSpeech!.includes(w.partOfSpeech),
      );
    }

    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...availableWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j] as Word, shuffled[i] as Word];
    }

    // Take the requested number of words
    const randomWords = shuffled.slice(0, count);

    // Convert to WordWithExamples format
    return randomWords.map((word) => ({
      ...word,
      examples: this.mockExamples.filter((ex) => ex.wordId === word.id),
      tags: [], // TODO: Implement tags relationship if needed
      dictionary: this.mockDictionaries.find(
        (d) => d.id === word.dictionaryId,
      )!,
      nextReviewDate: null, // TODO: Calculate based on spaced repetition algorithm
    }));
  }

  /**
   * Get word by ID with examples
   */
  static async getWord(id: number): Promise<WordWithExamples | null> {
    await this.delay(100);

    const word = this.mockWords.find((w) => w.id === id);
    if (!word) return null;

    return {
      ...word,
      examples: this.mockExamples.filter((ex) => ex.wordId === word.id),
      tags: [], // TODO: Implement tags relationship if needed
      dictionary: this.mockDictionaries.find(
        (d) => d.id === word.dictionaryId,
      )!,
      nextReviewDate: null, // TODO: Calculate based on spaced repetition algorithm
    };
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    await this.delay(100);

    // Generate mock daily progress for the last 30 days
    const dailyProgress: DailyProgress[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      dailyProgress.push({
        date: date.toISOString().split("T")[0],
        wordsStudied: Math.floor(Math.random() * 20) + 5, // 5-25 words per day
        timeSpent: Math.floor(Math.random() * 45) + 15, // 15-60 minutes per day
        accuracy: Math.random() * 0.3 + 0.7, // 70-100% accuracy
      } as DailyProgress);
    }

    return {
      totalWords: this.mockWords.length,
      wordsLearned: Math.floor(this.mockWords.length * 0.8), // 80% studied
      currentStreak: 7,
      longestStreak: 21,
      totalTimeSpent: dailyProgress.reduce(
        (sum, day) => sum + day.timeSpent,
        0,
      ),
      averageAccuracy:
        dailyProgress.reduce((sum, day) => sum + day.accuracy, 0) /
        dailyProgress.length,
      dailyProgress,
      //   recentlyStudied: this.mockWords.slice(0, 5).map(word => ({
      //     ...word,
      //     examples: this.mockExamples.filter(ex => ex.wordId === word.id),
      //     tags: [],
      //     dictionary: this.mockDictionaries.find(d => d.id === word.dictionaryId)!,
      //     nextReviewDate: null,
      //   })),
    };
  }

  /**
   * Get all sets
   */
  static async getSets(): Promise<Set[]> {
    await this.delay(100);
    return [...this.mockSets];
  }

  /**
   * Get set by ID
   */
  static async getSet(id: number): Promise<Set | null> {
    await this.delay(100);
    return this.mockSets.find((s) => s.id === id) || null;
  }

  /**
   * Get all tags
   */
  static async getTags(): Promise<Tag[]> {
    await this.delay(100);
    return [...this.mockTags];
  }

  /**
   * Generate next ID for new entities
   */
  static getNextId(
    entityType: "dictionary" | "word" | "example" | "set" | "tag",
  ): number {
    switch (entityType) {
      case "dictionary":
        return Math.max(...this.mockDictionaries.map((d) => d.id), 0) + 1;
      case "word":
        return Math.max(...this.mockWords.map((w) => w.id), 0) + 1;
      case "example":
        return Math.max(...this.mockExamples.map((e) => e.id), 0) + 1;
      case "set":
        return Math.max(...this.mockSets.map((s) => s.id), 0) + 1;
      case "tag":
        return Math.max(...this.mockTags.map((t) => t.id), 0) + 1;
      default:
        return 1;
    }
  }

  /**
   * Generate GUID for new entities
   */
  static generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Reset all mock data to initial state (useful for testing)
   */
  static resetMockData(): void {
    console.log("Mock data reset to initial state");
  }

  /**
   * Get statistics about mock data
   */
  static getStatistics() {
    return {
      dictionaries: this.mockDictionaries.length,
      words: this.mockWords.length,
      examples: this.mockExamples.length,
      sets: this.mockSets.length,
      tags: this.mockTags.length,
      setWords: this.mockSetWords.length,
    };
  }
}
