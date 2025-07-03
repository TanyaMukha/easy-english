// services/database/WebDatabasePersistence.ts - Universal platform-safe implementation
import { Platform } from "react-native";

export interface AutoSaveController {
  stop: () => void;
  forceSync: () => Promise<void>;
}

// Conditionally import web implementation
let WebPersistenceImpl: any = null;

if (Platform.OS === "web") {
  try {
    // Dynamic import for web-only functionality
    const webModule = require("./WebDatabasePersistence.web");
    WebPersistenceImpl = webModule.WebDatabasePersistence;
  } catch (error) {
    console.warn("Could not load web database persistence:", error);
  }
}

/**
 * Universal WebDatabasePersistence with platform-safe methods
 */
export class WebDatabasePersistence {
  /**
   * Load existing database from IndexedDB or localStorage
   */
  static async loadExistingDatabase(): Promise<Uint8Array | null> {
    if (Platform.OS === "web" && WebPersistenceImpl) {
      return WebPersistenceImpl.loadExistingDatabase();
    }
    
    console.warn('WebDatabasePersistence: loadExistingDatabase not available on mobile platform');
    return null;
  }

  /**
   * Start auto-save mechanism
   */
  static startAutoSave(
    webDatabase?: any,
    intervalMs: number = 30000
  ): AutoSaveController {
    if (Platform.OS === "web" && WebPersistenceImpl && webDatabase) {
      return WebPersistenceImpl.startAutoSave(webDatabase, intervalMs);
    }
    
    console.warn('WebDatabasePersistence: startAutoSave not available on mobile platform');
    return {
      stop: () => {},
      forceSync: async () => {}
    };
  }

  /**
   * Stop auto-save
   */
  static stopAutoSave(controller: AutoSaveController): void {
    if (Platform.OS === "web" && WebPersistenceImpl) {
      return WebPersistenceImpl.stopAutoSave(controller);
    }
    
    if (controller) {
      controller.stop();
    }
  }

  /**
   * Save database to IndexedDB
   */
  static async saveToIndexedDB(dbBinary?: Uint8Array): Promise<void> {
    if (Platform.OS === "web" && WebPersistenceImpl && dbBinary) {
      return WebPersistenceImpl.saveToIndexedDB(dbBinary);
    }
    
    console.warn('WebDatabasePersistence: saveToIndexedDB not available on mobile platform');
  }

  /**
   * Load database from IndexedDB
   */
  static async loadFromIndexedDB(): Promise<Uint8Array | null> {
    if (Platform.OS === "web" && WebPersistenceImpl) {
      return WebPersistenceImpl.loadFromIndexedDB();
    }
    
    console.warn('WebDatabasePersistence: loadFromIndexedDB not available on mobile platform');
    return null;
  }
}