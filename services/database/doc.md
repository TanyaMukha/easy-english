# Database Services Documentation

This documentation covers the new database services architecture for the Easy English app. All services are built on top of the `SQLiteUniversalService` and follow SOLID principles.

## Architecture Overview

The database layer is organized into several specialized services:

- **SQLiteUniversalService** - Core database abstraction layer
- **DictionaryService** - Manages dictionary CRUD operations
- **WordService** - Handles word management and learning features
- **ExampleService** - Manages example sentences for words
- **QueryService** - High-level API for complex operations
- **MigrationService** - Database versioning and seed data
- **DatabaseTester** - Comprehensive testing utilities

## Service Details

### 1. SQLiteUniversalService

The foundation service that provides cross-platform SQLite access.

```typescript
import { SQLiteUniversal } from './services/database';

// Basic usage
await SQLiteUniversal.initialize();
const result = await SQLiteUniversal.execute('SELECT * FROM words LIMIT 5');

// Transaction usage
const result = await SQLiteUniversal.executeTransaction(async (execute) => {
  await execute('INSERT INTO words (...) VALUES (...)', params);
  await execute('INSERT INTO examples (...) VALUES (...)', params);
  return 'success';
});
```

### 2. DictionaryService

Manages dictionary operations with full CRUD support.

```typescript
import { dictionaryService } from './services/database';

// Create dictionary
const result = await dictionaryService.createDictionary({
  guid: 'my-dict-001',
  title: 'My English Dictionary',
  description: 'Personal learning dictionary'
});

// Get all dictionaries with statistics
const stats = await dictionaryService.getAllDictionariesWithStats();

// Search dictionaries
const search = await dictionaryService.searchDictionaries('english');
```

### 3. WordService

Comprehensive word management with learning progress tracking.

```typescript
import { wordService, PartOfSpeech } from './services/database';

// Create word with examples
const result = await wordService.createWord({
  guid: 'word-001',
  word: 'hello',
  transcription: '/həˈləʊ/',
  translation: 'привіт',
  partOfSpeech: PartOfSpeech.INTERJECTION,
  dictionaryId: 1,
  examples: [
    {
      guid: 'example-001',
      sentence: 'Hello, how are you?',
      translation: 'Привіт, як справи?'
    }
  ]
});

// Search and filter words
const words = await wordService.searchWords({
  dictionaryId: 1,
  partOfSpeech: PartOfSpeech.VERB,
  level: 'A1',
  needsReview: true
}, 10);

// Get random words for study
const randomWords = await wordService.getRandomWords(5);

// Update learning progress
await wordService.updateWordProgress(wordId, 4); // rate 1-5
```

### 4. ExampleService

Manages example sentences for words.

```typescript
import { exampleService } from './services/database';

// Create example
const example = await exampleService.createExample({
  guid: 'example-001',
  sentence: 'I love learning English.',
  translation: 'Я люблю вивчати англійську.',
  wordId: 1
});

// Get examples with word information
const examples = await exampleService.getExamplesWithWord();

// Search examples
const searchResults = await exampleService.searchExamples('love');
```

### 5. QueryService

High-level API for complex operations combining multiple services.

```typescript
import { queryService } from './services/database';

// Get dashboard data
const dashboard = await queryService.getDashboardData();

// Create study session
const session = await queryService.createStudySession('mixed', 10);

// Global search across all content
const searchResults = await queryService.globalSearch('hello');

// Get daily words for practice
const dailyWords = await queryService.getDailyWords(5);

// Update learning progress with difficulty
await queryService.updateLearningProgress(wordId, true, 2);
```

### 6. MigrationService

Handles database setup, versioning, and seed data.

```typescript
import { migrationService } from './services/database';

// Initialize database with version control
const migration = await migrationService.initializeWithVersioning();

// Load development seed data
await migrationService.loadSeedData({
  includeSampleDictionary: true,
  includeSampleWords: true,
  includeExamples: true,
  wordCount: 20
});

// Check database status
const status = await migrationService.getDatabaseStatus();

// Reset database (development only)
await migrationService.resetDatabase();
```

## Data Models

### Dictionary
```typescript
interface Dictionary {
  id?: number;
  guid: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Word
```typescript
interface Word {
  id?: number;
  guid: string;
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  language: string;
  level?: string;
  isIrregular: boolean;
  dictionaryId: number;
  lastReviewDate?: string;
  reviewCount: number;
  rate: number;
  createdAt: string;
  updatedAt: string;
}
```

### WordWithExamples
```typescript
interface WordWithExamples extends Word {
  examples: Example[];
}
```

### Example
```typescript
interface Example {
  id?: number;
  guid: string;
  sentence: string;
  translation?: string;
  wordId: number;
  createdAt: string;
  updatedAt: string;
}
```

## Part of Speech Enum

```typescript
enum PartOfSpeech {
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
```

## Error Handling

All services return a consistent `DatabaseResult<T>` interface:

```typescript
interface DatabaseResult<T = any> {
  success: boolean;
  data?: T[];
  error?: string;
  rowsAffected?: number;
  insertId?: number;
}
```

Example usage:
```typescript
const result = await wordService.getRandomWords(5);

if (result.success) {
  const words = result.data || [];
  // Use words...
} else {
  console.error('Error:', result.error);
  // Handle error...
}
```

## Best Practices

### 1. Use Transactions for Multi-Step Operations
```typescript
const result = await SQLiteUniversal.executeTransaction(async (execute) => {
  // Multiple related operations
  const word = await execute('INSERT INTO words (...)', params);
  await execute('INSERT INTO examples (...)', [word.insertId, ...]);
  return word;
});
```

### 2. Handle Errors Properly
```typescript
const result = await wordService.createWord(wordData);
if (!result.success) {
  // Show user-friendly error message
  showError(result.error || 'Failed to create word');
  return;
}
// Continue with success flow
```

### 3. Use Type Safety
```typescript
// Good - typed result
const result = await wordService.getRandomWords(5);
const words: WordWithExamples[] = result.data || [];

// Better - with proper error handling
if (result.success && result.data) {
  const words: WordWithExamples[] = result.data;
  // TypeScript knows words is properly typed
}
```

### 4. Leverage High-Level Services
```typescript
// Instead of manually combining services
const dashboard = await queryService.getDashboardData();

// Instead of complex search logic
const session = await queryService.createStudySession('review', 10);
```

## Development Setup

### Initialize Database
```typescript
import { migrationService } from './services/database';

// In your app initialization
const status = await migrationService.getDatabaseStatus();

if (!status.isInitialized || status.needsMigration) {
  await migrationService.initializeWithVersioning();
}

if (!status.hasData) {
  // Load sample data for development
  await migrationService.loadSeedData();
}
```

### Testing
```typescript
import { databaseTester } from './services/database';

// Run comprehensive tests
const testResults = await databaseTester.runAllTests();
console.log(`Tests: ${testResults.passedTests}/${testResults.totalTests} passed`);
```

## Migration Guide

If you're migrating from the old services:

1. Replace `DatabaseService` with specific services:
   - Dictionary operations → `dictionaryService`
   - Word operations → `wordService`
   - Example operations → `exampleService`

2. Use the new result format:
   ```typescript
   // Old
   const words = await DatabaseService.getWords();
   
   // New
   const result = await wordService.searchWords({});
   const words = result.success ? result.data || [] : [];
   ```

3. Update imports:
   ```typescript
   // Old
   import { DatabaseService } from 'services';
   
   // New
   import { wordService, dictionaryService } from 'services/database';
   ```

This new architecture provides better separation of concerns, improved type safety, comprehensive error handling, and enhanced testing capabilities.