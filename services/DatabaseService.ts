import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

// Открываем подключение к базе данных
export const openDatabase = () => {
  if (Platform.OS === "web") {
    // Заглушка для веб-платформы, т.к. SQLite не поддерживается в браузере
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
      closeAsync: () => {},
      execAsync: () => {},
      getFirstAsync: () => {},
      getAllAsync: () => {},
      runAsync: () => {},
    };
  }

  return SQLite.openDatabaseSync("easy_english.db");
};

// Инициализация базы данных - создание таблиц
export const initDatabase = async () => {
  const db = openDatabase();

  try {
    // Создаем таблицу для грамматических тем
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS grammar_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topicId INTEGER,
        language TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        guid TEXT,
        testId INTEGER
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS grammar_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mask TEXT NULL,
        guid TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS grammar_test_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentence TEXT NOT NULL,
        translation TEXT NOT NULL,
        answers TEXT NOT NULL,
        correctAnswer TEXT NOT NULL,
        testId INTEGER,
        FOREIGN KEY (testId) REFERENCES tests(id) ON DELETE CASCADE
      );
    `);

    await db.execAsync(
      `
      CREATE TABLE IF NOT EXISTS grammar_topic_tests (
        topicId INTEGER,
        testId INTEGER,
        FOREIGN KEY (topicId) REFERENCES grammar_topics(id) ON DELETE CASCADE,
        FOREIGN KEY (testId) REFERENCES grammar_tests(id) ON DELETE CASCADE
      );
    `
    );

    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};
