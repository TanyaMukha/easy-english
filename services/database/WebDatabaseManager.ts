// services/database/WebDatabaseManager.ts - Universal platform-safe implementation
import { Platform } from "react-native";

// Conditionally import web implementation
let WebManagerImpl: any = null;

if (Platform.OS === "web") {
  try {
    // Dynamic import for web-only functionality
    WebManagerImpl = require("./WebDatabaseManager.web").WebDatabaseManager;
  } catch (error) {
    console.warn("Could not load web database manager:", error);
  }
}

/**
 * Universal WebDatabaseManager with platform-safe methods
 */
export class WebDatabaseManager {
  /**
   * Load database from public folder if exists, otherwise create new
   */
  static async loadOrCreateDatabase(sqlJs?: any): Promise<any> {
    if (Platform.OS === "web" && WebManagerImpl && sqlJs) {
      return WebManagerImpl.loadOrCreateDatabase(sqlJs);
    }
    
    throw new Error('WebDatabaseManager is only available on web platform');
  }

  /**
   * Save database to browser storage
   */
  static async saveToStorage(database?: any): Promise<void> {
    if (Platform.OS === "web" && WebManagerImpl && database) {
      return WebManagerImpl.saveToStorage(database);
    }
    
    console.warn('WebDatabaseManager: saveToStorage not available on mobile platform');
  }

  /**
   * Download current database as file
   */
  static async downloadDatabase(database?: any, filename?: string): Promise<void> {
    if (Platform.OS === "web" && WebManagerImpl && database) {
      return WebManagerImpl.downloadDatabase(database, filename);
    }
    
    console.warn('WebDatabaseManager: downloadDatabase not available on mobile platform');
  }

  /**
   * Upload database file to replace current
   */
  static async uploadDatabase(sqlJs?: any, file?: File): Promise<any> {
    if (Platform.OS === "web" && WebManagerImpl && sqlJs && file) {
      return WebManagerImpl.uploadDatabase(sqlJs, file);
    }
    
    throw new Error('WebDatabaseManager: uploadDatabase not available on mobile platform');
  }

  /**
   * Clear all stored data
   */
  static clearStorage(): void {
    if (Platform.OS === "web" && WebManagerImpl) {
      return WebManagerImpl.clearStorage();
    }
    
    console.warn('WebDatabaseManager: clearStorage not available on mobile platform');
  }

  /**
   * Get storage info
   */
  static getStorageInfo(): { hasStoredData: boolean; storageSize?: number } {
    if (Platform.OS === "web" && WebManagerImpl) {
      return WebManagerImpl.getStorageInfo();
    }
    
    return { hasStoredData: false };
  }
}