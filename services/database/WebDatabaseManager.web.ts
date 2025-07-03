// services/database/WebDatabaseManager.web.ts
import { Platform } from "react-native";

export class WebDatabaseManager {
  private static PUBLIC_DB_PATH = '/database.db';
  private static STORAGE_KEY = 'easy_english_database';

  /**
   * Load database from public folder if exists, otherwise create new
   */
  static async loadOrCreateDatabase(sqlJs: any): Promise<any> {
    if (Platform.OS !== 'web') {
      throw new Error('WebDatabaseManager is only for web platform');
    }

    try {
      // Try to load from public folder first
      const publicDb = await this.loadFromPublicFolder();
      if (publicDb) {
        console.log("✅ Database loaded from public folder");
        return new sqlJs.Database(publicDb);
      }
    } catch (error) {
      console.warn("⚠️ Could not load database from public folder:", error);
    }

    try {
      // Try to load from browser storage
      const storedDb = await this.loadFromStorage();
      if (storedDb) {
        console.log("✅ Database loaded from browser storage");
        return new sqlJs.Database(storedDb);
      }
    } catch (error) {
      console.warn("⚠️ Could not load database from storage:", error);
    }

    // Create new database
    console.log("✅ Creating new empty database");
    return new sqlJs.Database();
  }

  /**
   * Try to load database file from public folder
   */
  private static async loadFromPublicFolder(): Promise<Uint8Array | null> {
    try {
      const response = await fetch(this.PUBLIC_DB_PATH);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("📁 No database file found in public folder");
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.warn("Could not fetch database from public folder:", error);
      return null;
    }
  }

  /**
   * Load database from browser storage
   */
  private static async loadFromStorage(): Promise<Uint8Array | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      // Convert base64 back to Uint8Array
      const binaryString = atob(stored);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return bytes;
    } catch (error) {
      console.warn("Could not load from storage:", error);
      return null;
    }
  }

  /**
   * Save database to browser storage
   */
  static async saveToStorage(database: any): Promise<void> {
    try {
      const data = database.export();
      
      // Convert Uint8Array to base64 for storage
      let binaryString = '';
      for (let i = 0; i < data.length; i++) {
        binaryString += String.fromCharCode(data[i]);
      }
      const base64String = btoa(binaryString);
      
      localStorage.setItem(this.STORAGE_KEY, base64String);
      console.log("💾 Database saved to browser storage");
    } catch (error) {
      console.error("❌ Failed to save database to storage:", error);
    }
  }

  /**
   * Download current database as file
   */
  static async downloadDatabase(database: any, filename: string = 'easy-english-database.db'): Promise<void> {
    try {
      const data = database.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`✅ Database downloaded as ${filename}`);
    } catch (error) {
      console.error("❌ Failed to download database:", error);
    }
  }

  /**
   * Upload database file to replace current
   */
  static async uploadDatabase(sqlJs: any, file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const database = new sqlJs.Database(uint8Array);
          
          console.log("✅ Database uploaded successfully");
          resolve(database);
        } catch (error) {
          console.error("❌ Failed to load uploaded database:", error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Copy current database to public folder (development only)
   * This would require a development server endpoint
   */
  static async copyToPublicFolder(database: any): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn("⚠️ copyToPublicFolder only available in development mode");
      return;
    }

    try {
      const data = database.export();
      
      // This would require a custom development server endpoint
      const response = await fetch('/api/save-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: data
      });

      if (response.ok) {
        console.log("✅ Database copied to public folder");
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to copy database to public folder:", error);
      console.log("💡 Tip: Use downloadDatabase() and manually place file in public folder");
    }
  }

  /**
   * Clear all stored data
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("🗑️ Database storage cleared");
    } catch (error) {
      console.error("❌ Failed to clear storage:", error);
    }
  }

  /**
   * Get storage info
   */
  static getStorageInfo(): { hasStoredData: boolean; storageSize?: number } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return {
        hasStoredData: !!stored,
        storageSize: stored ? stored.length : 0
      };
    } catch (error) {
      return { hasStoredData: false };
    }
  }
}