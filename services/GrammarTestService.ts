import { openDatabase } from "./DatabaseService";
import { GrammarTestEntity } from "../interfaces/entities/GrammarTestEntity";
import { GrammarTestModel } from "../interfaces/models/GrammarTestModel";

export class GrammarTestService {
  static async getAll(): Promise<GrammarTestModel[]> {
    const db = openDatabase();

    try {
      const result = await db.getAllAsync<GrammarTestEntity>(`
        SELECT * FROM grammar_tests ORDER BY id ASC
      `);

      return result || [];
    } catch (error) {
      console.error("Error getting all grammar tests:", error);
      return [];
    }
  }

  static async getById(id: number): Promise<GrammarTestModel | null> {
    const db = openDatabase();

    try {
      const result = await db.getFirstAsync<GrammarTestEntity>(
        `
        SELECT * FROM grammar_tests WHERE id = ?
      `,
        [id],
      );

      return result || null;
    } catch (error) {
      console.error(`Error getting grammar test with id ${id}:`, error);
      return null;
    }
  }

  static async create(test: Omit<GrammarTestModel, "id">): Promise<number> {
    const db = openDatabase();

    try {
      const result = await db.runAsync(
        `
        INSERT INTO grammar_tests (title, mask)
        VALUES (?, ?)
      `,
        [
          test.title,
          test.mask ?? null,
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
    test: Partial<Omit<GrammarTestModel, "id">>,
  ): Promise<boolean> {
    const db = openDatabase();

    try {
      // Формируем SET часть запроса динамически
      const keys = Object.keys(test) as Array<keyof Omit<GrammarTestEntity, "id">>;
      if (keys.length === 0) return false;

      const setClause = keys.map((key) => `${key} = ?`).join(", ");

      // Фильтруем значения и гарантируем, что undefined заменяется на null
      const values = keys.map((key) => {
        const value = test[key];
        return value === undefined ? null : value;
      });

      await db.runAsync(
        `
        UPDATE grammar_tests SET ${setClause} WHERE id = ?
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
        DELETE FROM grammar_tests WHERE id = ?
      `,
        [id],
      );

      return true;
    } catch (error) {
      console.error(`Error deleting grammar test with id ${id}:`, error);
      return false;
    }
  }
}
