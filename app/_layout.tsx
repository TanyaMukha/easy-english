// app/_layout.tsx - Fixed root layout with proper i18n initialization
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot } from "expo-router";

import ErrorState from "../components/ui/feedback/ErrorState";
import LoadingState from "../components/ui/feedback/LoadingState";
import i18n from "../i18n/config";
import { SharedStyles } from "../styles/SharedStyles";
import { initializeDatabaseWithCompatibilityCheck } from '../utils/databaseReset';

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
      // Wait for i18n to be fully initialized
      if (!i18n.isInitialized) {
        await new Promise((resolve) => {
          if (i18n.isInitialized) {
            resolve(void 0);
            return;
          }
          
          const onInitialized = () => {
            i18n.off('initialized', onInitialized);
            resolve(void 0);
          };
          
          i18n.on('initialized', onInitialized);
        });
      }

      // Add any other initialization logic here
      // e.g., database setup, user authentication check, etc.

      // Brief delay for better UX (optional)
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsAppReady(true);
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setInitError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  };

  const handleRetry = () => {
    setInitError(null);
    setIsAppReady(false);
    initializeDatabaseWithCompatibilityCheck();
    initializeApp();
  };

  return (
    <SafeAreaProvider style={SharedStyles.safeArea}>
      {initError && (
        <ErrorState
          title="Failed to start application"
          message={initError}
          onRetry={handleRetry}
          buttonText="Restart App"
        />
      )}

      {!initError && !isAppReady && (
        <LoadingState message="Starting Easy English..." />
      )}

      {!initError && isAppReady && (
        <GestureHandlerRootView style={SharedStyles.container}>
          <I18nextProvider i18n={i18n}>
            {Platform.OS !== "web" && (
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