import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
        },
        headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
      }}
    />
  );
}
