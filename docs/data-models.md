# Data Models Documentation

## Overview

The Easy English application uses a comprehensive type system built with TypeScript to ensure data consistency and type safety throughout the application. All data models are defined in `types/models.ts` and follow strict typing conventions.

## Core Enums

### PartOfSpeech
**Purpose**: Categorize words by their grammatical function
**Location**: `types/models.ts`

```typescript
export enum PartOfSpeech {
  NOUN = "noun",
  VERB = "verb",
  ADJECTIVE = "adjective",
  ADVERB = "adverb",
  PREPOSITION = "preposition",
  PHARSE = "phrase",
  PHRASAL_VERB = "phrasal_verb",
  IDIOM = "idiom",
  PRONOUN = "pronoun",
  CONJUNCTION = "conjunction",
  INTERJECTION = "interjection",
  SLANG = "slang",
  ABBREVIATION = "abbreviation",
  FIXEDEXPRESSION = "fixed_expression",
}
```

**Usage**:
- Word categorization for learning
- Color coding in UI components
- Filtering and search functionality
- Form validation

## Base Interfaces

### BaseEntity
**Purpose**: Common properties for all database entities

```typescript
interface BaseEntity {
  id: number;
  guid: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Properties**:
- `id`: Auto-incrementing primary key
- `guid`: Globally unique identifier for synchronization
- `createdAt`: Entity creation timestamp
- `updatedAt`: Last modification timestamp

### LearningHistory
**Purpose**: Track learning progress and review statistics

```typescript
interface LearningHistory {
  lastReviewDate: Date | null;
  reviewCount: number;
  rate?: number;
}
```

**Properties**:
- `lastReviewDate`: When the item was last reviewed
- `reviewCount`: Total number of review sessions
- `rate`: User rating (1-5 scale)

## Core Data Models

### Word
**Purpose**: Represent individual vocabulary words
**Extends**: `BaseEntity`, `LearningHistory`

```typescript
interface Word extends BaseEntity, LearningHistory {
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  audio?: Blob | null;
  partOfSpeech: PartOfSpeech;
  language: string;
  level: string;
  irregular?: boolean;
  irregularForms?: IrregularVerb | IrregularPlural | IrregularComparison | null;
  examples: Example[];
  dictionaryId?: number;
}
```

**Properties**:
- `word`: The English word
- `transcription`: Phonetic transcription (IPA)
- `translation`: Ukrainian translation
- `explanation`: Detailed explanation in Ukrainian
- `definition`: English definition
- `audio`: Audio pronunciation file
- `partOfSpeech`: Grammatical category
- `language`: Source language (default: 'en')
- `level`: Difficulty level (A1, A2, B1, B2, C1, C2)
- `irregular`: Whether the word has irregular forms
- `irregularForms`: Specific irregular forms
- `examples`: Usage examples
- `dictionaryId`: Parent dictionary reference

### WordWithExamples
**Purpose**: Word with populated examples for display
**Extends**: `Word`

```typescript
interface WordWithExamples extends Word {
  examples: Example[];
}
```

**Usage**: Used in components that need to display examples alongside word data.

### Example
**Purpose**: Usage examples for words
**Extends**: `BaseEntity`

```typescript
interface Example extends BaseEntity {
  sentence: string;
  translation: string;
  wordId?: number;
}
```

**Properties**:
- `sentence`: English example sentence
- `translation`: Ukrainian translation
- `wordId`: Reference to parent word

## Irregular Forms

### IrregularVerb
**Purpose**: Irregular verb forms (past simple, past participle)

```typescript
interface IrregularVerb {
  pastSimple: WordMinimumInfo;
  pastParticiple: WordMinimumInfo;
}
```

### IrregularPlural
**Purpose**: Irregular noun plural forms

```typescript
interface IrregularPlural {
  plural: WordMinimumInfo;
}
```

### IrregularComparison
**Purpose**: Irregular adjective/adverb comparative forms

```typescript
interface IrregularComparison {
  comparative: WordMinimumInfo;
  superlative: WordMinimumInfo;
}
```

### WordMinimumInfo
**Purpose**: Minimal word information for irregular forms

```typescript
interface WordMinimumInfo {
  id: number;
  guid: string;
  word: string;
  transcription: string;
  translation: string;
  audio?: Blob;
}
```

## Collection Models

### Dictionary
**Purpose**: Organize words into themed collections
**Extends**: `BaseEntity`

```typescript
interface Dictionary extends BaseEntity {
  title: string;
}
```

**Properties**:
- `title`: Dictionary name (e.g., "Business English", "Travel Vocabulary")

### Set
**Purpose**: Custom word collections for practice
**Extends**: `BaseEntity`, `LearningHistory`

```typescript
interface Set extends BaseEntity, LearningHistory {
  title: string;
  description?: string;
}
```

**Properties**:
- `title`: Set name
- `description`: Optional description

### StudyCard
**Purpose**: Structured learning materials
**Extends**: `BaseEntity`, `LearningHistory`

```typescript
interface StudyCard extends BaseEntity, LearningHistory {
  title: string;
  description?: string;
  dialogue?: string;
  unitId?: number;
}
```

**Properties**:
- `title`: Card title
- `description`: Card description
- `dialogue`: Optional dialogue content
- `unitId`: Reference to learning unit

## Learning Models

### GrammarTopic
**Purpose**: Grammar learning materials
**Extends**: `BaseEntity`, `LearningHistory`

```typescript
interface GrammarTopic extends BaseEntity, LearningHistory {
  title: string;
  description?: string;
  content: string;
  language: string;
  topicId?: number;
}
```

**Properties**:
- `title`: Topic title
- `description`: Brief description
- `content`: Full topic content
- `language`: Content language
- `topicId`: Parent topic reference (for subtopics)

### TestCard
**Purpose**: Testing and assessment materials
**Extends**: `BaseEntity`, `LearningHistory`

```typescript
interface TestCard extends BaseEntity, LearningHistory {
  testType?: string;
  title: string;
  description?: string;
  text?: string;
  mask?: string;
  options?: string;
  correctAnswers?: string;
  testId?: number;
}
```

**Properties**:
- `testType`: Type of test (multiple-choice, fill-in-blank, etc.)
- `title`: Test question or title
- `description`: Additional context
- `text`: Question text
- `mask`: Template for fill-in-blank questions
- `options`: JSON string of answer options
- `correctAnswers`: JSON string of correct answers
- `testId`: Reference to test collection

## Form Data Types

### WordFormData
**Purpose**: Form data structure for word creation/editing

```typescript
interface WordFormData {
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  language: string;
  level: string;
  irregular?: boolean;
  irregularForms?: any;
  examples: Array<{
    sentence: string;
    translation: string;
  }>;
  dictionaryId?: number;
}
```

### SetFormData
**Purpose**: Form data for set creation/editing

```typescript
interface SetFormData {
  title: string;
  description?: string;
}
```

### DictionaryFormData
**Purpose**: Form data for dictionary creation/editing

```typescript
interface DictionaryFormData {
  title: string;
}
```

## API Response Types

### ApiResponse
**Purpose**: Standardized API response format

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Usage**:
```typescript
// Service method return type
static async create(data: WordFormData): Promise<ApiResponse<Word>>

// Component usage
const response = await WordService.create(formData);
if (response.success) {
  console.log('Created word:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### PaginatedResponse
**Purpose**: Paginated data response format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

## Query and Filter Types

### QueryOptions
**Purpose**: Database query configuration

```typescript
interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}
```

### SearchFilters
**Purpose**: Advanced search and filtering

```typescript
interface SearchFilters {
  query?: string;
  partOfSpeech?: PartOfSpeech[];
  language?: string;
  level?: string;
  hasAudio?: boolean;
  isIrregular?: boolean;
  dictionaryId?: number;
}
```

### SortOptions
**Purpose**: Sorting configuration

```typescript
interface SortOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}
```

## Utility Types

### DatabaseConfig
**Purpose**: Database configuration

```typescript
interface DatabaseConfig {
  name: string;
  version: number;
}
```

### NavigationParams
**Purpose**: Navigation parameter typing

```typescript
interface NavigationParams {
  [key: string]: any;
}
```

### BaseComponentProps
**Purpose**: Common component properties

```typescript
interface BaseComponentProps {
  style?: any;
  testID?: string;
}
```

### LoadingProps & ErrorProps
**Purpose**: Common state management props

```typescript
interface LoadingProps {
  loading?: boolean;
  message?: string;
}

interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}
```

## Data Validation

### Validation Helpers
```typescript
// Helper functions for data validation
export const isValidPartOfSpeech = (value: string): boolean => {
  return Object.values(PartOfSpeech).includes(value as PartOfSpeech);
};

export const isValidLevel = (value: string): boolean => {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return validLevels.includes(value);
};

export const isValidLanguage = (value: string): boolean => {
  const validLanguages = ['en', 'uk'];
  return validLanguages.includes(value);
};
```

## Constants

### Default Values
```typescript
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_LEVEL = 'A1';
```

## Type Guards

### Runtime Type Checking
```typescript
// Type guards for runtime validation
export const isWord = (obj: any): obj is Word => {
  return obj && 
         typeof obj.word === 'string' &&
         typeof obj.translation === 'string' &&
         Object.values(PartOfSpeech).includes(obj.partOfSpeech);
};

export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj.success === 'boolean';
};
```

## Usage Examples

### Creating a Word
```typescript
const wordData: WordFormData = {
  word: 'hello',
  transcription: '/həˈləʊ/',
  translation: 'привіт',
  explanation: 'Вітання при зустрічі',
  partOfSpeech: PartOfSpeech.INTERJECTION,
  language: 'en',
  level: 'A1',
  examples: [
    {
      sentence: 'Hello, how are you?',
      translation: 'Привіт, як справи?'
    }
  ]
};

const response = await WordService.create(wordData);
```

### Filtering Words
```typescript
const filters: SearchFilters = {
  query: 'hello',
  partOfSpeech: [PartOfSpeech.NOUN, PartOfSpeech.VERB],
  level: 'A1',
  hasAudio: true
};

const words = await WordService.search(filters);
```

### Query with Options
```typescript
const options: QueryOptions = {
  limit: 20,
  offset: 0,
  orderBy: 'createdAt',
  orderDirection: 'DESC',
  where: { level: 'A1' }
};

const words = await WordService.findAll(options);
```

This type system provides strong typing throughout the application, enabling better developer experience, fewer runtime errors, and easier maintenance and refactoring.