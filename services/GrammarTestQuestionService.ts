import { openDatabase } from "./DatabaseService";
import { GrammarTestQuestionEntity } from "../interfaces/entities/GrammarTestQuestionEntity";
import { mapGrammarTestQuestionEntityToModel } from "../interfaces/mappers/GrammarTestQuestionMapper";
import { GrammarTestQuestionModel } from "../interfaces/models/GrammarTestQuestionModel";

export class GrammarTestQuestionService {
  static async getAll(count: number): Promise<GrammarTestQuestionModel[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<GrammarTestQuestionEntity>(
        `
            SELECT * FROM grammar_test_questions ORDER BY id ASC
        `,
      );

      return (
        result?.map((item) => mapGrammarTestQuestionEntityToModel(item)) || []
      );
    } catch (error) {
      console.error("Error getting all grammar test questions:", error);
      return [];
    }
  }

  static async getAllByTestId(
    testId: number,
  ): Promise<GrammarTestQuestionModel[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<GrammarTestQuestionEntity>(
        `
            SELECT * FROM grammar_test_questions WHERE test_id = ?
        `,
        [testId],
      );

      return (
        result?.map((item) => mapGrammarTestQuestionEntityToModel(item)) || []
      );
    } catch (error) {
      console.error(
        `Error getting all grammar test questions for test with id ${testId}:`,
        error,
      );
      return [];
    }
  }

  static async getById(id: number): Promise<GrammarTestQuestionModel | null> {
    const db = openDatabase();

    try {
      const result = await db.getFirstAsync<GrammarTestQuestionEntity>(
        `
            SELECT * FROM grammar_test_questions WHERE id = ?
        `,
        [id],
      );

      return result ? mapGrammarTestQuestionEntityToModel(result) : null;
    } catch (error) {
      console.error(
        `Error getting grammar test question with id ${id}:`,
        error,
      );
      return null;
    }
  }

  static async create(
    question: Omit<GrammarTestQuestionModel, "id">,
  ): Promise<number> {
    const db = openDatabase();

    try {
      const result = await db.runAsync(
        `INSERT INTO grammar_test_questions (
            sentence,
            translation,
            answers,
            correctAnswer,
            testId
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          question.sentence,
          question.translation,
          JSON.stringify(question.answers),
          question.correctAnswer,
          question.testId,
        ],
      );

      return result && "lastInsertRowId" in result
        ? result.lastInsertRowId
        : -1;
    } catch (error) {
      console.error("Error creating grammar test:", error);
      throw error;
    }
  }

  static async update(
    id: number,
    question: Partial<Omit<GrammarTestQuestionModel, "id">>,
  ): Promise<boolean> {
    const db = openDatabase();

    try {
      // Формируем SET часть запроса динамически
      const keys = Object.keys(question) as Array<
        keyof Omit<GrammarTestQuestionEntity, "id">
      >;
      if (keys.length === 0) return false;

      const setClause = keys.map((key) => `${key} = ?`).join(", ");

      // Фильтруем значения и гарантируем, что undefined заменяется на null
      const values = keys.map((key) => {
        const value = question[key];
        return value === undefined ? null : value;
      });

      await db.runAsync(
        `
            UPDATE grammar_test_questions SET ${setClause} WHERE id = ?
        `,
        [...values, id] as any[],
      );

      return true;
    } catch (error) {
      console.error(`Error updating grammar test with id ${id}:`, error);
      return false;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const db = openDatabase();

    try {
      await db.runAsync(
        `
            DELETE FROM grammar_test_questions WHERE id = ?
        `,
        [id],
      );

      return true;
    } catch (error) {
      console.error(
        `Error deleting grammar test question with id ${id}:`,
        error,
      );
      return false;
    }
  }
}
