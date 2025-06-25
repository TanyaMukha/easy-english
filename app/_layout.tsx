import React, { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { SharedStyles } from '../styles/SharedStyles';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

/**
 * Root layout component that wraps the entire application
 * Handles initialization, providers, and platform-specific setup
 */
export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize i18n
      await i18n.init();
      
      // Add any other initialization logic here
      // e.g., database setup, user authentication check, etc.
      
      // Simulate brief loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsAppReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleRetry = () => {
    setInitError(null);
    setIsAppReady(false);
    initializeApp();
  };

  return (
    <SafeAreaProvider style={SharedStyles.safeArea}>
      {initError && (
        <ErrorState
          title="Failed to start application"
          message={initError}
          onRetry={handleRetry}
          retryText="Restart App"
        />
      )}
      
      {!initError && !isAppReady && (
        <LoadingState message="Starting Easy English..." />
      )}
      
      {!initError && isAppReady && (
        <GestureHandlerRootView style={SharedStyles.container}>
          <I18nextProvider i18n={i18n}>
            {Platform.OS !== 'web' && (
              <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
              />
            )}
            <Slot />
          </I18nextProvider>
        </GestureHandlerRootView>
      )}
    </SafeAreaProvider>
  );
}