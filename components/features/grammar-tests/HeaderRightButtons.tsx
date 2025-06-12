import React, { FC } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "../../../constants/Colors";

interface IHeaderRightButtons {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const HeaderRightButtons: FC<IHeaderRightButtons> = ({
  isEditing,
  setIsEditing,
}) => {
  const colorScheme = useColorScheme();

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push("/tests/import" as any)}
        style={{ ...styles.topMenuButton, marginRight: 16 }}
      >
        <Text style={styles.topMenuButtonText}>
          <MaterialCommunityIcons
            name="database-import-outline"
            size={32}
            color={Colors[colorScheme ?? "light"].text}
            style={{ marginRight: 15 }}
          />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsEditing(!isEditing)}
        style={{ ...styles.topMenuButton, marginRight: 16 }}
      >
        <Text style={styles.topMenuButtonText}>
          <MaterialIcons
            name={isEditing ? "edit-off" : "edit"}
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  topMenuButton: {
    alignSelf: "center",
    marginRight: 16,
  },
  topMenuButtonText: {
    fontSize: 24,
  },
});

export default HeaderRightButtons;
