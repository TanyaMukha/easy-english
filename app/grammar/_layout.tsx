import React from "react";
import { router, Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import Colors from "../../constants/Colors";
import CustomDrawer from "../../components/layout/CustomDrawer";
import CustomDrawerNavigator from "../../components/layout/CustomDrawerNavigator";

export default function GrammarLayout() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme();

  return (
    <CustomDrawerNavigator>
      <Drawer.Screen
        name="index"
        options={{
          title: t("grammar.title"),
        }}
      />
    </CustomDrawerNavigator>
  );
}
