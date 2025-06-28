// services/words/ExampleService.ts
/**
 * Example Service - управління прикладами використання слів
 * Single Responsibility: Тільки операції з прикладами
 */

import { Platform } from 'react-native';
import { Example } from "../../data/DataModels";
import { DatabaseService } from "../DatabaseService";
import { MockDataService } from "../MockDataService";
import { generateGuid } from "../../utils/guid";

export interface CreateExampleRequest {
  sentence: string;
  translation?: string | undefined;
  wordId: number;
}

export interface UpdateExampleRequest {
  sentence?: string;
  translation?: string;
}

export interface ExampleResponse {
  success: boolean;
  data?: Example;
  error?: string;
}

export interface ExamplesListResponse {
  success: boolean;
  data?: Example[];
  error?: string;
}

export class ExampleService {
  /**
   * Get examples by word ID
   */
  static async getByWordId(wordId: number): Promise<ExamplesListResponse> {
    try {
      await MockDataService.delay(30);

      if (Platform.OS === "web") {
        const examples = MockDataService.mockExamples.filter(e => e.wordId === wordId);
        return { success: true, data: examples };
      } else {
        const db = await DatabaseService.getDatabase();
        const examples = await db.getAllAsync(
          'SELECT * FROM examples WHERE wordId = ? ORDER BY createdAt ASC',
          [wordId]
        );

        return { success: true, data: examples };
      }
    } catch (error) {
      console.error('Error getting examples:', error);
      return { success: false, error: "Failed to retrieve examples" };
    }
  }

  /**
   * Create new example
   */
  static async create(request: CreateExampleRequest): Promise<ExampleResponse> {
    try {
      await MockDataService.delay(50);

      const now = new Date().toISOString();
      const guid = generateGuid();

      if (Platform.OS === "web") {
        const nextId = MockDataService.getNextId('example');
        
        const newExample: Example = {
          id: nextId,
          guid,
          sentence: request.sentence.trim(),
          translation: request.translation?.trim() || null,
          wordId: request.wordId,
          createdAt: now,
          updatedAt: now,
        };

        MockDataService.mockExamples.push(newExample);

        return { success: true, data: newExample };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const result = await db.runAsync(
          'INSERT INTO examples (guid, sentence, translation, wordId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [guid, request.sentence.trim(), request.translation?.trim() || null, request.wordId, now, now]
        );

        const exampleId = result.lastInsertRowId;

        const newExample: Example = {
          id: Number(exampleId),
          guid,
          sentence: request.sentence.trim(),
          translation: request.translation?.trim() || null,
          wordId: request.wordId,
          createdAt: now,
          updatedAt: now,
        };

        return { success: true, data: newExample };
      }
    } catch (error) {
      console.error('Error creating example:', error);
      return { success: false, error: "Failed to create example" };
    }
  }

  /**
   * Update example
   */
  static async update(id: number, request: UpdateExampleRequest): Promise<ExampleResponse> {
    try {
      await MockDataService.delay(50);

      const now = new Date().toISOString();

      if (Platform.OS === "web") {
        const exampleIndex = MockDataService.mockExamples.findIndex(e => e.id === id);
        
        if (exampleIndex === -1) {
          return { success: false, error: "Example not found" };
        }

        const updatedExample: Example = {
          ...MockDataService.mockExamples[exampleIndex],
          ...(request.sentence !== undefined && { sentence: request.sentence.trim() }),
          ...(request.translation !== undefined && { translation: request.translation?.trim() || null }),
          updatedAt: now,
        } as Example;

        MockDataService.mockExamples[exampleIndex] = updatedExample;

        return { success: true, data: updatedExample };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const updateFields: string[] = [];
        const values: any[] = [];

        if (request.sentence !== undefined) {
          updateFields.push('sentence = ?');
          values.push(request.sentence.trim());
        }

        if (request.translation !== undefined) {
          updateFields.push('translation = ?');
          values.push(request.translation?.trim() || null);
        }

        if (updateFields.length > 0) {
          updateFields.push('updatedAt = ?');
          values.push(now);
          values.push(id);

          await db.runAsync(
            `UPDATE examples SET ${updateFields.join(', ')} WHERE id = ?`,
            values
          );
        }

        const updated = await db.getFirstAsync('SELECT * FROM examples WHERE id = ?', [id]);
        
        if (!updated) {
          return { success: false, error: "Example not found" };
        }

        return { success: true, data: updated };
      }
    } catch (error) {
      console.error('Error updating example:', error);
      return { success: false, error: "Failed to update example" };
    }
  }

  /**
   * Delete example
   */
  static async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(30);

      if (Platform.OS === "web") {
        const exampleIndex = MockDataService.mockExamples.findIndex(e => e.id === id);
        
        if (exampleIndex === -1) {
          return { success: false, error: "Example not found" };
        }

        MockDataService.mockExamples.splice(exampleIndex, 1);

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const result = await db.runAsync('DELETE FROM examples WHERE id = ?', [id]);

        if (result.changes === 0) {
          return { success: false, error: "Example not found" };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting example:', error);
      return { success: false, error: "Failed to delete example" };
    }
  }

  /**
   * Bulk create examples for a word
   */
  static async createBulk(wordId: number, examples: Array<{ sentence: string; translation?: string }>): Promise<ExamplesListResponse> {
    try {
      const createdExamples: Example[] = [];

      for (const exampleData of examples) {
        if (exampleData.sentence.trim()) {
          const result = await this.create({
            sentence: exampleData.sentence,
            translation: exampleData.translation,
            wordId,
          });

          if (result.success && result.data) {
            createdExamples.push(result.data);
          }
        }
      }

      return { success: true, data: createdExamples };
    } catch (error) {
      console.error('Error creating bulk examples:', error);
      return { success: false, error: "Failed to create examples" };
    }
  }

  /**
   * Replace all examples for a word
   */
  static async replaceForWord(wordId: number, examples: Array<{ sentence: string; translation?: string }>): Promise<ExamplesListResponse> {
    try {
      // Delete existing examples
      if (Platform.OS === "web") {
        MockDataService.mockExamples = MockDataService.mockExamples.filter(e => e.wordId !== wordId);
      } else {
        const db = await DatabaseService.getDatabase();
        await db.runAsync('DELETE FROM examples WHERE wordId = ?', [wordId]);
      }

      // Create new examples
      return this.createBulk(wordId, examples);
    } catch (error) {
      console.error('Error replacing examples:', error);
      return { success: false, error: "Failed to replace examples" };
    }
  }
}
