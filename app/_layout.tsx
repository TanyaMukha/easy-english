import { Drawer } from "expo-router/drawer";
import React from "react";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CustomDrawer from "../components/layout/CustomDrawer";
import "../i18n";
import CustomDrawerNavigator from "../components/layout/CustomDrawerNavigator";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CustomDrawerNavigator>
          <Drawer.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
          <Drawer.Screen
            name="page-not-found"
            options={{
              title: "Not Found",
            }}
          />
          <Drawer.Screen
            name="grammar"
            options={{
              headerShown: false,
            }}
          />
        </CustomDrawerNavigator>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
