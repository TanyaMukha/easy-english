// services/words/WordProgressService.ts
/**
 * Word Progress Service - статистика та прогрес навчання
 * Single Responsibility: Тільки робота з прогресом навчання
 */

import { Platform } from 'react-native';
import { DatabaseService } from "../DatabaseService";
import { MockDataService } from "../MockDataService";
import { Word } from 'data/DataModels';

export class WordProgressService {
  /**
   * Update word review statistics and progress
   */
  static async updateProgress(id: number, correct: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(50);

      const now = new Date().toISOString();

      if (Platform.OS === "web") {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return { success: false, error: "Word not found" };
        }

        const currentWord = MockDataService.mockWords[wordIndex];
        const currentRate = currentWord?.rate || 0;
        
        // Update rate based on correct/incorrect answer
        let newRate = currentRate;
        if (correct) {
          newRate = Math.min(currentRate + 1, 5);
        } else {
          newRate = Math.max(currentRate - 1, 0);
        }

        MockDataService.mockWords[wordIndex] = {
          ...currentWord,
          lastReviewDate: now,
          reviewCount: (currentWord?.reviewCount ?? 0) + 1,
          rate: newRate,
          updatedAt: now,
        } as Word;

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        // Get current rate to calculate new rate
        const currentWord = await db.getFirstAsync(
          'SELECT rate FROM words WHERE id = ?',
          [id]
        );

        if (!currentWord) {
          return { success: false, error: "Word not found" };
        }

        const currentRate = (currentWord as any).rate || 0;
        let newRate = currentRate;
        
        if (correct) {
          newRate = Math.min(currentRate + 1, 5);
        } else {
          newRate = Math.max(currentRate - 1, 0);
        }

        const result = await db.runAsync(`
          UPDATE words 
          SET lastReviewDate = ?, reviewCount = reviewCount + 1, rate = ?, updatedAt = ?
          WHERE id = ?
        `, [now, newRate, now, id]);

        if (result.changes === 0) {
          return { success: false, error: "Word not found" };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating word progress:', error);
      return { success: false, error: "Failed to update word progress" };
    }
  }

  /**
   * Update review stats with custom rate
   */
  static async updateReviewStats(id: number, rate: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(50);

      const now = new Date().toISOString();
      const clampedRate = Math.max(0, Math.min(5, rate)); // Clamp between 0-5

      if (Platform.OS === "web") {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return { success: false, error: "Word not found" };
        }

        MockDataService.mockWords[wordIndex] = {
          ...MockDataService.mockWords[wordIndex],
          lastReviewDate: now,
          reviewCount: (MockDataService.mockWords[wordIndex]?.reviewCount ?? 0) + 1,
          rate: clampedRate,
          updatedAt: now,
        } as Word;

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const result = await db.runAsync(`
          UPDATE words 
          SET lastReviewDate = ?, reviewCount = reviewCount + 1, rate = ?, updatedAt = ?
          WHERE id = ?
        `, [now, clampedRate, now, id]);

        if (result.changes === 0) {
          return { success: false, error: "Word not found" };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating review stats:', error);
      return { success: false, error: "Failed to update review statistics" };
    }
  }

  /**
   * Reset word progress
   */
  static async resetProgress(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await MockDataService.delay(50);

      const now = new Date().toISOString();

      if (Platform.OS === "web") {
        const wordIndex = MockDataService.mockWords.findIndex(w => w.id === id);
        
        if (wordIndex === -1) {
          return { success: false, error: "Word not found" };
        }

        MockDataService.mockWords[wordIndex] = {
          ...MockDataService.mockWords[wordIndex],
          lastReviewDate: null,
          reviewCount: 0,
          rate: 0,
          updatedAt: now,
        } as Word;

        return { success: true };
      } else {
        const db = await DatabaseService.getDatabase();
        
        const result = await db.runAsync(`
          UPDATE words 
          SET lastReviewDate = NULL, reviewCount = 0, rate = 0, updatedAt = ?
          WHERE id = ?
        `, [now, id]);

        if (result.changes === 0) {
          return { success: false, error: "Word not found" };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error resetting word progress:', error);
      return { success: false, error: "Failed to reset word progress" };
    }
  }

  /**
   * Get words that need review based on spaced repetition
   */
  static async getWordsForReview(dictionaryId?: number, limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      await MockDataService.delay(50);

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      if (Platform.OS === "web") {
        let wordsForReview = MockDataService.mockWords.filter(word => {
          // Words with low rate or not reviewed recently
          const needsReview = word.rate < 3 || 
            !word.lastReviewDate || 
            word.lastReviewDate < oneDayAgo;
          
          return needsReview && (!dictionaryId || word.dictionaryId === dictionaryId);
        });

        // Sort by priority (lower rate first, then by last review date)
        wordsForReview.sort((a, b) => {
          if (a.rate !== b.rate) {
            return a.rate - b.rate;
          }
          
          const aDate = a.lastReviewDate ? new Date(a.lastReviewDate).getTime() : 0;
          const bDate = b.lastReviewDate ? new Date(b.lastReviewDate).getTime() : 0;
          return aDate - bDate;
        });

        return {
          success: true,
          data: wordsForReview.slice(0, limit),
        };
      } else {
        const db = await DatabaseService.getDatabase();
        
        let query = `
          SELECT w.*, d.title as dictionaryTitle 
          FROM words w 
          JOIN dictionaries d ON w.dictionaryId = d.id 
          WHERE (w.rate < 3 OR w.lastReviewDate IS NULL OR w.lastReviewDate < ?)
        `;
        
        const params: any[] = [oneDayAgo];

        if (dictionaryId) {
          query += ' AND w.dictionaryId = ?';
          params.push(dictionaryId);
        }

        query += ' ORDER BY w.rate ASC, w.lastReviewDate ASC LIMIT ?';
        params.push(limit);

        const words = await db.getAllAsync(query, params);

        return {
          success: true,
          data: words,
        };
      }
    } catch (error) {
      console.error('Error getting words for review:', error);
      return { success: false, error: "Failed to get words for review" };
    }
  }
}