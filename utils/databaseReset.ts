// utils/databaseReset.ts - Utility for resetting incompatible database
import { WebDatabasePersistence } from '../services/database/WebDatabasePersistence';
import { SQLiteUniversal } from '../services/database/SQLiteUniversalService';

/**
 * Database Reset Utility
 * 
 * Handles detection and reset of incompatible database schemas
 * This is needed when the database structure changes significantly
 */

export interface SchemaCompatibilityCheck {
  isCompatible: boolean;
  missingColumns: string[];
  missingTables: string[];
  errors: string[];
}

export class DatabaseResetUtility {
  /**
   * Check if current database schema is compatible with expected schema
   */
  static async checkSchemaCompatibility(): Promise<SchemaCompatibilityCheck> {
    const result: SchemaCompatibilityCheck = {
      isCompatible: true,
      missingColumns: [],
      missingTables: [],
      errors: []
    };

    try {
      // Check for required tables
      const requiredTables = ['dictionaries', 'words', 'examples', 'sets'];
      
      for (const tableName of requiredTables) {
        const tableCheck = await SQLiteUniversal.execute(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          [tableName]
        );

        if (!tableCheck.success || !tableCheck.data || tableCheck.data.length === 0) {
          result.missingTables.push(tableName);
          result.isCompatible = false;
        }
      }

      // Check for required columns in dictionaries table
      const requiredColumns = [
        { table: 'dictionaries', column: 'guid' },
        { table: 'dictionaries', column: 'title' },
      ];

      for (const { table, column } of requiredColumns) {
        try {
          const columnCheck = await SQLiteUniversal.execute(
            `PRAGMA table_info(${table})`
          );

          if (columnCheck.success && columnCheck.data) {
            const hasColumn = columnCheck.data.some((col: any) => col.name === column);
            if (!hasColumn) {
              result.missingColumns.push(`${table}.${column}`);
              result.isCompatible = false;
            }
          }
        } catch (error) {
          result.errors.push(`Failed to check column ${table}.${column}: ${error}`);
          result.isCompatible = false;
        }
      }

    } catch (error) {
      result.errors.push(`Schema compatibility check failed: ${error}`);
      result.isCompatible = false;
    }

    return result;
  }

  /**
   * Reset database by clearing all storage and forcing recreation
   */
  static async resetDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Starting database reset...');

      // Clear all stored databases
      await WebDatabasePersistence.clearStoredDatabase();
      console.log('✅ Storage cleared');

      // Reset the service instance
      const service = SQLiteUniversal;
      if (service['cleanup']) {
        await (service as any).cleanup();
      }

      // Force reinitialization on next use
      (SQLiteUniversal as any).initState = 'NOT_STARTED';
      (SQLiteUniversal as any).initializationPromise = null;

      console.log('✅ Database reset completed');
      
      return {
        success: true,
        message: 'Database reset successfully. Please refresh the page.'
      };

    } catch (error) {
      console.error('❌ Database reset failed:', error);
      return {
        success: false,
        message: `Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Auto-detect and fix schema compatibility issues
   */
  static async autoFixSchema(): Promise<{ success: boolean; message: string; actions: string[] }> {
    const actions: string[] = [];
    
    try {
      // Check compatibility
      const compatibility = await this.checkSchemaCompatibility();
      
      if (compatibility.isCompatible) {
        return {
          success: true,
          message: 'Database schema is compatible',
          actions: ['No action needed']
        };
      }

      actions.push('Detected schema incompatibility');
      
      // Log issues
      if (compatibility.missingTables.length > 0) {
        actions.push(`Missing tables: ${compatibility.missingTables.join(', ')}`);
      }
      
      if (compatibility.missingColumns.length > 0) {
        actions.push(`Missing columns: ${compatibility.missingColumns.join(', ')}`);
      }

      // Reset database
      const resetResult = await this.resetDatabase();
      
      if (resetResult.success) {
        actions.push('Database reset completed');
        return {
          success: true,
          message: 'Schema fixed by resetting database',
          actions
        };
      } else {
        actions.push('Database reset failed');
        return {
          success: false,
          message: resetResult.message,
          actions
        };
      }

    } catch (error) {
      actions.push(`Auto-fix failed: ${error}`);
      return {
        success: false,
        message: `Auto-fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actions
      };
    }
  }

  /**
   * Show reset confirmation dialog and execute reset
   */
  static async showResetDialog(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const confirmed = window.confirm(
      'Database schema is incompatible and needs to be reset.\n\n' +
      'This will:\n' +
      '• Clear all existing data\n' +
      '• Create a fresh database with the new schema\n' +
      '• Require a page refresh\n\n' +
      'Do you want to continue?'
    );

    if (confirmed) {
      const result = await this.resetDatabase();
      
      if (result.success) {
        alert('Database reset completed! The page will now refresh.');
        window.location.reload();
        return true;
      } else {
        alert(`Reset failed: ${result.message}`);
        return false;
      }
    }

    return false;
  }
}

/**
 * Initialize database with automatic schema compatibility checking
 */
export async function initializeDatabaseWithCompatibilityCheck(): Promise<{
  success: boolean;
  message: string;
  needsReset?: boolean;
}> {
  try {
    // First, try normal initialization
    await SQLiteUniversal.initialize();
    
    // Check schema compatibility
    const compatibility = await DatabaseResetUtility.checkSchemaCompatibility();
    
    if (!compatibility.isCompatible) {
      console.warn('⚠️ Database schema is incompatible:', compatibility);
      
      // Offer automatic reset
      const autoFix = await DatabaseResetUtility.autoFixSchema();
      
      if (autoFix.success) {
        return {
          success: true,
          message: autoFix.message,
          needsReset: true
        };
      } else {
        return {
          success: false,
          message: autoFix.message,
          needsReset: true
        };
      }
    }

    return {
      success: true,
      message: 'Database initialized successfully'
    };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return {
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).DatabaseResetUtility = DatabaseResetUtility;
}