// Core enums
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

export enum LanguageCode {
  EN_US = "en-us",
  EN_GB = "en-gb",
  UK_UA = "uk-ua",
}

export enum Level {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum StudyCardType {
  SINGLE_WORD = "single-word",
  WORD_LIST = "word-list",
  STANDARD = "standard",
  VERY_INSTEAD = "very-instead",
  IRREGULAR_VERB = "irregular-verb",
  IRREGULAR_PLURAL = "irregular-plural",
  IRREGULAR_ADJECTIVE = "irregular-adjective",
  IRREGULAR_ADVERB = "irregular-adverb",
  IDIOM = "idiom",
  SENTENCE = "sentence",
  DEFINITION = "definition",
  CROSS_LANG_SYNONYM = "cross-lang-synonym",
  WORD_FORMATION = "word-formation",
  HOMOPHONES = "homophones",
  FALSE_FRIENDS = "false-friends",
}

export enum TestCardType {
  TYPE_ANSWER = "type-answer",
  SINGLE_CHOICE = "single-choice",
  MULTI_CHOICE = "multi-choice",
  FILL_IN_THE_BLANK = "fill-in-the-blank",
  MATCHING = "matching",
  HIDE_AND_SEEK = "hide-and-seek",
  SELF_CHECK = "self-check",
  DRAG_AND_DROP = "drag-and-drop",
}

// Base interfaces for database entities
export interface BaseEntity {
  id: number;
  guid: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Progress {
  lastReviewDate: string | null;
  reviewCount: number;
  rate: number; // 0-5 rating
}

// Core entities
export interface Dictionary extends BaseEntity {
  title: string;
}

export interface Word extends BaseEntity, Progress {
  word: string;
  transcription?: string | undefined;
  translation?: string | undefined;
  explanation?: string | undefined;
  definition?: string | undefined;
  partOfSpeech: PartOfSpeech;
  language: LanguageCode;
  level: Level;
  isIrregular: boolean;
  pronunciation?: Uint8Array | undefined; // BLOB data
  dictionaryId: number;
}

export interface Example extends BaseEntity {
  sentence: string;
  translation?: string | null | undefined;
  wordId: number;
}

export interface Tag extends BaseEntity {
  title: string;
}

export interface WordTag {
  wordId: number;
  tagId: number;
}

export interface Set extends BaseEntity, Progress {
  title: string;
  description?: string | undefined;
}

export interface SetWord {
  setId: number;
  wordId: number;
}

export interface IrregularForm {
  firstFormId: number; // base form
  secondFormId: number; // past form
  thirdFormId?: number; // past participle form
}

export interface Unit extends BaseEntity, Progress {
  title: string;
  description?: string;
}

export interface StudyCard extends BaseEntity, Progress {
  title: string;
  description?: string;
  dialogue?: string | null;
  unitId: number;
}

export interface StudyCardItem {
  cardId: number;
  wordId: number;
}

export interface GrammarTest extends BaseEntity, Progress {
  title: string;
  description?: string;
}

export interface TestCard extends BaseEntity, Progress {
  testType?: string;
  title: string;
  description?: string;
  text?: string;
  mask?: string | null;
  options?: string; // JSON string
  correctAnswers?: string; // JSON string
  testId: number;
}

export interface GrammarTopic extends BaseEntity, Progress {
  title: string;
  description?: string;
  content: string;
  language: LanguageCode;
  topicId?: number | null; // parent topic id for hierarchy
}

export interface GrammarTopicTest {
  topicId: number;
  testId: number;
}

// Enhanced models for UI components (with populated data)
export interface WordWithExamples extends Word {
  nextReviewDate: any;
  examples: Example[];
  tags: Tag[];
  dictionary: Dictionary;
}

export interface WordWithRelations extends WordWithExamples {
  irregularForms?: {
    firstForm?: Word;
    secondForm?: Word;
    thirdForm?: Word;
  };
}

export interface SetWithWords extends Set {
  words: WordWithExamples[];
  wordCount: number;
}

export interface UnitWithContent extends Unit {
  studyCards: StudyCardWithContent[];
  cardCount: number;
}

export interface StudyCardWithContent extends StudyCard {
  words: WordWithExamples[];
  unit: Unit;
}

export interface TestCardWithContent extends TestCard {
  parsedOptions?:
    | string[]
    | Record<string, string>
    | {
        left: Record<string, string>[];
        right: Record<string, string>[];
      };
  parsedCorrectAnswers?: string[] | Record<string, string>[];
  grammarTest: GrammarTest;
}

export interface GrammarTopicWithContent extends GrammarTopic {
  children: GrammarTopicWithContent[];
  tests: TestCardWithContent[];
  parent?: GrammarTopicWithContent;
}

// Flashcard interfaces for study/test components
export interface StudyFlashcard {
  type: "study-card";
  viewAs: StudyCardType;
  guid?: string;
  title?: string;
  description?: string;
  items?: FlashcardWord[];
  // progress?: FlashcardProgress;
}

export interface TestFlashcard {
  type: "test-card";
  viewAs: TestCardType;
  guid?: string;
  lang?: string;
  title?: string;
  description?: string;
  question: string;
  options?:
    | string[]
    | Record<string, string>
    | {
        left: Record<string, string>[];
        right: Record<string, string>[];
      };
  correctAnswers?: string[] | Record<string, string>[];
  explanation?: string;
  // progress?: FlashcardProgress;
}

export interface FlashcardWord {
  label?: string;
  word?: string;
  transcription?: string;
  translate?: string;
  examples?: FlashcardSentence[];
  explanation?: string;
  definition?: string;
  lang?: LanguageCode;
}

export interface FlashcardSentence {
  sentence: string;
  translate?: string;
}

export interface FlashcardProgress {
  correct?: number;
  incorrect?: number;
  attempts?: number;
  lastReviewed?: string;
  reviewCount?: number;
  rate?: number;
}

// // Response types for API/Database operations
// export interface DictionariesResponse {
//   dictionaries: Dictionary[];
//   total: number;
// }

// export interface WordsResponse {
//   words: WordWithExamples[];
//   total: number;
//   dictionary?: Dictionary;
// }

// export interface UnitsResponse {
//   units: UnitWithContent[];
//   total: number;
// }

// export interface SetsResponse {
//   sets: SetWithWords[];
//   total: number;
// }

// export interface GrammarTopicsResponse {
//   topics: GrammarTopicWithContent[];
//   total: number;
// }

// // Query parameters
// export interface WordsQueryParams {
//   dictionaryId?: number;
//   search?: string;
//   partOfSpeech?: PartOfSpeech;
//   level?: Level;
//   language?: LanguageCode;
//   isIrregular?: boolean;
//   tagIds?: number[];
//   limit?: number;
//   offset?: number;
//   sortBy?: "word" | "createdAt" | "reviewCount" | "rate";
//   sortOrder?: "asc" | "desc";
// }

// export interface UnitsQueryParams {
//   search?: string;
//   limit?: number;
//   offset?: number;
//   sortBy?: "title" | "createdAt" | "reviewCount";
//   sortOrder?: "asc" | "desc";
// }

// Statistics and progress tracking
export interface DailyProgress {
  date: string;
  wordsStudied: number;
  testsCompleted: number;
  timeSpent: number; // minutes
  accuracy: number; // percentage
}

// export interface UserStatistics {
//   totalWords: number;
//   wordsLearned: number;
//   currentStreak: number;
//   longestStreak: number;
//   totalTimeSpent: number;
//   averageAccuracy: number;
//   dailyProgress: DailyProgress[];
//   levelDistribution: Record<Level, number>;
//   partOfSpeechDistribution: Record<PartOfSpeech, number>;
// }

// // Settings and preferences
// export interface UserSettings {
//   theme: "light" | "dark" | "system";
//   language: LanguageCode;
//   dailyGoal: number;
//   notificationsEnabled: boolean;
//   soundEnabled: boolean;
//   autoPlayAudio: boolean;
//   studyReminders: {
//     enabled: boolean;
//     time: string; // HH:MM format
//     days: number[]; // 0-6, Sunday to Saturday
//   };
//   defaultStudyMode: StudyCardType;
//   showTranscription: boolean;
//   showDefinition: boolean;
// }

// // Error handling
// export interface AppError {
//   code: string;
//   message: string;
//   details?: any;
// }

// export interface Result<T> {
//   success: boolean;
//   data?: T;
//   error?: AppError;
// }

// export interface CreateWordData {
//   word: string;
//   transcription?: string;
//   translation?: string;
//   explanation?: string;
//   definition?: string;
//   partOfSpeech: PartOfSpeech;
//   language: LanguageCode;
//   level: Level;
//   isIrregular?: boolean;
//   dictionaryId: number;
//   examples?: Omit<Example, "id" | "wordId">[];
//   tagIds?: number[];
// }

// export interface UpdateWordData extends Partial<CreateWordData> {
//   id: number;
// }

// export interface WordFilters {
//   dictionaryId?: number | undefined;
//   search?: string | undefined;
//   partOfSpeech?: PartOfSpeech[] | undefined;
//   level?: Level[] | undefined;
//   language?: LanguageCode | undefined;
//   isIrregular?: boolean | undefined;
//   tagIds?: number[] | undefined;
//   sortBy?: 'word' | 'createdAt' | 'reviewCount' | 'rate' | undefined;
//   sortOrder?: 'asc' | 'desc' | undefined;
// }

// export interface WordListResponse {
//   words: Word[];
//   total: number;
//   page: number;
//   limit: number;
// }
