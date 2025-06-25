import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import createTableScripts from "../scripts";

const DATABASE_NAME = "easy_english.db";

// Открываем подключение к локальной базе данных
export const openDatabase = async () => {
  if (Platform.OS === "web") {
    // Заглушка для веб-платформы
    return {
      transaction: () => ({
        executeSql: () => {},
      }),
      closeAsync: () => {},
      execAsync: () => {},
      getFirstAsync: () => {},
      getAllAsync: () => {},
      runAsync: () => {},
    };
  }

  const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
  
  try {
    // Проверяем, существует ли база данных
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    
    if (!dbInfo.exists) {
      console.log("Creating new database...");
      // Создаем новую базу данных
      const db = SQLite.openDatabaseSync(dbPath);
      await initializeTables(db);
      console.log("New database created and initialized");
      return db;
    } else {
      console.log("Opening existing database...");
      const db = SQLite.openDatabaseSync(dbPath);
      
      // Проверяем структуру существующей базы
      const isValid = await validateDatabaseStructure(db);
      if (!isValid) {
        console.log("Database structure is invalid, reinitializing...");
        await initializeTables(db);
      }
      
      return db;
    }
  } catch (error) {
    console.error("Error opening database:", error);
    throw error;
  }
};

// Проверка структуры базы данных
const validateDatabaseStructure = async (db: any): Promise<boolean> => {
  try {
    const requiredTables = [
      'grammar_topics',
      'grammar_tests', 
      'test_cards',
      'grammar_topic_tests'
    ];

    for (const tableName of requiredTables) {
      const result = await db.getFirstAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName]
      );
      
      if (!result) {
        console.log(`Table ${tableName} is missing`);
        return false;
      }
    }

    // Проверяем, что таблицы имеют колонки
    for (const tableName of requiredTables) {
      const columns = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
      if (!columns || columns.length === 0) {
        console.log(`Table ${tableName} has no columns`);
        return false;
      }
    }

    console.log("Database structure is valid");
    return true;
  } catch (error) {
    console.error("Error validating database structure:", error);
    return false;
  }
};

// Функция для инициализации таблиц
const initializeTables = async (db: any) => {
  try {
    // Создаем таблицу для грамматических тем
    createTableScripts.forEach((script) => {
      db.execAsync(script);
    });
    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
};

// Инициализация базы данных
export const initDatabase = async () => {
  try {
    const db = await openDatabase();
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    return null;
  }
};

// Экспорт базы данных с выбором папки
export const exportDatabase = async (): Promise<boolean> => {
  try {
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    
    // Проверяем, существует ли база данных
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    if (!dbInfo.exists) {
      Alert.alert("Ошибка", "База данных не найдена");
      return false;
    }

    // Создаем имя файла с датой
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const exportFileName = `easy_english_backup_${timestamp}.db`;

    if (Platform.OS === 'android') {
      try {
        // Запрашиваем разрешение на выбор директории
        const directoryResult = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (directoryResult.granted) {
          // Создаем файл в выбранной директории
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryResult.directoryUri,
            exportFileName,
            "application/vnd.sqlite3"
          );

          // Читаем содержимое базы данных
          const dbContent = await FileSystem.readAsStringAsync(dbPath, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Записываем в выбранную директорию
          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            fileUri,
            dbContent,
            { encoding: FileSystem.EncodingType.Base64 }
          );

          Alert.alert("Успех", `База данных сохранена как ${exportFileName}`);
          return true;
        } else {
          // Если пользователь отказался от выбора папки, предлагаем sharing
          return await exportDatabaseWithSharing();
        }
      } catch (error) {
        console.error("Error with directory selection:", error);
        // Fallback на sharing
        return await exportDatabaseWithSharing();
      }
    } else {
      // Для iOS используем sharing
      return await exportDatabaseWithSharing();
    }
  } catch (error) {
    console.error("Error exporting database:", error);
    Alert.alert("Ошибка", "Не удалось экспортировать базу данных");
    return false;
  }
};

// Экспорт через системное меню "Поделиться"
const exportDatabaseWithSharing = async (): Promise<boolean> => {
  try {
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    
    // Создаем имя файла с датой
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const exportFileName = `easy_english_backup_${timestamp}.db`;
    
    // Копируем базу во временную директорию для экспорта
    const exportPath = `${FileSystem.cacheDirectory}${exportFileName}`;
    await FileSystem.copyAsync({
      from: dbPath,
      to: exportPath
    });

    // Проверяем, доступен ли Sharing
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(exportPath, {
        dialogTitle: "Экспорт базы данных",
        mimeType: "application/vnd.sqlite3"
      });
      
      // Удаляем временный файл после экспорта
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(exportPath);
        } catch (error) {
          console.log("Could not delete temporary export file");
        }
      }, 5000);
      
      return true;
    } else {
      Alert.alert("Ошибка", "Функция экспорта недоступна на этом устройстве");
      return false;
    }
  } catch (error) {
    console.error("Error with sharing export:", error);
    return false;
  }
};

// Импорт базы данных
export const importDatabase = async (): Promise<boolean> => {
  try {
    // Выбираем файл для импорта
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/vnd.sqlite3", "application/octet-stream", "*/*"],
      copyToCacheDirectory: true
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }

    const selectedFile = result.assets[0];
    const importPath = selectedFile.uri;

    // Проверяем, что файл существует
    const fileInfo = await FileSystem.getInfoAsync(importPath);
    if (!fileInfo.exists) {
      Alert.alert("Ошибка", "Выбранный файл не найден");
      return false;
    }

    // Создаем резервную копию текущей базы
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    const backupPath = `${FileSystem.documentDirectory}${DATABASE_NAME}.backup`;
    
    const currentDbInfo = await FileSystem.getInfoAsync(dbPath);
    if (currentDbInfo.exists) {
      await FileSystem.copyAsync({
        from: dbPath,
        to: backupPath
      });
    }

    try {
      // Копируем импортируемый файл на место основной базы
      await FileSystem.copyAsync({
        from: importPath,
        to: dbPath
      });

      // Проверяем структуру импортированной базы
      const db = SQLite.openDatabaseSync(dbPath);
      const isValid = await validateDatabaseStructure(db);
      await db.closeAsync();

      if (!isValid) {
        throw new Error("Invalid database structure");
      }

      // Удаляем резервную копию при успешном импорте
      if (currentDbInfo.exists) {
        await FileSystem.deleteAsync(backupPath);
      }

      Alert.alert("Успех", "База данных успешно импортирована");
      return true;

    } catch (importError) {
      console.error("Error during import:", importError);
      
      // Восстанавливаем из резервной копии
      if (currentDbInfo.exists) {
        try {
          await FileSystem.copyAsync({
            from: backupPath,
            to: dbPath
          });
          await FileSystem.deleteAsync(backupPath);
        } catch (restoreError) {
          console.error("Error restoring backup:", restoreError);
        }
      }
      
      Alert.alert("Ошибка", "Не удалось импортировать базу данных. Возможно, файл поврежден или имеет неправильный формат.");
      return false;
    }

  } catch (error) {
    console.error("Error importing database:", error);
    Alert.alert("Ошибка", "Не удалось импортировать базу данных");
    return false;
  }
};

// Получение информации о базе данных
export const getDatabaseInfo = async () => {
  try {
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    
    if (!dbInfo.exists) {
      return {
        exists: false,
        size: 0,
        modificationTime: null
      };
    }

    return {
      exists: true,
      size: dbInfo.size,
      modificationTime: dbInfo.modificationTime
    };
  } catch (error) {
    console.error("Error getting database info:", error);
    return {
      exists: false,
      size: 0,
      modificationTime: null
    };
  }
};

// Быстрое сохранение в Downloads (только Android)
export const exportDatabaseToDownloads = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    Alert.alert("Информация", "Эта функция доступна только на Android");
    return false;
  }

  try {
    const dbPath = `${FileSystem.documentDirectory}${DATABASE_NAME}`;
    
    // Проверяем, существует ли база данных
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    if (!dbInfo.exists) {
      Alert.alert("Ошибка", "База данных не найдена");
      return false;
    }

    // Создаем имя файла с датой
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const exportFileName = `easy_english_backup_${timestamp}.db`;

    try {
      // Пытаемся получить доступ к Downloads через Media Store
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        // Создаем файл
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          exportFileName,
          "application/vnd.sqlite3"
        );

        // Читаем и записываем содержимое
        const dbContent = await FileSystem.readAsStringAsync(dbPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          fileUri,
          dbContent,
          { encoding: FileSystem.EncodingType.Base64 }
        );

        Alert.alert("Успех", `База данных сохранена как ${exportFileName}`);
        return true;
      }
    } catch (error) {
      console.error("Could not save to selected directory:", error);
    }

    // Fallback: сохраняем во внутреннюю папку приложения и показываем sharing
    return await exportDatabaseWithSharing();

  } catch (error) {
    console.error("Error exporting to downloads:", error);
    Alert.alert("Ошибка", "Не удалось сохранить в Downloads");
    return false;
  }
};