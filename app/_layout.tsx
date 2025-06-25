import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../styles/GlobalStyles";

// Import reflection metadata for better type support
import "reflect-metadata";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false, // Hide default headers since we have custom ones
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: "slide_from_right",
        }}
      >
        {/* Define all main routes explicitly */}
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Stack.Screen
          name="dictionaries"
          options={{
            title: "Dictionaries",
          }}
        />
        <Stack.Screen
          name="words"
          options={{
            title: "Words",
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: "Not Found",
          }}
        />
      </Stack>
    </>
  );
}