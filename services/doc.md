# Database Services Documentation

Повна документація для сервісів бази даних додатку Easy English з підтримкою мок-даних для веб-платформи.

## 📋 Огляд

Система сервісів розроблена з дотриманням принципів SOLID і включає:

- 🔧 **DatabaseService** - управління підключенням до БД з автоматичним визначенням платформи
- 🎭 **MockDataService** - мок-дані для веб-платформи та розробки
- 📚 **DictionaryService** - CRUD операції для словників
- 📝 **WordService** - повне управління словами з прикладами
- 📑 **SetService** - робота з наборами слів для навчання

## 🏗️ Архітектура

### Platform Detection
```typescript
// Автоматичне визначення платформи
if (Platform.OS === "web") {
  // Використовуємо мок-дані
  return MockDataService.mockWords;
} else {
  // Використовуємо SQLite
  return await db.getAllAsync('SELECT * FROM words');
}
```

### SOLID Principles
- **Single Responsibility**: Кожен сервіс відповідає за одну сутність
- **Open/Closed**: Легко розширювати без зміни існуючого коду
- **Dependency Inversion**: Абстракція операцій з БД через інтерфейси

## 🚀 Швидкий старт

### Ініціалізація
```typescript
import { initializeDatabase, DatabaseService } from '@/services';

// Ініціалізація при запуску додатку
await initializeDatabase();

// Перевірка платформи
if (DatabaseService.isWeb()) {
  console.log('Running on web with mock data');
} else {
  console.log('Running on native with SQLite');
}
```

### Базове використання
```typescript
import { DictionaryService, WordService, SetService } from '@/services';

// Створення словника
const dictResult = await DictionaryService.create({
  title: "Business English"
});

// Додавання слова
const wordResult = await WordService.create({
  word: "meeting",
  translation: "зустріч",
  partOfSpeech: PartOfSpeech.NOUN,
  dictionaryId: dictResult.data!.id,
  examples: [
    {
      sentence: "We have a meeting at 3 PM",
      translation: "У нас нарада о 15:00"
    }
  ]
});

// Створення набору слів
const setResult = await SetService.create({
  title: "Business Vocabulary",
  description: "Essential business terms"
});

// Додавання слова до набору
await SetService.addWordToSet({
  setId: setResult.data!.id,
  wordId: wordResult.data!.id
});
```

## 📚 DictionaryService

### Методи
```typescript
// Отримати всі словники
const dictionaries = await DictionaryService.getAll();

// Отримати словник за ID
const dictionary = await DictionaryService.getById(1);

// Створити новий словник
const newDict = await DictionaryService.create({
  title: "Travel Vocabulary"
});

// Оновити словник
const updated = await DictionaryService.update(1, {
  title: "Updated Title"
});

// Видалити словник (з усіма словами!)
await DictionaryService.delete(1);

// Статистика словника
const stats = await DictionaryService.getStatistics(1);
// Повертає: { wordCount: 25, reviewCount: 150 }
```

### Response Format
```typescript
interface DictionaryResponse {
  success: boolean;
  data?: Dictionary;
  error?: string;
}
```

## 📝 WordService

### Основні операції
```typescript
// Отримати слова з фільтрацією
const words = await WordService.getAll({
  dictionaryId: 1,
  search: "business",
  partOfSpeech: [PartOfSpeech.NOUN, PartOfSpeech.VERB],
  level: Level.B1,
  limit: 20,
  offset: 0,
  sortBy: 'word',
  sortOrder: 'asc'
});

// Створити слово з прикладами
const word = await WordService.create({
  word: "presentation",
  transcription: "ˌprezənˈteɪʃən",
  translation: "презентація",
  explanation: "Формальне представлення інформації",
  partOfSpeech: PartOfSpeech.NOUN,
  level: Level.B1,
  dictionaryId: 1,
  examples: [
    {
      sentence: "She gave an excellent presentation",
      translation: "Вона зробила відмінну презентацію"
    }
  ]
});

// Пошук слів
const searchResults = await WordService.search("business", 10);

// Випадкові слова для практики
const randomWords = await WordService.getRandomWords(5, {
  level: Level.A2,
  partOfSpeech: [PartOfSpeech.VERB]
});

// Оновлення статистики після вивчення
await WordService.updateReviewStats(wordId, 4); // rate 0-5
```

### Фільтри
```typescript
interface WordFilters {
  dictionaryId?: number;           // Фільтр по словнику
  search?: string;                 // Пошук по слову/перекладу/поясненню
  partOfSpeech?: PartOfSpeech[];   // Частини мови
  language?: LanguageCode;         // Мова
  level?: Level;                   // Рівень складності
  isIrregular?: boolean;           // Неправильні форми
  limit?: number;                  // Кількість результатів
  offset?: number;                 // Зсув для пагінації
  sortBy?: 'word' | 'createdAt' | 'reviewCount' | 'rate';
  sortOrder?: 'asc' | 'desc';
}
```

## 📑 SetService

### Управління наборами
```typescript
// Створити набір
const set = await SetService.create({
  title: "Daily Vocabulary",
  description: "Words for everyday conversations"
});

// Отримати набір зі словами
const setWithWords = await SetService.getSetWithWords(setId);

// Додати слово до набору
await SetService.addWordToSet({
  setId: 1,
  wordId: 5
});

// Видалити слово з набору
await SetService.removeWordFromSet({
  setId: 1,
  wordId: 5
});

// Знайти набори, що містять слово
const sets = await SetService.getSetsContainingWord(wordId);

// Статистика набору
const stats = await SetService.getStatistics(setId);
```

## 🎭 MockDataService

### Мок-дані для розробки
```typescript
// Отримати статистику
const stats = MockDataService.getStatistics();
// Повертає: { dictionaries: 4, words: 10, examples: 11, sets: 4, tags: 5, setWords: 11 }

// Генерувати новий ID
const nextId = MockDataService.getNextId('word');

// Генерувати GUID
const guid = MockDataService.generateGuid();

// Симуляція затримки API
await MockDataService.delay(150);
```

### Структура мок-даних
- **4 словники**: Business, Travel, Daily, Academic
- **10 слів**: різних частин мови з прикладами
- **11 прикладів**: реальні речення з перекладами
- **4 набори**: з різними словами
- **5 тегів**: для категоризації

## 🔧 DatabaseService

### Платформо-специфічні операції
```typescript
// Ініціалізація БД
const db = await DatabaseService.initialize();

// Перевірка платформи
if (DatabaseService.isWeb()) {
  // Веб-платформа - використовуємо мок-дані
} else {
  // Нативна платформа - SQLite
}

// Отримання інстансу БД
const database = await DatabaseService.getDatabase();

// Закриття підключення
await DatabaseService.close();
```

### Структура таблиць SQLite
```sql
-- Словники
CREATE TABLE dictionaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  createdAt TEXT NULL,
  updatedAt TEXT NULL
);

-- Слова
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT NOT NULL UNIQUE,
  word TEXT NOT NULL,
  transcription TEXT,
  translation TEXT,
  explanation TEXT,
  definition TEXT,
  partOfSpeech TEXT NOT NULL,
  language TEXT DEFAULT 'en-gb',
  level TEXT DEFAULT 'A1',
  isIrregular BOOLEAN DEFAULT 0,
  pronunciation BLOB,
  lastReviewDate TEXT,
  reviewCount INTEGER DEFAULT 0,
  rate INTEGER DEFAULT 0,
  createdAt TEXT NULL,
  updatedAt TEXT NULL,
  dictionaryId INTEGER,
  FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id)
);

-- Приклади
CREATE TABLE examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT NOT NULL UNIQUE,
  sentence TEXT NOT NULL,
  translation TEXT,
  wordId INTEGER,
  createdAt TEXT NULL,
  updatedAt TEXT NULL,
  FOREIGN KEY (wordId) REFERENCES words(id)
);

-- Набори слів
CREATE TABLE sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  lastReviewDate TEXT,
  reviewCount INTEGER DEFAULT 0,
  rate INTEGER DEFAULT 0,
  createdAt TEXT NULL,
  updatedAt TEXT NULL
);

-- Зв'язки набір-слово
CREATE TABLE set_words (
  setId INTEGER,
  wordId INTEGER,
  PRIMARY KEY (setId, wordId),
  FOREIGN KEY (setId) REFERENCES sets(id),
  FOREIGN KEY (wordId) REFERENCES words(id)
);
```

## 🛠️ Utilities

### Перевірка здоров'я сервісів
```typescript
import { checkServicesHealth } from '@/services';

const health = await checkServicesHealth();
// Повертає: { database: true, dictionary: true, word: true, set: true }
```

### Статистика системи
```typescript
import { getServiceStatistics } from '@/services';

const stats = await getServiceStatistics();
console.log(`Total words: ${stats.words}`);
console.log(`Total dictionaries: ${stats.dictionaries}`);
```

## 📊 Error Handling

Всі сервіси повертають стандартизований формат відповіді:

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Використання
const result = await WordService.create(wordData);
if (result.success) {
  console.log('Word created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## 🔒 Валідація

### Автоматична валідація
- **Довжина рядків**: обмеження для всіх текстових полів
- **Обов'язкові поля**: перевірка наявності
- **Enum значення**: валідація PartOfSpeech, Level, LanguageCode
- **Формат даних**: перевірка типів

### Приклади помилок валідації
```typescript
// Помилка: слово задовге
{
  success: false,
  error: "Word too long (max 100 characters)"
}

// Помилка: некоректна частина мови  
{
  success: false,
  error: "Invalid part of speech"
}
```

## 🧪 Тестування

### Mock Data для тестів
```typescript
// Використання в тестах
import { MockDataService } from '@/services';

beforeEach(() => {
  // Скидання мок-даних перед кожним тестом
  MockDataService.resetMockData();
});

test('should create word', async () => {
  const result = await WordService.create(mockWordData);
  expect(result.success).toBe(true);
  expect(result.data?.word).toBe(mockWordData.word);
});
```

## 🚀 Продуктивність

### Оптимізація запитів
- **Пагінація**: підтримка limit/offset
- **Індекси**: автоматичне індексування в SQLite
- **Lazy loading**: приклади завантажуються разом зі словами
- **Кешування**: мок-дані зберігаються в пам'яті

### Симуляція затримок
```typescript
// Реалістичні затримки для мок-даних
await MockDataService.delay(100);  // Звичайні операції
await MockDataService.delay(150);  // Складні запити
```

## 📱 Platform Differences

### Web Platform (Mock Data)
- ✅ Швидка розробка та тестування
- ✅ Не потребує налаштування БД
- ✅ Реалістичні дані для демо
- ❌ Дані не зберігаються між сесіями

### Native Platform (SQLite)
- ✅ Постійне зберігання даних
- ✅ Повна функціональність БД
- ✅ Швидкі запити з індексами
- ❌ Потребує налаштування файлової системи

## 🔄 Migration Strategy

### Перехід з мок-даних на SQLite
1. Дані автоматично синхронізуються при першому запуску
2. Імпорт мок-даних в реальну БД
3. Поступове відключення мок-функціональності

```typescript
// Приклад міграції
if (DatabaseService.isWeb() && shouldMigrate) {
  await migrateMockDataToSQLite();
}
```

---

## 🎯 Приклади використання

### Створення повного словника
```typescript
// 1. Створюємо словник
const dict = await DictionaryService.create({
  title: "IT Vocabulary"
});

// 2. Додаємо слова
const words = await Promise.all([
  WordService.create({
    word: "algorithm",
    translation: "алгоритм",
    partOfSpeech: PartOfSpeech.NOUN,
    level: Level.B2,
    dictionaryId: dict.data!.id,
    examples: [{
      sentence: "This algorithm is very efficient",
      translation: "Цей алгоритм дуже ефективний"
    }]
  }),
  WordService.create({
    word: "debug",
    translation: "налагоджувати",
    partOfSpeech: PartOfSpeech.VERB,
    level: Level.B1,
    dictionaryId: dict.data!.id
  })
]);

// 3. Створюємо набір для вивчення
const studySet = await SetService.create({
  title: "IT Basics",
  description: "Basic IT terminology"
});

// 4. Додаємо слова до набору
for (const word of words) {
  if (word.success) {
    await SetService.addWordToSet({
      setId: studySet.data!.id,
      wordId: word.data!.id
    });
  }
}
```

### Система навчання
```typescript
// Отримати випадкові слова для практики
const practiceWords = await WordService.getRandomWords(10, {
  level: Level.A2,
  dictionaryId: 1
});

// Після відповіді користувача
for (const word of practiceWords.data || []) {
  const userRating = getUserRating(); // 1-5
  await WordService.updateReviewStats(word.id, userRating);
}

// Статистика прогресу
const stats = await DictionaryService.getStatistics(dictionaryId);
console.log(`Reviewed ${stats.data?.reviewCount} times`);
```

Ця система сервісів забезпечує повну функціональність для роботи з даними додатку Easy English з автоматичною підтримкою як веб-платформи (з мок-даними), так і нативних платформ (з SQLite).