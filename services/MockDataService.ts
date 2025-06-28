// services/MockDataService.ts
import { 
  Dictionary,
  Word,
  Set,
  Example,
  Tag,
  SetWord,
  PartOfSpeech,
  LanguageCode,
  Level
} from "../data/DataModels";

/**
 * Mock Data Service for web platform development
 * Single Responsibility: Provide realistic mock data for development
 * Open/Closed: New mock data types can be added easily
 */
export class MockDataService {
  // Mock dictionaries
  static mockDictionaries: Dictionary[] = [
    {
      id: 1,
      guid: "dict-001",
      title: "Business English",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      guid: "dict-002", 
      title: "Travel Vocabulary",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
    {
      id: 3,
      guid: "dict-003",
      title: "Daily Conversations",
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
    {
      id: 4,
      guid: "dict-004",
      title: "Academic English",
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: "2024-01-04T00:00:00Z",
    },
  ];

  // Mock words
  static mockWords: Word[] = [
    {
      id: 1,
      guid: "word-001",
      word: "book",
      transcription: "bʊk",
      translation: "бронювати, книга",
      explanation: "Може використовуватись як іменник (книга) та дієслово (бронювати)",
      definition: "A written or printed work consisting of pages glued or sewn together",
      partOfSpeech: PartOfSpeech.VERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      lastReviewDate: "2024-01-15T10:30:00Z",
      reviewCount: 5,
      rate: 4,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      dictionaryId: 1,
    },
    {
      id: 2,
      guid: "word-002", 
      word: "travel",
      transcription: "ˈtrævəl",
      translation: "подорожувати",
      explanation: "Рухатися з одного місця в інше, зазвичай на великі відстані",
      definition: "To go from one place to another, typically over a distance",
      partOfSpeech: PartOfSpeech.VERB,
      language: LanguageCode.EN_GB,
      level: Level.A2,
      isIrregular: false,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: null,
      dictionaryId: 2,
    },
    {
      id: 3,
      guid: "word-003",
      word: "meeting",
      transcription: "ˈmiːtɪŋ",
      translation: "зустріч, нарада",
      explanation: "Збір людей для обговорення або прийняття рішень",
      definition: "An assembly of people for a particular purpose",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.A2,
      isIrregular: false,
      lastReviewDate: "2024-01-10T14:20:00Z",
      reviewCount: 3,
      rate: 5,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-10T14:20:00Z",
      dictionaryId: 1,
    },
    {
      id: 4,
      guid: "word-004",
      word: "beautiful",
      transcription: "ˈbjuːtɪfʊl",
      translation: "красивий, прекрасний",
      explanation: "Приємний для очей або розуму естетично",
      definition: "Pleasing the senses or mind aesthetically",
      partOfSpeech: PartOfSpeech.ADJECTIVE,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: null,
      dictionaryId: 3,
    },
    {
      id: 5,
      guid: "word-005",
      word: "run",
      transcription: "rʌn",
      translation: "бігати",
      explanation: "Рухатися швидко пішки або керувати чимось",
      definition: "Move at a speed faster than a walk",
      partOfSpeech: PartOfSpeech.VERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: true,
      lastReviewDate: "2024-01-20T09:15:00Z",
      reviewCount: 7,
      rate: 3,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-20T09:15:00Z",
      dictionaryId: 3,
    },
    {
      id: 6,
      guid: "word-006",
      word: "presentation",
      transcription: "ˌprezənˈteɪʃən",
      translation: "презентація",
      explanation: "Формальне представлення інформації аудиторії",
      definition: "The action of showing or explaining something to an audience",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.B1,
      isIrregular: false,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: null,
      dictionaryId: 1,
    },
    {
      id: 7,
      guid: "word-007",
      word: "airport",
      transcription: "ˈeəpɔːt",
      translation: "аеропорт",
      explanation: "Місце, де літаки злітають та приземляються",
      definition: "A complex of runways and buildings for the take-off, landing, and maintenance of aircraft",
      partOfSpeech: PartOfSpeech.NOUN,
      language: LanguageCode.EN_GB,
      level: Level.A2,
      isIrregular: false,
      lastReviewDate: "2024-01-18T16:45:00Z",
      reviewCount: 2,
      rate: 4,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
      dictionaryId: 2,
    },
    {
      id: 8,
      guid: "word-008",
      word: "quickly",
      transcription: "ˈkwɪkli",
      translation: "швидко",
      explanation: "З великою швидкістю або за короткий час",
      definition: "At a fast speed; rapidly",
      partOfSpeech: PartOfSpeech.ADVERB,
      language: LanguageCode.EN_GB,
      level: Level.A1,
      isIrregular: false,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-06T00:00:00Z",
      updatedAt: null,
      dictionaryId: 3,
    },
    {
      id: 9,
      guid: "word-009",
      word: "break down",
      transcription: "breɪk daʊn",
      translation: "ламатися, аналізувати",
      explanation: "Припиняти роботу (про машину) або розділяти на частини",
      definition: "To stop working (of a machine) or to separate into parts",
      partOfSpeech: PartOfSpeech.PHRASAL_VERB,
      language: LanguageCode.EN_GB,
      level: Level.B1,
      isIrregular: false,
      lastReviewDate: "2024-01-12T11:30:00Z",
      reviewCount: 4,
      rate: 3,
      createdAt: "2024-01-07T00:00:00Z",
      updatedAt: "2024-01-12T11:30:00Z",
      dictionaryId: 4,
    },
    {
      id: 10,
      guid: "word-010",
      word: "piece of cake",
      transcription: "piːs əv keɪk",
      translation: "легко як торт (дуже просто)",
      explanation: "Щось дуже легке для виконання",
      definition: "Something that is very easy to do",
      partOfSpeech: PartOfSpeech.IDIOM,
      language: LanguageCode.EN_GB,
      level: Level.B2,
      isIrregular: false,
      lastReviewDate: null,
      reviewCount: 0,
      rate: 0,
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: null,
      dictionaryId: 4,
    },
  ];

  // Mock examples
  static mockExamples: Example[] = [
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
      sentence: "This **book** is very interesting.",
      translation: "Ця книга дуже цікава.",
      wordId: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 3,
      guid: "example-003",
      sentence: "She loves to **travel** around the world.",
      translation: "Вона любить подорожувати по всьому світу.",
      wordId: 2,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 4,
      guid: "example-004",
      sentence: "We have a **meeting** at 3 PM.",
      translation: "У нас нарада о 15:00.",
      wordId: 3,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 5,
      guid: "example-005",
      sentence: "The sunset is very **beautiful**.",
      translation: "Захід сонця дуже красивий.",
      wordId: 4,
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 6,
      guid: "example-006",
      sentence: "I **run** every morning in the park.",
      translation: "Я бігаю кожного ранку в парку.",
      wordId: 5,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 7,
      guid: "example-007",
      sentence: "She gave an excellent **presentation** to the board.",
      translation: "Вона зробила відмінну презентацію ради директорів.",
      wordId: 6,
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 8,
      guid: "example-008",
      sentence: "We arrived at the **airport** two hours early.",
      translation: "Ми прибули в аеропорт на дві години раніше.",
      wordId: 7,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 9,
      guid: "example-009",
      sentence: "Please walk **quickly**, we're late!",
      translation: "Будь ласка, йди швидко, ми запізнюємося!",
      wordId: 8,
      createdAt: "2024-01-06T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 10,
      guid: "example-010",
      sentence: "My car **broke down** on the highway.",
      translation: "Моя машина зламалася на шосе.",
      wordId: 9,
      createdAt: "2024-01-07T00:00:00Z",
      updatedAt: null,
    },
    {
      id: 11,
      guid: "example-011",
      sentence: "This exam will be a **piece of cake** for you.",
      translation: "Цей іспит буде для тебе дуже легким.",
      wordId: 10,
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: null,
    },
  ];

  // Mock sets
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

  // Mock tags
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
   * Generate next ID for entity
   */
  static getNextId(entityType: 'dictionary' | 'word' | 'example' | 'set' | 'tag'): number {
    switch (entityType) {
      case 'dictionary':
        return Math.max(...this.mockDictionaries.map(d => d.id), 0) + 1;
      case 'word':
        return Math.max(...this.mockWords.map(w => w.id), 0) + 1;
      case 'example':
        return Math.max(...this.mockExamples.map(e => e.id), 0) + 1;
      case 'set':
        return Math.max(...this.mockSets.map(s => s.id), 0) + 1;
      case 'tag':
        return Math.max(...this.mockTags.map(t => t.id), 0) + 1;
      default:
        return 1;
    }
  }

  /**
   * Generate GUID
   */
  static generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Simulate API delay
   */
  static async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset all mock data to initial state
   */
  static resetMockData(): void {
    // This method can be used for testing or demo purposes
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