// Enum for parts of speech
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
  IRREGULAR = "irregular",
}

// Interface for word card
export interface Card {
  id: string;
  word_en: string;
  word_ua: string;
  transcription?: string;
  part_of_speech: PartOfSpeech;
  example_en?: string;
  example_ua?: string;
  definition_en?: string;
  definition_ua?: string;
  image_url?: string;
  audio_url?: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  is_irregular: boolean;
  synonyms?: string[];
  antonyms?: string[];
  related_words?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_reviewed?: string;
  review_count: number;
  success_count: number;
  next_review?: string;
  interval_days: number;
  ease_factor: number;
}

// Interface for dictionary/collection
export interface Dictionary {
  id: string;
  name: string;
  description?: string;
  language_from: string;
  language_to: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  cards_count: number;
  author?: string;
}

// Interface for learning session
export interface LearningSession {
  id: string;
  dictionary_id: string;
  cards: Card[];
  session_type: 'flashcards' | 'quiz' | 'typing' | 'listening';
  started_at: string;
  completed_at?: string;
  correct_answers: number;
  total_questions: number;
  score: number;
}

// Interface for session results
export interface SessionResults {
  session_id: string;
  total_cards: number;
  correct_answers: number;
  incorrect_answers: number;
  skipped_answers: number;
  time_spent: number; // in seconds
  accuracy: number; // percentage
  cards_learned: Card[];
  cards_to_review: Card[];
}

// Interface for learning statistics
export interface LearningStats {
  date: string;
  cards_studied: number;
  correct_answers: number;
  total_answers: number;
  time_spent: number; // in minutes
  streak_days: number;
  new_cards_learned: number;
}

// Interface for user progress
export interface UserProgress {
  total_cards: number;
  learned_cards: number;
  review_cards: number;
  new_cards: number;
  daily_goal: number;
  current_streak: number;
  longest_streak: number;
  total_study_time: number; // in minutes
  accuracy_rate: number; // percentage
}

// Interface for filter options
export interface CardFilters {
  part_of_speech?: PartOfSpeech[];
  difficulty_level?: number[];
  is_irregular?: boolean;
  tags?: string[];
  search_term?: string;
  sort_by?: 'created_at' | 'word_en' | 'difficulty_level' | 'last_reviewed';
  sort_order?: 'asc' | 'desc';
}

// Interface for practice settings
export interface PracticeSettings {
  session_type: 'flashcards' | 'quiz' | 'typing' | 'listening';
  cards_per_session: number;
  show_transcription: boolean;
  show_examples: boolean;
  auto_play_audio: boolean;
  time_limit?: number; // in seconds
  difficulty_filter?: number[];
  include_review_cards: boolean;
  include_new_cards: boolean;
}

// Interface for app settings
export interface AppSettings {
  language: 'en' | 'uk';
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  daily_reminder_time?: string;
  daily_goal: number;
  font_size: 'small' | 'medium' | 'large';
  auto_backup: boolean;
  sound_effects: boolean;
}

// Interface for quiz question
export interface QuizQuestion {
  id: string;
  card: Card;
  question_type: 'translation' | 'multiple_choice' | 'typing' | 'audio';
  question: string;
  correct_answer: string;
  options?: string[]; // for multiple choice
  user_answer?: string;
  is_correct?: boolean;
  time_taken?: number; // in seconds
}

// Interface for spaced repetition data
export interface SpacedRepetitionData {
  card_id: string;
  interval: number; // days until next review
  repetitions: number; // number of times reviewed
  ease_factor: number; // how easy the card is (1.3 - 2.5)
  next_review_date: string;
  last_review_date: string;
  quality: number; // last answer quality (0-5)
}

// Interface for import/export data
export interface ExportData {
  version: string;
  exported_at: string;
  dictionaries: Dictionary[];
  cards: Card[];
  learning_stats: LearningStats[];
  settings: AppSettings;
}

// Type for theme colors
export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
};

// Type for navigation params
export type RootStackParamList = {
  Home: undefined;
  Dictionaries: undefined;
  Dictionary: { dictionaryId: string };
  CreateCard: { dictionaryId: string };
  EditCard: { cardId: string };
  Practice: { dictionaryId: string; settings?: PracticeSettings };
  PracticeSession: { cards: Card[]; settings: PracticeSettings };
  Progress: undefined;
  Settings: undefined;
};

// Type for form validation errors
export type ValidationErrors = {
  [key: string]: string | undefined;
};

// Type for API response
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Type for loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Type for sorting options
export type SortOption = {
  label: string;
  value: string;
  order: 'asc' | 'desc';
};

// Type for card review quality
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

// Constants for review qualities
export const REVIEW_QUALITY = {
  AGAIN: 0,
  HARD: 1,
  GOOD: 2,
  EASY: 3,
  PERFECT: 4,
  SKIP: 5,
} as const;

// Type for backup data
export type BackupData = {
  timestamp: string;
  version: string;
  data: ExportData;
};

// Utility type for making all properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for making all properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Type guards
export const isValidPartOfSpeech = (value: string): value is PartOfSpeech => {
  return Object.values(PartOfSpeech).includes(value as PartOfSpeech);
};

export const isValidDifficultyLevel = (value: number): value is 1 | 2 | 3 | 4 | 5 => {
  return [1, 2, 3, 4, 5].includes(value);
};

export const isValidReviewQuality = (value: number): value is ReviewQuality => {
  return [0, 1, 2, 3, 4, 5].includes(value);
};

// Default values
export const DEFAULT_CARD: Partial<Card> = {
  difficulty_level: 1,
  is_irregular: false,
  review_count: 0,
  success_count: 0,
  interval_days: 1,
  ease_factor: 2.5,
};

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  session_type: 'flashcards',
  cards_per_session: 20,
  show_transcription: true,
  show_examples: true,
  auto_play_audio: false,
  include_review_cards: true,
  include_new_cards: true,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'uk',
  theme: 'dark',
  notifications_enabled: true,
  daily_goal: 20,
  font_size: 'medium',
  auto_backup: true,
  sound_effects: true,
};

// Helper functions
export const getPartOfSpeechDisplayName = (partOfSpeech: PartOfSpeech, language: 'en' | 'uk' = 'en'): string => {
  const displayNames = {
    en: {
      [PartOfSpeech.NOUN]: 'Noun',
      [PartOfSpeech.VERB]: 'Verb',
      [PartOfSpeech.ADJECTIVE]: 'Adjective',
      [PartOfSpeech.ADVERB]: 'Adverb',
      [PartOfSpeech.PREPOSITION]: 'Preposition',
      [PartOfSpeech.PHRASE]: 'Phrase',
      [PartOfSpeech.PHRASAL_VERB]: 'Phrasal Verb',
      [PartOfSpeech.IDIOM]: 'Idiom',
      [PartOfSpeech.PRONOUN]: 'Pronoun',
      [PartOfSpeech.CONJUNCTION]: 'Conjunction',
      [PartOfSpeech.INTERJECTION]: 'Interjection',
      [PartOfSpeech.SLANG]: 'Slang',
      [PartOfSpeech.ABBREVIATION]: 'Abbreviation',
      [PartOfSpeech.FIXED_EXPRESSION]: 'Fixed Expression',
      [PartOfSpeech.IRREGULAR]: 'Irregular',
    },
    uk: {
      [PartOfSpeech.NOUN]: 'Іменник',
      [PartOfSpeech.VERB]: 'Дієслово',
      [PartOfSpeech.ADJECTIVE]: 'Прикметник',
      [PartOfSpeech.ADVERB]: 'Прислівник',
      [PartOfSpeech.PREPOSITION]: 'Прийменник',
      [PartOfSpeech.PHRASE]: 'Фраза',
      [PartOfSpeech.PHRASAL_VERB]: 'Фразове дієслово',
      [PartOfSpeech.IDIOM]: 'Ідіома',
      [PartOfSpeech.PRONOUN]: 'Займенник',
      [PartOfSpeech.CONJUNCTION]: 'Сполучник',
      [PartOfSpeech.INTERJECTION]: 'Вигук',
      [PartOfSpeech.SLANG]: 'Сленг',
      [PartOfSpeech.ABBREVIATION]: 'Абревіатура',
      [PartOfSpeech.FIXED_EXPRESSION]: 'Стійкий вираз',
      [PartOfSpeech.IRREGULAR]: 'Неправильний',
    },
  };

  return displayNames[language][partOfSpeech] || partOfSpeech;
};

export const getDifficultyLabel = (level: number, language: 'en' | 'uk' = 'en'): string => {
  const labels = {
    en: {
      1: 'Beginner',
      2: 'Elementary',
      3: 'Intermediate',
      4: 'Upper-Intermediate',
      5: 'Advanced',
    },
    uk: {
      1: 'Початковий',
      2: 'Елементарний',
      3: 'Середній',
      4: 'Вище середнього',
      5: 'Просунутий',
    },
  };

  return labels[language][level as keyof typeof labels[typeof language]] || `Level ${level}`;
};