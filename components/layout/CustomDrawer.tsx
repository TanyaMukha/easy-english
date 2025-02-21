import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { router } from "expo-router";
import ModalHeader from "./ModalHeader";
import { IconComponent } from "../ui/IconComponent";
import { MENU_ITEMS } from "../../constants/menuItems";
// import { useTranslation } from "react-i18next";
import { IconFontFamily, IconName } from "../ui/IconComponent";

export interface DrawerMenuItem {
  id: string;
  title: string;
  icon: {
    family: IconFontFamily;
    name: IconName<IconFontFamily>;
  };
  route?: string;
  color?: string;
}

const CustomDrawer: FC<DrawerContentComponentProps> = ({ navigation }) => {
  // const { t } = useTranslation();

  const handleMenuPress = (route: string) => {
    navigation.closeDrawer();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <ModalHeader title={"menu.title"} />

      <ScrollView
        style={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.route ?? "/page-not-found")}
          >
            <IconComponent
              family={item.icon.family}
              name={item.icon.name}
              color={item.color}
            />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#999"
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  menuContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  chevron: {
    opacity: 0.5,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  version: {
    fontSize: 12,
    color: "#999",
  },
});

export default CustomDrawer;
