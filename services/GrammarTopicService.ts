import { openDatabase } from "./DatabaseService";
import { GrammarTopicEntity, LanguageCode } from "../interfaces/entities/GrammarTopicEntity";
import { GrammarTopicModel } from "../interfaces/models/GrammarTopicModel";

export class GrammarTopicService {
  // Получение всех тем
  static async getAll(): Promise<GrammarTopicModel[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<GrammarTopicEntity>(`
        SELECT * FROM grammar_topics ORDER BY id ASC
      `);

      return result || [];
    } catch (error) {
      console.error("Error getting all grammar topics:", error);
      return [];
    }
  }

  // Получение темы по ID
  static async getById(id: number): Promise<GrammarTopicModel | null> {
    const db = openDatabase();

    try {
      const result = await db.getFirstAsync<GrammarTopicEntity>(
        `
        SELECT * FROM grammar_topics WHERE id = ?
      `,
        [id],
      );

      return result || null;
    } catch (error) {
      console.error(`Error getting grammar topic with id ${id}:`, error);
      return null;
    }
  }

  // Получение тем по языку
  static async getByLanguage(language: LanguageCode): Promise<GrammarTopicModel[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<GrammarTopicEntity>(
        `
        SELECT * FROM grammar_topics WHERE language = ? ORDER BY id ASC
      `,
        [language],
      );

      return result || [];
    } catch (error) {
      console.error(
        `Error getting grammar topics for language ${language}:`,
        error,
      );
      return [];
    }
  }

  // Создание новой темы
  static async create(topic: Omit<GrammarTopicModel, "id">): Promise<number> {
    const db = openDatabase();

    try {
      const result = await db.runAsync(
        `
        INSERT INTO grammar_topics (topicId, language, title, description, content)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          topic.topicId,
          topic.language,
          topic.title,
          topic.description || null,
          topic.content,
        ],
      );

      return result && "lastInsertRowId" in result
        ? result.lastInsertRowId
        : -1;
    } catch (error) {
      console.error("Error creating grammar topic:", error);
      throw error;
    }
  }

  static async update(
    id: number,
    topic: Partial<Omit<GrammarTopicModel, "id">>,
  ): Promise<boolean> {
    const db = openDatabase();

    try {
      // Формируем SET часть запроса динамически
      const keys = Object.keys(topic) as Array<keyof Omit<GrammarTopicEntity, "id">>;
      if (keys.length === 0) return false;

      const setClause = keys.map((key) => `${key} = ?`).join(", ");

      // Фильтруем значения и гарантируем, что undefined заменяется на null
      const values = keys.map((key) => {
        const value = topic[key];
        return value === undefined ? null : value;
      });

      await db.runAsync(
        `
        UPDATE grammar_topics SET ${setClause} WHERE id = ?
      `,
        [...values, id],
      );

      return true;
    } catch (error) {
      console.error(`Error updating grammar topic with id ${id}:`, error);
      return false;
    }
  }

  // Удаление темы
  static async delete(id: number): Promise<boolean> {
    const db = openDatabase();

    try {
      await db.runAsync(
        `
        DELETE FROM grammar_topics WHERE id = ?
      `,
        [id],
      );

      return true;
    } catch (error) {
      console.error(`Error deleting grammar topic with id ${id}:`, error);
      return false;
    }
  }

  /**
   * Получение тем по topicId
   */
  static async getTopicsByTopicId(
    topicId: number | null,
    language?: LanguageCode,
  ): Promise<GrammarTopicModel[]> {
    const db = openDatabase();

    try {
      // Формируем SQL-запрос в зависимости от параметров
      let sql = `SELECT * FROM grammar_topics WHERE topicId ${topicId === null ? "IS NULL" : "= ?"}`;
      const params: any[] = topicId !== null ? [topicId] : [];

      // Если указан язык, добавляем его в условия
      if (language) {
        sql += ` AND language = ?`;
        params.push(language);
      }

      sql += ` ORDER BY language ASC`;

      const result = await db.getAllAsync<GrammarTopicEntity>(sql, params);
      return result || [];
    } catch (error) {
      console.error(`Error getting topics by topicId ${topicId}:`, error);
      return [];
    }
  }

  /**
   * Получение всех доступных языков для темы с указанным topicId
   */
  static async getAvailableLanguagesForTopic(
    topicId: number,
  ): Promise<LanguageCode[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<{ language: LanguageCode }>(
        `
      SELECT DISTINCT language FROM grammar_topics
      WHERE topicId = ?
      ORDER BY language ASC
    `,
        [topicId],
      );

      // Извлекаем только языки из результата
      return (result || []).map((item) => item.language);
    } catch (error) {
      console.error(
        `Error getting available languages for topic ${topicId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Получение всех уникальных основных тем (с topicId = null)
   */
  static async getUniqueMainTopicIds(): Promise<number[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<{ id: number }>(`
      SELECT id FROM grammar_topics
      WHERE topicId IS NULL
      ORDER BY id ASC
    `);

      return (result || []).map((item) => item.id);
    } catch (error) {
      console.error("Error getting unique main topic ids:", error);
      return [];
    }
  }

  /**
   * Получение переводов темы (тема и все её переводы)
   */
  static async getTranslationsForTopic(id: number): Promise<GrammarTopicModel[]> {
    const db = openDatabase();

    try {
      // Находим основную тему
      const topic = await this.getById(id);
      if (!topic) return [];

      // Если это тема с topicId = null, находим все её переводы
      if (topic.topicId === null) {
        // Убедитесь, что topic.id не undefined перед использованием
        if (topic.id === undefined) return [topic];

        const translations = await db.getAllAsync<GrammarTopicEntity>(
          `
            SELECT * FROM grammar_topics
            WHERE topicId = ?
            ORDER BY language ASC
          `,
          [topic.id],
        ); // topic.id гарантированно существует здесь

        return [topic, ...(translations || [])];
      }

      // Если это перевод, находим основную тему и все её переводы
      if (topic.topicId !== null) {
        const mainTopic = await this.getById(topic.topicId);
        if (!mainTopic) return [topic];

        // Убедитесь, что mainTopic.id и topic.id не undefined
        if (mainTopic.id === undefined) return [mainTopic, topic];

        const otherTranslations = await db.getAllAsync<GrammarTopicEntity>(
          `
            SELECT * FROM grammar_topics
            WHERE topicId = ? AND id != ?
            ORDER BY language ASC
          `,
          [mainTopic.id, topic.id || 0],
        ); // Обратите внимание на проверку topic.id

        return [mainTopic, topic, ...(otherTranslations || [])];
      }

      return [topic];
    } catch (error) {
      console.error(`Error getting translations for topic ${id}:`, error);
      return [];
    }
  }
}
