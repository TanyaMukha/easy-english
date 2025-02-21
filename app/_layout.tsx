import { Drawer } from "expo-router/drawer";
import React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CustomDrawer from "../components/layout/CustomDrawer";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          initialRouteName="index"
          screenOptions={{
            drawerStyle: {
              backgroundColor: "#FFFFFF",
            },
          }}
          drawerContent={(props: any) => <CustomDrawer {...props} />}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Home",
              headerTitle: "Home",
            }}
          />
          <Drawer.Screen
            name="page-not-found"
            options={{
              drawerLabel: "Not Found",
              headerTitle: "Not Found",
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
