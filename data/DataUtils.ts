import {
  Word,
  WordWithExamples,
  StudyFlashcard,
  TestFlashcard,
  FlashcardWord,
  FlashcardSentence,
  PartOfSpeech,
  Level,
  LanguageCode,
  StudyCardType,
  TestCardType,
  UserStatistics,
  DailyProgress,
} from './DataModels';

// Error types and constants
export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  STORAGE_FULL = 'STORAGE_FULL',
  AUDIO_LOAD_ERROR = 'AUDIO_LOAD_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
}

export class AppError extends Error {
  public code: ErrorCodes;
  public details?: any;

  constructor(code: ErrorCodes, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

// Result wrapper for async operations
export class Result<T> {
  public success: boolean;
  public data?: T;
  public error?: AppError;

  private constructor(success: boolean, data?: T, error?: AppError) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static ok<T>(data: T): Result<T> {
    return new Result<T>(true, data);
  }

  static fail<T>(error: AppError): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  static failWithMessage<T>(code: ErrorCodes, message: string, details?: any): Result<T> {
    return Result.fail<T>(new AppError(code, message, details));
  }
}

// Data transformation utilities
export class DataMapper {
  // Convert Word to FlashcardWord
  static wordToFlashcardWord(word: WordWithExamples): FlashcardWord {
    return {
      word: word.word,
      transcription: word.transcription,
      translate: word.translation,
      definition: word.definition,
      explanation: word.explanation,
      lang: word.language,
      examples: word.examples.map(example => ({
        sentence: example.sentence,
        translate: example.translation,
      })),
    };
  }

  // Convert WordWithExamples to StudyFlashcard
  static wordToStudyFlashcard(
    word: WordWithExamples, 
    viewAs: StudyCardType = StudyCardType.SINGLE_WORD
  ): StudyFlashcard {
    return {
      type: "study-card",
      viewAs,
      guid: word.guid,
      title: `Learn: ${word.word}`,
      description: word.explanation || word.definition,
      items: [this.wordToFlashcardWord(word)],
      progress: {
        lastReviewed: word.lastReviewDate ?? undefined,
        reviewCount: word.reviewCount,
        rate: word.rate,
      },
    };
  }

  // Convert multiple words to word list flashcard
  static wordsToWordListFlashcard(
    words: WordWithExamples[],
    title: string = "Word List",
    description?: string
  ): StudyFlashcard {
    return {
      type: "study-card",
      viewAs: StudyCardType.WORD_LIST,
      guid: `word-list-${Date.now()}`,
      title,
      description,
      items: words.map((word, index) => ({
        label: `${index + 1}.`,
        ...this.wordToFlashcardWord(word),
      })),
    };
  }

  // Generate test flashcard from word
  static wordToTestFlashcard(
    word: WordWithExamples,
    incorrectOptions: string[],
    testType: TestCardType = TestCardType.SINGLE_CHOICE
  ): TestFlashcard {
    const options = [word.translation!, ...incorrectOptions]
      .filter(Boolean)
      .sort(() => 0.5 - Math.random());

    return {
      type: "test-card",
      viewAs: testType,
      guid: `test-${word.guid}`,
      title: "Vocabulary Test",
      description: "Choose the correct translation",
      question: `What does '${word.word}' mean?`,
      options,
      correctAnswers: [word.translation!],
      explanation: word.explanation || word.definition,
    };
  }

  // Create fill-in-the-blank test from example
  static exampleToFillBlankTest(
    word: WordWithExamples,
    exampleIndex: number = 0
  ): TestFlashcard | null {
    const example = word.examples[exampleIndex];
    if (!example) return null;

    // Replace the word with blank in the sentence
    const sentence = example.sentence.replace(
      new RegExp(`\\*\\*${word.word}\\*\\*`, 'gi'),
      '_____'
    );

    return {
      type: "test-card",
      viewAs: TestCardType.FILL_IN_THE_BLANK,
      guid: `fill-blank-${word.guid}-${exampleIndex}`,
      title: "Fill in the Blank",
      description: "Complete the sentence",
      question: sentence,
      correctAnswers: [word.word],
      explanation: example.translation,
    };
  }
}

// Validation utilities
export class DataValidator {
  static isValidWord(word: Partial<Word>): boolean {
    return !!(
      word.word &&
      word.word.trim().length > 0 &&
      word.partOfSpeech &&
      word.language &&
      word.level
    );
  }

  static isValidFlashcard(flashcard: Partial<StudyFlashcard | TestFlashcard>): boolean {
    return !!(
      flashcard.type &&
      flashcard.viewAs &&
      (flashcard.type === 'study-card' ? 
        (flashcard as StudyFlashcard).items?.length :
        (flashcard as TestFlashcard).question
      )
    );
  }

  static isValidLanguageCode(code: string): code is LanguageCode {
    return Object.values(LanguageCode).includes(code as LanguageCode);
  }

  static isValidLevel(level: string): level is Level {
    return Object.values(Level).includes(level as Level);
  }

  static isValidPartOfSpeech(pos: string): pos is PartOfSpeech {
    return Object.values(PartOfSpeech).includes(pos as PartOfSpeech);
  }
}

// Sorting and filtering utilities
export class DataSorter {
  static sortWordsByDifficulty(words: WordWithExamples[]): WordWithExamples[] {
    const levelOrder = [Level.A1, Level.A2, Level.B1, Level.B2, Level.C1, Level.C2];
    return [...words].sort((a, b) => {
      const aIndex = levelOrder.indexOf(a.level);
      const bIndex = levelOrder.indexOf(b.level);
      return aIndex - bIndex;
    });
  }

  static sortWordsByProgress(words: WordWithExamples[]): WordWithExamples[] {
    return [...words].sort((a, b) => {
      // Sort by rate (ascending - worst first), then by review count
      if (a.rate !== b.rate) {
        return a.rate - b.rate;
      }
      return a.reviewCount - b.reviewCount;
    });
  }

  static sortWordsByAlphabet(words: WordWithExamples[]): WordWithExamples[] {
    return [...words].sort((a, b) => a.word.localeCompare(b.word));
  }

  static filterWordsByLevel(words: WordWithExamples[], levels: Level[]): WordWithExamples[] {
    return words.filter(word => levels.includes(word.level));
  }

  static filterWordsByPartOfSpeech(
    words: WordWithExamples[], 
    partsOfSpeech: PartOfSpeech
  ): WordWithExamples[] {
    return words.filter(word => partsOfSpeech.includes(word.partOfSpeech));
  }

  static filterUnreviewedWords(words: WordWithExamples[]): WordWithExamples[] {
    return words.filter(word => word.reviewCount === 0 || !word.lastReviewDate);
  }

  static filterDifficultWords(words: WordWithExamples[], maxRate: number = 2): WordWithExamples[] {
    return words.filter(word => word.rate <= maxRate && word.reviewCount > 0);
  }
}
  
// Statistics calculation utilities
export class StatsCalculator {
  static calculateAverageRate(words: WordWithExamples[]): number {
    if (words.length === 0) return 0;
    const totalRate = words.reduce((sum, word) => sum + word.rate, 0);
    return Math.round((totalRate / words.length) * 100) / 100;
  }

  static calculateLevelDistribution(words: WordWithExamples[]): Record<Level, number> {
    const distribution: Record<Level, number> = {
      [Level.A1]: 0,
      [Level.A2]: 0,
      [Level.B1]: 0,
      [Level.B2]: 0,
      [Level.C1]: 0,
      [Level.C2]: 0,
    };

    words.forEach(word => {
      distribution[word.level]++;
    });

    return distribution;
  }

  static calculatePartOfSpeechDistribution(words: WordWithExamples[]): Record<PartOfSpeech, number> {
    const distribution: Record<PartOfSpeech, number> = Object.keys(PartOfSpeech).reduce(
      (acc, key) => ({ ...acc, [PartOfSpeech[key as keyof typeof PartOfSpeech]]: 0 }),
      {} as Record<PartOfSpeech, number>
    );

    words.forEach(word => {
      distribution[word.partOfSpeech]++;
    });

    return distribution;
  }

  static calculateStreak(dailyProgress: DailyProgress[]): number {
    if (dailyProgress.length === 0) return 0;

    // Sort by date descending
    const sorted = [...dailyProgress].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const progress of sorted) {
      const progressDate = new Date(progress.date);
      progressDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - progressDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        if (progress.wordsStudied > 0 || progress.testsCompleted > 0) {
          streak++;
          currentDate = progressDate;
        } else {
          break;
        }
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }

  static calculateWeeklyProgress(dailyProgress: DailyProgress[]): {
    wordsPerDay: number;
    testsPerDay: number;
    timePerDay: number;
    averageAccuracy: number;
  } {
    if (dailyProgress.length === 0) {
      return { wordsPerDay: 0, testsPerDay: 0, timePerDay: 0, averageAccuracy: 0 };
    }

    const totalWords = dailyProgress.reduce((sum, day) => sum + day.wordsStudied, 0);
    const totalTests = dailyProgress.reduce((sum, day) => sum + day.testsCompleted, 0);
    const totalTime = dailyProgress.reduce((sum, day) => sum + day.timeSpent, 0);
    const totalAccuracy = dailyProgress.reduce((sum, day) => sum + day.accuracy, 0);

    const daysCount = dailyProgress.length;

    return {
      wordsPerDay: Math.round(totalWords / daysCount),
      testsPerDay: Math.round(totalTests / daysCount),
      timePerDay: Math.round(totalTime / daysCount),
      averageAccuracy: Math.round((totalAccuracy / daysCount) * 100) / 100,
    };
  }
}

// Text processing utilities
export class TextProcessor {
  // Remove markdown formatting for plain text display
  static stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/__(.*?)__/g, '$1')     // Remove underline
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
  }

  // Highlight word in sentence
  static highlightWordInSentence(sentence: string, word: string): string {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    return sentence.replace(regex, '**$1**');
  }

  // Extract word from sentence (remove markdown)
  static extractWordFromSentence(sentence: string): string | null {
    const match = sentence.match(/\*\*(.*?)\*\*/);
    return match ? match[1] : null;
  }

  // Generate audio filename for word
  static generateAudioFilename(word: string, language: LanguageCode): string {
    return `${word.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${language}.mp3`;
  }

  // Truncate text with ellipsis
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

// Date utilities
export class DateUtils {
  static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  static formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static isToday(date: string | Date): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  static isYesterday(date: string | Date): boolean {
    const d = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }

  static daysAgo(date: string | Date): number {
    const d = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - d.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }
}

// Random utilities for learning algorithms
export class RandomUtils {
  // Shuffle array
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get random items from array
  static getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Weighted random selection (words with lower rates are more likely to be selected)
  static getWeightedRandomWords(words: WordWithExamples[], count: number): WordWithExamples[] {
    const weights = words.map(word => {
      // Higher weight for words with lower rates (need more practice)
      const baseWeight = 6 - word.rate; // Rate 0 = weight 6, Rate 5 = weight 1
      const reviewWeight = word.reviewCount === 0 ? 3 : 1; // Boost unreviewed words
      return Math.max(baseWeight * reviewWeight, 1);
    });

    const selected: WordWithExamples[] = [];
    const remaining = [...words];
    const remainingWeights = [...weights];

    for (let i = 0; i < count && remaining.length > 0; i++) {
      const totalWeight = remainingWeights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < remaining.length; j++) {
        random -= remainingWeights[j];
        if (random <= 0) {
          selected.push(remaining[j]);
          remaining.splice(j, 1);
          remainingWeights.splice(j, 1);
          break;
        }
      }
    }

    return selected;
  }
}

// Export all utilities
export const Utils = {
  DataMapper,
  DataValidator,
  DataSorter,
  StatsCalculator,
  TextProcessor,
  DateUtils,
  RandomUtils,
  AppError,
  Result,
  ErrorCodes,
};