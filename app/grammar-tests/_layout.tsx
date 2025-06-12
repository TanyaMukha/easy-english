import React from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { Drawer } from "expo-router/drawer";

import CustomDrawerNavigator from "../../components/layout/CustomDrawerNavigator";
import BackButton from "../../components/layout/BackButton";

export default function GrammarTestsLayout() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme();

  return (
    <CustomDrawerNavigator>
      <Drawer.Screen
        name="index"
        options={{
          title: t("grammarTests.title"),
        }}
      />
      <Drawer.Screen
        name="custom-test"
        options={{
          title: t("tests.title"),
          headerLeft: () => <BackButton route="/grammar-tests" />,
        }}
      />
    </CustomDrawerNavigator>
  );
}
