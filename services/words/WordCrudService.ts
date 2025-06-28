// services/words/WordCrudService.ts
/**
 * Word CRUD Service - основні операції з словами
 * Single Responsibility: Тільки CRUD операції (Create, Read, Update, Delete)
 */

import { Platform } from "react-native";

import { ExampleService } from "./ExampleService";
import { DatabaseService } from "../DatabaseService";
import { MockDataService } from "../MockDataService";
import {
  Dictionary,
  LanguageCode,
  Level,
  PartOfSpeech,
  Word,
  WordWithExamples,
} from "../../data/DataModels";
import { generateGuid } from "../../utils/guid";

export interface CreateWordRequest {
  word: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  dictionaryId: number;
}

export interface UpdateWordRequest {
  word?: string;
  transcription?: string;
  translation?: string;
  explanation?: string;
  definition?: string;
  partOfSpeech?: PartOfSpeech;
  language?: LanguageCode;
  level?: Level;
  isIrregular?: boolean;
  dictionaryId?: number;
}

export interface WordResponse {
  success: boolean;
  data?: WordWithExamples;
  error?: string;
}

export class WordCrudService {
  /**
   * Get word by ID
   */
  static async getById(id: number): Promise<WordResponse> {
    try {
      await MockDataService.delay(50);

      if (Platform.OS === "web") {
        const word = MockDataService.mockWords.find((w) => w.id === id);

        if (!word) {
          return { success: false, error: "Word not found" };
        }

        return { success: true, data: word } as WordResponse;
      } else {
        const db = await DatabaseService.getDatabase();

        const word = await db.getFirstAsync(
          `
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          WHERE w.id = ?
        `,
          [id],
        );

        if (!word) {
          return { success: false, error: "Word not found" };
        }

        const examples = await ExampleService.getByWordId(id);

        const wordWithExamples: WordWithExamples = {
          ...word,
          isIrregular: Boolean((word as any).isIrregular),
          examples: examples.data || [],
          tags: [],
          dictionary: {
            id: (word as any).dictionaryId,
            title: (word as any).dictionaryTitle,
          },
          nextReviewDate: null,
        };

        return { success: true, data: wordWithExamples };
      }
    } catch (error) {
      console.error("Error getting word by ID:", error);
      return { success: false, error: "Failed to retrieve word" };
    }
  }

  /**
   * Create new word
   */
  static async create(request: CreateWordRequest): Promise<WordResponse> {
    try {
      await MockDataService.delay(100);

      const now = new Date().toISOString();
      const guid = generateGuid();

      if (Platform.OS === "web") {
        const nextId = MockDataService.getNextId("word");

        // Get dictionary info
        const dictionary = MockDataService.mockDictionaries.find(
          (d) => d.id === request.dictionaryId,
        );
        if (!dictionary) {
          return { success: false, error: "Dictionary not found" };
        }

        const newWord: Word = {
          id: nextId,
          guid,
          word: request.word.trim(),
          transcription: request.transcription?.trim() || null,
          translation: request.translation?.trim() || null,
          explanation: request.explanation?.trim() || null,
          definition: request.definition?.trim() || null,
          partOfSpeech: request.partOfSpeech,
          language: request.language || LanguageCode.EN_GB,
          level: request.level || Level.A1,
          isIrregular: request.isIrregular || false,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
          dictionaryId: request.dictionaryId,
        } as Word;

        const wordWithExamples: WordWithExamples = {
          ...newWord,
          examples: [],
          tags: [],
          dictionary: { id: dictionary.id, title: dictionary.title } as Dictionary,
          nextReviewDate: null,
        };

        MockDataService.mockWords.push(wordWithExamples);

        return { success: true, data: wordWithExamples };
      } else {
        const db = await DatabaseService.getDatabase();

        // Check if dictionary exists
        const dictionary = await db.getFirstAsync(
          "SELECT id, title FROM dictionaries WHERE id = ?",
          [request.dictionaryId],
        );

        if (!dictionary) {
          return { success: false, error: "Dictionary not found" };
        }

        // Insert word
        const result = await db.runAsync(
          `
          INSERT INTO words (
            guid, word, transcription, translation, explanation, definition,
            partOfSpeech, language, level, isIrregular, dictionaryId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            guid,
            request.word.trim(),
            request.transcription?.trim() || null,
            request.translation?.trim() || null,
            request.explanation?.trim() || null,
            request.definition?.trim() || null,
            request.partOfSpeech,
            request.language || LanguageCode.EN_GB,
            request.level || Level.A1,
            request.isIrregular ? 1 : 0,
            request.dictionaryId,
            now,
            now,
          ],
        );

        const wordId = result.lastInsertRowId;

        const newWord: WordWithExamples = {
          id: Number(wordId),
          guid,
          word: request.word.trim(),
          transcription: request.transcription?.trim() || null,
          translation: request.translation?.trim() || null,
          explanation: request.explanation?.trim() || null,
          definition: request.definition?.trim() || null,
          partOfSpeech: request.partOfSpeech,
          language: request.language || LanguageCode.EN_GB,
          level: request.level || Level.A1,
          isIrregular: request.isIrregular || false,
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          createdAt: now,
          updatedAt: now,
          dictionaryId: request.dictionaryId,
          examples: [],
          tags: [],
          dictionary: {
            id: (dictionary as any).id,
            title: (dictionary as any).title,
          } as Dictionary,
          nextReviewDate: null,
        } as WordWithExamples;

        return { success: true, data: newWord };
      }
    } catch (error) {
      console.error("Error creating word:", error);
      return { success: false, error: "Failed to create word" };
    }
  }

  /**
   * Update existing word
   */
  static async update(
    id: number,
    request: UpdateWordRequest,
  ): Promise<WordResponse> {
    try {
      await MockDataService.delay(100);

      const now = new Date().toISOString();

      if (Platform.OS === "web") {
        const wordIndex = MockDataService.mockWords.findIndex(
          (w) => w.id === id,
        );

        if (wordIndex === -1) {
          return { success: false, error: "Word not found" };
        }

        const currentWord = MockDataService.mockWords[wordIndex];
        const updatedWord: WordWithExamples = {
          ...currentWord,
          ...(request.word !== undefined && { word: request.word.trim() }),
          ...(request.transcription !== undefined && {
            transcription: request.transcription?.trim() || null,
          }),
          ...(request.translation !== undefined && {
            translation: request.translation?.trim() || null,
          }),
          ...(request.explanation !== undefined && {
            explanation: request.explanation?.trim() || null,
          }),
          ...(request.definition !== undefined && {
            definition: request.definition?.trim() || null,
          }),
          ...(request.partOfSpeech && { partOfSpeech: request.partOfSpeech }),
          ...(request.language && { language: request.language }),
          ...(request.level && { level: request.level }),
          ...(request.isIrregular !== undefined && {
            isIrregular: request.isIrregular,
          }),
          ...(request.dictionaryId && { dictionaryId: request.dictionaryId }),
          updatedAt: now,
        } as WordWithExamples;

        // Update dictionary reference if dictionaryId changed
        if (request.dictionaryId) {
          const dictionary = MockDataService.mockDictionaries.find(
            (d) => d.id === request.dictionaryId,
          );
          if (dictionary) {
            updatedWord.dictionary = {
              id: dictionary.id,
              title: dictionary.title,
            } as Dictionary;
          }
        }

        MockDataService.mockWords[wordIndex] = updatedWord;

        return { success: true, data: updatedWord };
      } else {
        const db = await DatabaseService.getDatabase();

        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];

        if (request.word !== undefined) {
          updateFields.push("word = ?");
          values.push(request.word.trim());
        }

        if (request.transcription !== undefined) {
          updateFields.push("transcription = ?");
          values.push(request.transcription?.trim() || null);
        }

        if (request.translation !== undefined) {
          updateFields.push("translation = ?");
          values.push(request.translation?.trim() || null);
        }

        if (request.explanation !== undefined) {
          updateFields.push("explanation = ?");
          values.push(request.explanation?.trim() || null);
        }

        if (request.definition !== undefined) {
          updateFields.push("definition = ?");
          values.push(request.definition?.trim() || null);
        }

        if (request.partOfSpeech) {
          updateFields.push("partOfSpeech = ?");
          values.push(request.partOfSpeech);
        }

        if (request.language) {
          updateFields.push("language = ?");
          values.push(request.language);
        }

        if (request.level) {
          updateFields.push("level = ?");
          values.push(request.level);
        }

        if (request.isIrregular !== undefined) {
          updateFields.push("isIrregular = ?");
          values.push(request.isIrregular ? 1 : 0);
        }

        if (request.dictionaryId) {
          updateFields.push("dictionaryId = ?");
          values.push(request.dictionaryId);
        }

        if (updateFields.length > 0) {
          updateFields.push("updatedAt = ?");
          values.push(now);
          values.push(id);

          await db.runAsync(
            `UPDATE words SET ${updateFields.join(", ")} WHERE id = ?`,
            values,
          );
        }

        // Get updated word
        return this.getById(id);
      }
    } catch (error) {
      console.error("Error updating word:", error);
      return { success: false, error: "Failed to update word" };
    }
  }

  /**
   * Delete word
   */
  static async delete(
    id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(50);

      if (Platform.OS === "web") {
        const wordIndex = MockDataService.mockWords.findIndex(
          (w) => w.id === id,
        );

        if (wordIndex === -1) {
          return { success: false, error: "Word not found" };
        }

        // Remove word, its examples, and set relationships
        MockDataService.mockWords.splice(wordIndex, 1);
        MockDataService.mockExamples = MockDataService.mockExamples.filter(
          (e) => e.wordId !== id,
        );
        MockDataService.mockSetWords = MockDataService.mockSetWords.filter(
          (sw) => sw.wordId !== id,
        );

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();

        // Delete examples first (foreign key constraint)
        await db.runAsync("DELETE FROM examples WHERE wordId = ?", [id]);

        // Delete set-word relationships
        await db.runAsync("DELETE FROM set_words WHERE wordId = ?", [id]);

        // Delete word
        const result = await db.runAsync("DELETE FROM words WHERE id = ?", [
          id,
        ]);

        if (result.changes === 0) {
          return { success: false, error: "Word not found" };
        }

        return { success: true };
      }
    } catch (error) {
      console.error("Error deleting word:", error);
      return { success: false, error: "Failed to delete word" };
    }
  }
}
