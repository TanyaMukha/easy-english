// services/database/WebDatabasePersistence.web.ts - Fixed with stopAutoSave method
/**
 * Web Database Persistence
 * 
 * Handles automatic saving and loading of SQLite database for web platform
 * Saves database to IndexedDB and localStorage for persistence across sessions
 */

export interface AutoSaveController {
  stop: () => void;
}

export class WebDatabasePersistence {
  private static readonly DB_NAME = 'EasyEnglishDB';
  private static readonly STORE_NAME = 'database_storage';
  private static readonly LOCAL_STORAGE_KEY = 'easy_english_db_backup';
  
  /**
   * Save database to IndexedDB (primary storage)
   */
  static async saveToIndexedDB(dbBinary: Uint8Array): Promise<boolean> {
    try {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => {
          console.error('❌ IndexedDB open failed:', request.error);
          reject(request.error);
        };
        
        request.onupgradeneeded = () => {
          const db = request.result;
          console.log('🔧 Creating IndexedDB object store:', this.STORE_NAME);
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };
        
        request.onsuccess = () => {
          try {
            const db = request.result;
            
            // Check if store exists before creating transaction
            if (!db.objectStoreNames.contains(this.STORE_NAME)) {
              console.error('❌ ObjectStore not found:', this.STORE_NAME);
              console.log('Available stores:', db.objectStoreNames);
              reject(new Error(`ObjectStore '${this.STORE_NAME}' not found`));
              return;
            }
            
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            
            store.put(dbBinary, 'database');
            
            transaction.oncomplete = () => {
              console.log('✅ Database saved to IndexedDB');
              db.close();
              resolve(true);
            };
            
            transaction.onerror = () => {
              console.error('❌ Failed to save to IndexedDB:', transaction.error);
              db.close();
              reject(transaction.error);
            };
          } catch (error) {
            console.error('❌ Transaction creation failed:', error);
            reject(error);
          }
        };
      });
    } catch (error) {
      console.error('❌ IndexedDB save error:', error);
      return false;
    }
  }

  /**
   * Load database from IndexedDB
   */
  static async loadFromIndexedDB(): Promise<Uint8Array | null> {
    try {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => {
          console.log('📁 No existing database in IndexedDB');
          resolve(null);
        };
        
        request.onupgradeneeded = () => {
          const db = request.result;
          console.log('🔧 Creating IndexedDB object store during load:', this.STORE_NAME);
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };
        
        request.onsuccess = () => {
          try {
            const db = request.result;
            
            if (!db.objectStoreNames.contains(this.STORE_NAME)) {
              console.log('📁 No database store found');
              db.close();
              resolve(null);
              return;
            }
            
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const getRequest = store.get('database');
            
            getRequest.onsuccess = () => {
              if (getRequest.result) {
                console.log('✅ Database loaded from IndexedDB');
                db.close();
                resolve(getRequest.result);
              } else {
                console.log('📁 No database found in IndexedDB');
                db.close();
                resolve(null);
              }
            };
            
            getRequest.onerror = () => {
              console.error('❌ Failed to load from IndexedDB:', getRequest.error);
              db.close();
              resolve(null);
            };
          } catch (error) {
            console.error('❌ Load transaction failed:', error);
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('❌ IndexedDB load error:', error);
      return null;
    }
  }

  /**
   * Save database to localStorage (backup storage)
   */
  static saveToLocalStorage(dbBinary: Uint8Array): boolean {
    try {
      // Skip localStorage if database is too large (> 2MB)
      if (dbBinary.length > 2 * 1024 * 1024) {
        console.log('📁 Database too large for localStorage, skipping backup');
        return false;
      }

      // Convert to base64 in chunks to avoid stack overflow
      let base64 = '';
      const chunkSize = 8192; // Process in smaller chunks
      
      for (let i = 0; i < dbBinary.length; i += chunkSize) {
        const chunk = dbBinary.slice(i, i + chunkSize);
        const chunkString = String.fromCharCode(...Array.from(chunk));
        base64 += btoa(chunkString);
      }
      
      localStorage.setItem(this.LOCAL_STORAGE_KEY, base64);
      console.log('✅ Database backup saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ localStorage save error:', error);
      // Try to clear the item if it failed
      try {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear localStorage item:', clearError);
      }
      return false;
    }
  }

  /**
   * Load database from localStorage
   */
  static loadFromLocalStorage(): Uint8Array | null {
    try {
      const base64 = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (!base64) {
        console.log('📁 No database backup in localStorage');
        return null;
      }
      
      // Convert from base64
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('✅ Database backup loaded from localStorage');
      return bytes;
    } catch (error) {
      console.error('❌ localStorage load error:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        console.log('🗑️ Cleared corrupted localStorage backup');
      } catch (clearError) {
        console.error('Failed to clear localStorage:', clearError);
      }
      return null;
    }
  }

  /**
   * Auto-save database periodically
   */
  static startAutoSave(webDatabase: any, intervalMs: number = 10000): AutoSaveController {
    if (typeof window === 'undefined') {
      // Return a dummy controller for non-browser environments
      return { stop: () => {} };
    }

    console.log(`🔄 Starting auto-save every ${intervalMs / 1000} seconds`);
    
    const saveDatabase = async () => {
      try {
        if (webDatabase) {
          const dbBinary = webDatabase.export();
          await this.saveToIndexedDB(dbBinary);
          this.saveToLocalStorage(dbBinary);
        }
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    };

    // Save immediately
    saveDatabase();

    // Set up interval
    const intervalId = setInterval(saveDatabase, intervalMs);

    // Save on page unload
    const handleUnload = () => {
      try {
        if (webDatabase) {
          const dbBinary = webDatabase.export();
          this.saveToLocalStorage(dbBinary); // Sync operation for unload
        }
      } catch (error) {
        console.error('❌ Unload save failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Return controller object
    return {
      stop: () => {
        clearInterval(intervalId);
        window.removeEventListener('beforeunload', handleUnload);
        window.removeEventListener('pagehide', handleUnload);
        console.log('🛑 Auto-save stopped');
      }
    };
  }

  /**
   * Stop auto-save using controller
   */
  static stopAutoSave(controller: AutoSaveController | null): void {
    if (controller && typeof controller.stop === 'function') {
      controller.stop();
    }
  }

  /**
   * Try to load existing database or return null for new database
   */
  static async loadExistingDatabase(): Promise<Uint8Array | null> {
    console.log('🔍 Looking for existing database...');
    
    // Try IndexedDB first (primary storage)
    let dbBinary = await this.loadFromIndexedDB();
    
    if (!dbBinary) {
      // Fallback to localStorage
      dbBinary = this.loadFromLocalStorage();
    }
    
    if (dbBinary) {
      console.log('🎉 Found existing database, restoring...');
      return dbBinary;
    } else {
      console.log('🆕 No existing database found, will create new one');
      return null;
    }
  }

  /**
   * Clear all stored databases (for development/reset)
   */
  static async clearStoredDatabase(): Promise<void> {
    try {
      // Clear IndexedDB
      const request = indexedDB.deleteDatabase(this.DB_NAME);
      await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });

      // Clear localStorage
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      
      console.log('🗑️ All stored databases cleared');
    } catch (error) {
      console.error('❌ Failed to clear databases:', error);
    }
  }

  /**
   * Export database file for download
   */
  static exportDatabaseFile(webDatabase: any): void {
    try {
      const dbBinary = webDatabase.export();
      const blob = new Blob([dbBinary], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `easy-english-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('💾 Database exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  /**
   * Import database file
   */
  static importDatabaseFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const dbBinary = new Uint8Array(arrayBuffer);
        resolve(dbBinary);
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Get database storage statistics
   */
  static async getStorageStats(): Promise<{
    indexedDbSize: number;
    localStorageSize: number;
    totalSize: number;
  }> {
    let indexedDbSize = 0;
    let localStorageSize = 0;

    try {
      // Check IndexedDB size
      const dbBinary = await this.loadFromIndexedDB();
      if (dbBinary) {
        indexedDbSize = dbBinary.length;
      }
    } catch (error) {
      console.warn('Could not get IndexedDB size:', error);
    }

    try {
      // Check localStorage size
      const base64 = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (base64) {
        localStorageSize = base64.length;
      }
    } catch (error) {
      console.warn('Could not get localStorage size:', error);
    }

    return {
      indexedDbSize,
      localStorageSize,
      totalSize: indexedDbSize + localStorageSize
    };
  }
}