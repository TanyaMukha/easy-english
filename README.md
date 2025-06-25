# Easy English - Web Setup Instructions

## Проблема з браузерною версією

Ваш React Native додаток створений для мобільних пристроїв, але для роботи в браузері потрібні додаткові налаштування.

## Кроки для виправлення:

### 1. Оновити залежності

```bash
npm install react-dom@18.3.1 @types/react-dom@~18.3.1 i18next@^23.7.16 react-i18next@^14.0.0
```

### 2. Замінити файли

Замініть ці файли на нові версії, які я створив:

- `package.json` - додано `react-dom`, видалено `"type": "module"` для сумісності з Metro
- `metro.config.cjs` - конфігурація для веб-платформи (змінено розширення на .cjs)
- `app.json` - налаштування Expo для web
- `app/_layout.tsx` - правильна ініціалізація для всіх платформ
- `app/index.tsx` - головна сторінка з адаптивним дизайном

### 3. Створити нові файли

Створіть нову структуру папок та файлів:

```
src/
├── styles/
│   └── SharedStyles.ts
├── components/
│   └── common/
│       ├── LoadingState.tsx
│       └── ErrorState.tsx
├── i18n/
│   ├── config.ts
│   └── locales/
│       ├── uk.json
│       └── en.json
├── types/
│   └── index.ts
└── web/
    └── index.html
```

### 4. Перебудувати проект

```bash
# Очистити кеш
npx expo start --clear

# Запустити web версію
npx expo start --web
```

## Ключові покращення:

### ✅ Сумісність з браузером
- Додано `react-dom` для рендерингу в браузері
- Налаштовано Metro для підтримки веб-платформи
- Створено веб-специфічний HTML шаблон

### ✅ Адаптивний дизайн
- Спільні стилі працюють на всіх платформах
- Responsive дизайн для мобільних/планшетів/десктопів
- Темна тема за замовчуванням

### ✅ Правильна архітектура
- Розділені компоненти у окремі файли
- Один return в кожному компоненті
- Принципи SOLID
- TypeScript з сувора типізацією

### ✅ Інтернаціоналізація
- Підтримка української та англійської мов
- Автоматичне визначення мови пристрою
- Збереження вибраної мови

### ✅ Базові компоненти
- LoadingState та ErrorState компоненти
- Правильна обробка помилок
- Responsive navigation

## Використання стилів

```typescript
import { SharedStyles, Colors, getResponsiveStyle } from '../src/styles/SharedStyles';

// Використання спільних стилів
<View style={SharedStyles.container}>
  <Text style={SharedStyles.title}>Title</Text>
</View>

// Адаптивні стилі
const styles = {
  grid: {
    flexDirection: getResponsiveStyle('column', 'row') as 'row' | 'column',
  }
};

// Кольори для карток
const cardColor = getCardColor(PartOfSpeech.NOUN);
```

## Використання перекладів

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// В JSX
<Text>{t('navigation.home')}</Text>
<Text>{t('partOfSpeech.noun')}</Text>
```

## Особливості компонентів

### Правильний conditional rendering:

```typescript
// ❌ Неправильно
if (loading) {
  return <LoadingState />;
}
if (error) {
  return <ErrorState />;
}

// ✅ Правильно
return (
  <View>
    {loading && <LoadingState />}
    {error && <ErrorState />}
    {!loading && !error && (
      <View>
        {/* Основний контент */}
      </View>
    )}
  </View>
);
```

## Тестування

Після виконання цих кроків:

1. `npm run web` - повинен запуститися без помилок
2. Перевірте адаптивність на різних розмірах екрана
3. Протестуйте зміну мови
4. Перевірте, що все працює на мобільному (iOS/Android)

## Подальші кроки

1. Додати базу даних SQLite
2. Створити компоненти для карток
3. Імплементувати систему вивчення
4. Додати тести

Тепер ваш додаток повинен працювати однаково добре в браузері, на мобільному та планшеті.

## Можливі помилки та їх вирішення

### Помилка: "Module not found: react-dom"
```bash
npm install react-dom@18.3.1
```

### Помилка: "Metro config not found"
Переконайтеся, що файл `metro.config.cjs` знаходиться в кореневій папці проекту.

### Помилка: "ERR_REQUIRE_ESM"
Видаліть `"type": "module"` з package.json або перейменуйте metro.config.js на metro.config.cjs

### Помилка: "Cannot resolve @expo/vector-icons"
```bash
npx expo install @expo/vector-icons
```

### Помилка з SQLite на web
SQLite не працює в браузері. Потрібно буде додати fallback на IndexedDB або localStorage для web версії.

### Стилі не застосовуються на web
Переконайтеся, що ви використовуєте `StyleSheet.create()` та правильні властивості CSS для web.

## Структура проекту після налаштування

```
easy-english/
├── app/
│   ├── _layout.tsx          # Головний layout
│   ├── index.tsx            # Головна сторінка
│   ├── cards/
│   ├── practice/
│   ├── progress/
│   └── settings/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── cards/
│   │   ├── practice/
│   │   └── ui/
│   ├── styles/
│   │   └── SharedStyles.ts
│   ├── i18n/
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── uk.json
│   │       └── en.json
│   ├── types/
│   │   └── index.ts
│   ├── database/
│   │   ├── schema.ts
│   │   └── queries.ts
│   └── utils/
├── web/
│   └── index.html
├── assets/
├── package.json
├── metro.config.js
├── app.json
└── tsconfig.json
```

## Наступні компоненти для створення

### 1. Компонент картки слова
```typescript
// src/components/cards/WordCard.tsx
interface WordCardProps {
  card: Card;
  showTranslation?: boolean;
  onFlip?: () => void;
  onAction?: (action: 'easy' | 'good' | 'again') => void;
}
```

### 2. Список карток
```typescript
// src/components/cards/CardList.tsx
interface CardListProps {
  cards: Card[];
  filters?: CardFilters;
  onCardPress?: (card: Card) => void;
}
```

### 3. Практика
```typescript
// src/components/practice/PracticeSession.tsx
interface PracticeSessionProps {
  cards: Card[];
  mode: 'flashcards' | 'quiz' | 'typing';
  onComplete?: (results: SessionResults) => void;
}
```

### 4. Статистика
```typescript
// src/components/progress/ProgressChart.tsx
interface ProgressChartProps {
  data: LearningStats[];
  period: 'week' | 'month' | 'year';
}
```

## Рекомендації для подальшої розробки

### TypeScript
- Завжди типізуйте пропси компонентів
- Використовуйте строгий режим TypeScript
- Створюйте інтерфейси для всіх даних

### Стилі
- Використовуйте SharedStyles для базових елементів
- Створюйте themed компоненти
- Тестуйте на різних розмірах екранів

### Продуктивність
- Використовуйте React.memo для дорогих компонентів
- Імплементуйте віртуалізацію для великих списків
- Оптимізуйте зображення та асети

### Доступність
- Додавайте accessibilityLabel до інтерактивних елементів
- Використовуйте семантичні кольори
- Тестуйте з screen readers

### Тестування
- Unit тести для утиліт та хуків
- Component тести для UI
- E2E тести для критичних флоу

Удачі у розробці! 🚀