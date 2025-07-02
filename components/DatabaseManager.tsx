// components/DatabaseManager.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import styles from '../styles/SharedStyles';
import { SQLiteUniversalService } from '../services/database/SQLiteUniversalService';

interface DatabaseManagerProps {
  databaseService: SQLiteUniversalService;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ databaseService }) => {
  const [storageInfo, setStorageInfo] = useState<{ hasStoredData: boolean; storageSize?: number }>({ hasStoredData: false });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      updateStorageInfo();
    }
  }, []);

  const updateStorageInfo = () => {
    if (Platform.OS === 'web') {
      const info = databaseService.getStorageInfo();
      setStorageInfo(info);
    }
  };

  const handleDownload = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      await databaseService.downloadDatabase(`easy-english-${timestamp}.db`);
      Alert.alert('Success', 'Database downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download database');
    }
  };

  const handleUpload = () => {
    if (Platform.OS !== 'web') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db,.sqlite,.sqlite3';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await databaseService.uploadDatabase(file);
        updateStorageInfo();
        Alert.alert('Success', 'Database uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        Alert.alert('Error', 'Failed to upload database');
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  const handleSave = async () => {
    try {
      await databaseService.saveToStorage();
      updateStorageInfo();
      Alert.alert('Success', 'Database saved to browser storage!');
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to save database');
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'Are you sure you want to clear all stored data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            databaseService.clearStorage();
            updateStorageInfo();
            Alert.alert('Success', 'Storage cleared successfully!');
          }
        }
      ]
    );
  };

  // Only show on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text /* style={styles.sectionTitle} */>Database Management</Text>
      
      <View style={styles.card}>
        <Text /* style={styles.cardTitle} */>Storage Info</Text>
        <Text style={[/* styles.text , */styles.textSecondary]}>
          Status: {storageInfo.hasStoredData ? 'Data stored' : 'No stored data'}
        </Text>
        {storageInfo.storageSize && (
          <Text style={[/* styles.text, */styles.textSecondary]}>
            Size: {Math.round(storageInfo.storageSize / 1024)} KB
          </Text>
        )}
      </View>

      <View /* style={styles.cardActions} */>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleDownload}
          accessibilityLabel="Download database file"
        >
          <Text style={styles.buttonText}>Download DB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleUpload}
          disabled={isUploading}
          accessibilityLabel="Upload database file"
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Uploading...' : 'Upload DB'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSuccess]}
          onPress={handleSave}
          accessibilityLabel="Save database to browser storage"
        >
          <Text style={styles.buttonText}>Save to Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button /*, styles.buttonDanger */]}
          onPress={handleClearStorage}
          accessibilityLabel="Clear browser storage"
        >
          <Text style={styles.buttonText}>Clear Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text /* style={styles.cardTitle} */>Development Tips</Text>
        <Text style={[/* styles.text, */ styles.textSecondary, { fontSize: 12 }]}>
          • Place database.db in /public folder to load it automatically{'\n'}
          • Download current database to backup your data{'\n'}
          • Upload database file to replace current data{'\n'}
          • Auto-save runs every 30 seconds
        </Text>
      </View>
    </View>
  );
};