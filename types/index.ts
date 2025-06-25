/**
 * Type definitions for the Easy English application
 */

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

// Card interface
export interface Card {
  id: string;
  englishWord: string;
  ukrainianTranslation: string;
  partOfSpeech: PartOfSpeech;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastReviewed?: string;
  reviewCount: number;
  correctCount: number;
  isLearned: boolean;
  isFavorite: boolean;
  notes?: string;
}

// User progress interface
export interface UserProgress {
  id: string;
  cardId: string;
  userId?: string;
  currentLevel: number;
  nextReviewDate: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  lastReviewed: string;
  createdAt: string;
  updatedAt: string;
}

// Study session interface
export interface StudySession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionType: "review" | "new_cards" | "practice";
  createdAt: string;
}

// Learning statistics interface
export interface LearningStats {
  totalCards: number;
  learnedCards: number;
  reviewCards: number;
  newCards: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  averageAccuracy: number;
  cardsPerDay: number;
  lastStudyDate?: string;
}

// Database interfaces
export interface DatabaseCard {
  id: string;
  english_word: string;
  ukrainian_translation: string;
  part_of_speech: string;
  pronunciation?: string;
  example?: string;
  example_translation?: string;
  difficulty: number;
  tags?: string;
  created_at: string;
  updated_at: string;
  last_reviewed?: string;
  review_count: number;
  correct_count: number;
  is_learned: number;
  is_favorite: number;
  notes?: string;
}

export interface DatabaseUserProgress {
  id: string;
  card_id: string;
  user_id?: string;
  current_level: number;
  next_review_date: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  last_reviewed: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStudySession {
  id: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  cards_studied: number;
  correct_answers: number;
  incorrect_answers: number;
  session_type: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter and search types
export interface CardFilters {
  partOfSpeech?: PartOfSpeech[];
  difficulty?: number[];
  isLearned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  searchQuery?: string;
}

export interface SortOptions {
  field:
    | "englishWord"
    | "ukrainianTranslation"
    | "createdAt"
    | "lastReviewed"
    | "difficulty";
  direction: "asc" | "desc";
}

// Component prop types
export interface CardListProps {
  cards: Card[];
  onCardPress?: (card: Card) => void;
  onCardUpdate?: (card: Card) => void;
  onCardDelete?: (cardId: string) => void;
  filters?: CardFilters;
  sortOptions?: SortOptions;
  showProgress?: boolean;
}

export interface CardItemProps {
  card: Card;
  onPress?: () => void;
  onUpdate?: (card: Card) => void;
  onDelete?: () => void;
  showProgress?: boolean;
}

// Navigation types for expo-router
export interface RouteParams {
  cardId?: string;
  sessionId?: string;
  mode?: "review" | "practice" | "learn";
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Settings types
export interface AppSettings {
  language: "uk" | "en";
  theme: "dark" | "light" | "auto";
  dailyGoal: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoPlayPronunciation: boolean;
  reviewReminders: boolean;
  studyRemindersTime?: string;
  showTranslationsInPractice: boolean;
  cardDisplayMode: "word_first" | "translation_first" | "random";
}

// Utility types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
