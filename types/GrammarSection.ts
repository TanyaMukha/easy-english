import { Feather } from "@expo/vector-icons";

export type GrammarSection = {
  id: string;
  title: string;
  description: string;
  icon?: keyof typeof Feather.glyphMap;
  route?: string;
  color?: string;
};
