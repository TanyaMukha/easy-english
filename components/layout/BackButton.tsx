import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "../theme/useColorScheme";
import Colors from "../../constants/Colors";

interface BackButtonProps {
  route?: string;
  size?: number;
}

const BackButton: React.FC<BackButtonProps> = ({ route, size = 24 }) => {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    if (route) {
      router.push(route as any);
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ marginLeft: 16, marginRight: 16 }}
    >
      <Feather
        name="arrow-left"
        size={size}
        color={Colors[colorScheme ?? "light"].text}
      />
    </TouchableOpacity>
  );
};

export default BackButton;