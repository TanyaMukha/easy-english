import { Drawer } from "expo-router/drawer";
import React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerShown: true,
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Home",
              headerTitle: "Home",
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
