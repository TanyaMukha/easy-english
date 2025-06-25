import {
  Dictionary,
  Example,
  GrammarTest,
  GrammarTopic,
  GrammarTopicWithContent,
  LanguageCode,
  Level,
  PartOfSpeech,
  Set,
  SetWithWords,
  StudyCard,
  StudyCardType,
  StudyCardWithContent,
  StudyFlashcard,
  Tag,
  TestCard,
  TestCardType,
  TestCardWithContent,
  TestFlashcard,
  Unit,
  UnitWithContent,
  UserSettings,
  UserStatistics,
  Word,
  WordWithExamples,
} from "./DataModels";

// Mock Dictionaries
export const mockDictionaries: Dictionary[] = [
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

// Mock Tags
export const mockTags: Tag[] = [
  {
    id: 1,
    guid: "tag-001",
    title: "Business",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 2,
    guid: "tag-002",
    title: "Travel",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 3,
    guid: "tag-003",
    title: "Food",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 4,
    guid: "tag-004",
    title: "Technology",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Examples
export const mockExamples: Example[] = [
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
    sentence: "She is reading a fascinating **book** about history.",
    translation: "Вона читає захоплюючу книгу про історію.",
    wordId: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 3,
    guid: "example-003",
    sentence: "The **cat** is sleeping on the sofa.",
    translation: "Кішка спить на дивані.",
    wordId: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 4,
    guid: "example-004",
    sentence: "She **runs** every morning in the park.",
    translation: "Вона бігає кожного ранку в парку.",
    wordId: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Words
export const mockWords: Word[] = [
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
    word: "book",
    transcription: "bʊk",
    translation: "книга",
    explanation: "A physical or digital collection of written pages",
    definition: "A set of written or printed pages bound together",
    partOfSpeech: PartOfSpeech.NOUN,
    language: LanguageCode.EN_GB,
    level: Level.A1,
    isIrregular: false,
    dictionaryId: 1,
    lastReviewDate: "2024-01-14T09:15:00Z",
    reviewCount: 3,
    rate: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-14T09:15:00Z",
  },
  {
    id: 3,
    guid: "word-003",
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
    id: 4,
    guid: "word-004",
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
  {
    id: 5,
    guid: "word-005",
    word: "beautiful",
    transcription: "ˈbjuːtɪf(ə)l",
    translation: "красивий, прекрасний",
    explanation: "Having beauty; pleasing to the senses",
    definition: "Aesthetically pleasing; attractive",
    partOfSpeech: PartOfSpeech.ADJECTIVE,
    language: LanguageCode.EN_GB,
    level: Level.B1,
    isIrregular: false,
    dictionaryId: 2,
    lastReviewDate: "2024-01-12T16:45:00Z",
    reviewCount: 2,
    rate: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
];

// Mock Words with Examples (populated data)
export const mockWordsWithExamples: WordWithExamples[] = mockWords.map(
  (word) => ({
    ...word,
    examples: mockExamples.filter((example) => example.wordId === word.id),
    tags:
      word.id <= 2 ? [mockTags[0], mockTags[3]] : [mockTags[1], mockTags[2]],
    dictionary: mockDictionaries.find((dict) => dict.id === word.dictionaryId)!,
  }),
);

// Mock Sets
export const mockSets: Set[] = [
  {
    id: 1,
    guid: "set-001",
    title: "Basic Vocabulary",
    description: "Essential words for beginners",
    lastReviewDate: "2024-01-15T11:00:00Z",
    reviewCount: 3,
    rate: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: 2,
    guid: "set-002",
    title: "Business English",
    description: "Professional vocabulary for business communication",
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Sets with Words
export const mockSetsWithWords: SetWithWords[] = [
  {
    ...mockSets[0],
    words: mockWordsWithExamples.slice(0, 3),
    wordCount: 3,
  },
  {
    ...mockSets[1],
    words: mockWordsWithExamples.slice(3, 5),
    wordCount: 2,
  },
];

// Mock Units
export const mockUnits: Unit[] = [
  {
    id: 1,
    guid: "unit-001",
    title: "Getting Started",
    description: "Introduction to basic English vocabulary",
    lastReviewDate: "2024-01-14T13:30:00Z",
    reviewCount: 5,
    rate: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-14T13:30:00Z",
  },
  {
    id: 2,
    guid: "unit-002",
    title: "Daily Life",
    description: "Vocabulary for everyday situations",
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Study Cards
export const mockStudyCards: StudyCard[] = [
  {
    id: 1,
    guid: "study-card-001",
    title: "Basic Words Practice",
    description: "Practice common English words",
    dialogue: null,
    unitId: 1,
    lastReviewDate: "2024-01-15T12:00:00Z",
    reviewCount: 2,
    rate: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: 2,
    guid: "study-card-002",
    title: "Verbs and Actions",
    description: "Learn action verbs",
    dialogue: "A: What do you do every morning? B: I run in the park.",
    unitId: 1,
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Study Cards with Content
export const mockStudyCardsWithContent: StudyCardWithContent[] =
  mockStudyCards.map((card) => ({
    ...card,
    words: mockWordsWithExamples.slice(0, 2),
    unit: mockUnits[0],
  }));

// Mock Grammar Tests
export const mockGrammarTests: GrammarTest[] = [
  {
    id: 1,
    guid: "grammar-test-001",
    title: "Present Simple Test",
    description: "Test your knowledge of present simple tense",
    lastReviewDate: "2024-01-13T15:20:00Z",
    reviewCount: 1,
    rate: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T15:20:00Z",
  },
];

// Mock Test Cards
export const mockTestCards: TestCard[] = [
  {
    id: 1,
    guid: "test-card-001",
    testType: "grammar",
    title: "Present Simple - Fill the gap",
    description: "Complete the sentence with correct form",
    text: "She _____ to school every day.",
    mask: null,
    options: '["go", "goes", "going", "went"]',
    correctAnswers: '["goes"]',
    testId: 1,
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: 2,
    guid: "test-card-002",
    testType: "vocabulary",
    title: "Word Meaning",
    description: "Choose the correct translation",
    text: 'What does "beautiful" mean?',
    mask: null,
    options: '["красивий", "великий", "швидкий", "важкий"]',
    correctAnswers: '["красивий"]',
    testId: 1,
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Grammar Topics
export const mockGrammarTopics: GrammarTopic[] = [
  {
    id: 1,
    guid: "grammar-topic-001",
    title: "Present Tenses",
    description: "Learn about present tenses in English",
    content:
      "# Present Tenses\n\nPresent tenses are used to describe actions happening now...",
    language: LanguageCode.EN_GB,
    topicId: null,
    lastReviewDate: "2024-01-12T10:15:00Z",
    reviewCount: 3,
    rate: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T10:15:00Z",
  },
  {
    id: 2,
    guid: "grammar-topic-002",
    title: "Present Simple",
    description: "Present simple tense usage and forms",
    content:
      "## Present Simple\n\nThe present simple is used for habits, facts...",
    language: LanguageCode.EN_GB,
    topicId: 1,
    lastReviewDate: null,
    reviewCount: 0,
    rate: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: null,
  },
];

// Mock Study Flashcards
export const mockStudyFlashcards: StudyFlashcard[] = [
  {
    type: "study-card",
    viewAs: StudyCardType.SINGLE_WORD,
    guid: "flashcard-001",
    title: "Learn: Book",
    description: "Practice the word 'book'",
    items: [
      {
        word: "book",
        transcription: "bʊk",
        translate: "книга",
        lang: LanguageCode.EN_GB,
        examples: [
          {
            sentence: "I love reading **books**.",
            translate: "Я люблю читати книги.",
          },
        ],
      },
    ],
    progress: {
      correct: 3,
      incorrect: 1,
      attempts: 4,
      lastReviewed: "2024-01-15T10:30:00Z",
      reviewCount: 4,
      rate: 4,
    },
  },
  {
    type: "study-card",
    viewAs: StudyCardType.WORD_LIST,
    guid: "flashcard-002",
    title: "Basic Animals",
    description: "Learn names of common animals",
    items: [
      {
        label: "1.",
        word: "cat",
        transcription: "kæt",
        translate: "кішка",
        lang: LanguageCode.EN_GB,
      },
      {
        label: "2.",
        word: "dog",
        transcription: "dɒɡ",
        translate: "собака",
        lang: LanguageCode.EN_GB,
      },
      {
        label: "3.",
        word: "bird",
        transcription: "bɜːd",
        translate: "пташка",
        lang: LanguageCode.EN_GB,
      },
    ],
  },
];

// Mock Test Flashcards
export const mockTestFlashcards: TestFlashcard[] = [
  {
    type: "test-card",
    viewAs: TestCardType.SINGLE_CHOICE,
    guid: "test-flashcard-001",
    title: "Vocabulary Test",
    description: "Choose the correct translation",
    question: "What does 'beautiful' mean?",
    options: ["красивий", "великий", "швидкий", "важкий"],
    correctAnswers: ["красивий"],
    explanation: "'Beautiful' means aesthetically pleasing or attractive.",
  },
  {
    type: "test-card",
    viewAs: TestCardType.FILL_IN_THE_BLANK,
    guid: "test-flashcard-002",
    title: "Grammar Test",
    description: "Fill in the correct form",
    question: "She _____ to school every day.",
    correctAnswers: ["goes"],
    explanation: "Present simple third person singular requires 's' ending.",
  },
  {
    type: "test-card",
    viewAs: TestCardType.MATCHING,
    guid: "test-flashcard-003",
    title: "Match Words",
    description: "Match English words with their Ukrainian translations",
    question: "Match the words with their correct translations:",
    options: {
      left: [{ cat: "" }, { dog: "" }, { bird: "" }],
      right: [{ кішка: "" }, { собака: "" }, { пташка: "" }],
    },
    correctAnswers: [{ cat: "кішка" }, { dog: "собака" }, { bird: "пташка" }],
  },
];

// Mock User Statistics
export const mockUserStatistics: UserStatistics = {
  totalWords: 150,
  wordsLearned: 85,
  currentStreak: 7,
  longestStreak: 21,
  totalTimeSpent: 1240, // minutes
  averageAccuracy: 87.5,
  dailyProgress: [
    {
      date: "2024-01-15",
      wordsStudied: 12,
      testsCompleted: 5,
      timeSpent: 45,
      accuracy: 92,
    },
    {
      date: "2024-01-14",
      wordsStudied: 8,
      testsCompleted: 3,
      timeSpent: 30,
      accuracy: 85,
    },
  ],
  levelDistribution: {
    [Level.A1]: 45,
    [Level.A2]: 32,
    [Level.B1]: 18,
    [Level.B2]: 8,
    [Level.C1]: 2,
    [Level.C2]: 0,
  },
  partOfSpeechDistribution: {
    [PartOfSpeech.NOUN]: 38,
    [PartOfSpeech.VERB]: 28,
    [PartOfSpeech.ADJECTIVE]: 20,
    [PartOfSpeech.ADVERB]: 8,
    [PartOfSpeech.PREPOSITION]: 4,
    [PartOfSpeech.PHRASE]: 6,
    [PartOfSpeech.PHRASAL_VERB]: 3,
    [PartOfSpeech.IDIOM]: 2,
    [PartOfSpeech.PRONOUN]: 1,
    [PartOfSpeech.CONJUNCTION]: 1,
    [PartOfSpeech.INTERJECTION]: 0,
    [PartOfSpeech.SLANG]: 1,
    [PartOfSpeech.ABBREVIATION]: 2,
    [PartOfSpeech.FIXED_EXPRESSION]: 1,
    [PartOfSpeech.IRREGULAR]: 5,
  },
};

// Mock User Settings
export const mockUserSettings: UserSettings = {
  theme: "dark",
  language: LanguageCode.UK_UA,
  dailyGoal: 20,
  notificationsEnabled: true,
  soundEnabled: true,
  autoPlayAudio: false,
  studyReminders: {
    enabled: true,
    time: "19:00",
    days: [1, 2, 3, 4, 5], // Monday to Friday
  },
  defaultStudyMode: StudyCardType.SINGLE_WORD,
  showTranscription: true,
  showDefinition: true,
};

// Mock Functions for Data Access
export class MockDataService {
  // Dictionary operations
  static async getDictionaries(): Promise<Dictionary[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockDictionaries), 100),
    );
  }

  static async getDictionary(id: number): Promise<Dictionary | null> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(mockDictionaries.find((d) => d.id === id) || null),
        100,
      ),
    );
  }

  // Word operations
  static async getWords(params?: {
    dictionaryId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ words: WordWithExamples[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredWords = [...mockWordsWithExamples];

        if (params?.dictionaryId) {
          filteredWords = filteredWords.filter(
            (w) => w.dictionaryId === params.dictionaryId,
          );
        }

        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredWords = filteredWords.filter(
            (w) =>
              w.word.toLowerCase().includes(searchLower) ||
              w.translation?.toLowerCase().includes(searchLower),
          );
        }

        const total = filteredWords.length;
        const offset = params?.offset || 0;
        const limit = params?.limit || 20;

        const words = filteredWords.slice(offset, offset + limit);

        resolve({ words, total });
      }, 150);
    });
  }

  static async getWord(id: number): Promise<WordWithExamples | null> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(mockWordsWithExamples.find((w) => w.id === id) || null),
        100,
      ),
    );
  }

  static async getRandomWords(count: number = 10): Promise<WordWithExamples[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const shuffled = [...mockWordsWithExamples].sort(
          () => 0.5 - Math.random(),
        );
        resolve(shuffled.slice(0, count));
      }, 100);
    });
  }

  // Set operations
  static async getSets(): Promise<SetWithWords[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockSetsWithWords), 100),
    );
  }

  static async getSet(id: number): Promise<SetWithWords | null> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(mockSetsWithWords.find((s) => s.id === id) || null),
        100,
      ),
    );
  }

  // Unit operations
  static async getUnits(): Promise<Unit[]> {
    return new Promise((resolve) => setTimeout(() => resolve(mockUnits), 100));
  }

  static async getUnit(id: number): Promise<UnitWithContent | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const unit = mockUnits.find((u) => u.id === id);
        if (unit) {
          const unitWithContent: UnitWithContent = {
            ...unit,
            studyCards: mockStudyCardsWithContent,
            cardCount: mockStudyCardsWithContent.length,
          };
          resolve(unitWithContent);
        } else {
          resolve(null);
        }
      }, 100);
    });
  }

  // Study card operations
  static async getStudyCards(unitId?: number): Promise<StudyCardWithContent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let cards = mockStudyCardsWithContent;
        if (unitId) {
          cards = cards.filter((c) => c.unitId === unitId);
        }
        resolve(cards);
      }, 100);
    });
  }

  // Flashcard operations
  static async getStudyFlashcards(
    count: number = 10,
  ): Promise<StudyFlashcard[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate flashcards from words
        const flashcards: StudyFlashcard[] = mockWordsWithExamples
          .slice(0, count)
          .map((word) => ({
            type: "study-card",
            viewAs: StudyCardType.SINGLE_WORD,
            guid: `flashcard-${word.id}`,
            title: `Learn: ${word.word}`,
            description: `Practice the word '${word.word}'`,
            items: [
              {
                word: word.word,
                transcription: word.transcription,
                translate: word.translation,
                definition: word.definition,
                explanation: word.explanation,
                lang: word.language,
                examples: word.examples.map((ex) => ({
                  sentence: ex.sentence,
                  translate: ex.translation,
                })),
              },
            ],
            progress: {
              lastReviewed: word.lastReviewDate ?? undefined,
              reviewCount: word.reviewCount,
              rate: word.rate,
            },
          }));

        resolve(flashcards);
      }, 150);
    });
  }

  static async getTestFlashcards(count: number = 5): Promise<TestFlashcard[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate test flashcards from words
        const flashcards: TestFlashcard[] = mockWordsWithExamples
          .slice(0, count)
          .map((word) => {
            const incorrectOptions = mockWordsWithExamples
              .filter((w) => w.id !== word.id && w.translation)
              .slice(0, 3)
              .map((w) => w.translation!);

            const options = [word.translation!, ...incorrectOptions].sort(
              () => 0.5 - Math.random(),
            );

            return {
              type: "test-card",
              viewAs: TestCardType.SINGLE_CHOICE,
              guid: `test-flashcard-${word.id}`,
              title: "Vocabulary Test",
              description: "Choose the correct translation",
              question: `What does '${word.word}' mean?`,
              options,
              correctAnswers: [word.translation!],
              explanation: word.explanation || word.definition,
            };
          });

        resolve(flashcards);
      }, 150);
    });
  }

  // Grammar operations
  static async getGrammarTopics(): Promise<GrammarTopicWithContent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const topicsWithContent: GrammarTopicWithContent[] =
          mockGrammarTopics.map((topic) => ({
            ...topic,
            children: mockGrammarTopics
              .filter((t) => t.topicId === topic.id)
              .map((child) => ({
                ...child,
                children: [],
                tests: [],
              })),
            tests: [],
          }));

        resolve(topicsWithContent);
      }, 100);
    });
  }

  // Tags operations
  static async getTags(): Promise<Tag[]> {
    return new Promise((resolve) => setTimeout(() => resolve(mockTags), 100));
  }

  // Statistics operations
  static async getUserStatistics(): Promise<UserStatistics> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockUserStatistics), 100),
    );
  }

  // Settings operations
  static async getUserSettings(): Promise<UserSettings> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockUserSettings), 100),
    );
  }

  static async updateUserSettings(
    settings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedSettings = { ...mockUserSettings, ...settings };
        resolve(updatedSettings);
      }, 100);
    });
  }

  // Search operations
  static async searchWords(query: string): Promise<WordWithExamples[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const queryLower = query.toLowerCase();
        const results = mockWordsWithExamples.filter(
          (word) =>
            word.word.toLowerCase().includes(queryLower) ||
            word.translation?.toLowerCase().includes(queryLower) ||
            word.definition?.toLowerCase().includes(queryLower),
        );
        resolve(results);
      }, 200);
    });
  }

  // Progress tracking
  static async updateWordProgress(
    wordId: number,
    correct: boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const word = mockWords.find((w) => w.id === wordId);
        if (word) {
          word.reviewCount += 1;
          word.lastReviewDate = new Date().toISOString();
          if (correct) {
            word.rate = Math.min(word.rate + 1, 5);
          } else {
            word.rate = Math.max(word.rate - 1, 0);
          }
        }
        resolve();
      }, 50);
    });
  }
}

// Export all mock data for easy access
export const MockData = {
  dictionaries: mockDictionaries,
  words: mockWords,
  wordsWithExamples: mockWordsWithExamples,
  examples: mockExamples,
  tags: mockTags,
  sets: mockSets,
  setsWithWords: mockSetsWithWords,
  units: mockUnits,
  studyCards: mockStudyCards,
  studyCardsWithContent: mockStudyCardsWithContent,
  testCards: mockTestCards,
  grammarTests: mockGrammarTests,
  grammarTopics: mockGrammarTopics,
  studyFlashcards: mockStudyFlashcards,
  testFlashcards: mockTestFlashcards,
  userStatistics: mockUserStatistics,
  userSettings: mockUserSettings,
};
