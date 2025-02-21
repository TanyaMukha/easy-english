import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { ComponentProps } from "react";

export enum IconFontFamily {
  Ionicons = "Ionicons",
  FontAwesome = "FontAwesome",
}

// Types for icon names based on their components
export type IoniconsNames = ComponentProps<typeof Ionicons>["name"];
export type FontAwesomeNames = ComponentProps<typeof FontAwesome>["name"];

// Icon type mapping interface
interface IconTypeMap {
  [IconFontFamily.Ionicons]: IoniconsNames;
  [IconFontFamily.FontAwesome]: FontAwesomeNames;
}

// Icon components mapping
export const IconComponents = {
  [IconFontFamily.Ionicons]: Ionicons,
  [IconFontFamily.FontAwesome]: FontAwesome,
} as const;

// Helper type for getting correct icon name based on family
export type IconName<T extends IconFontFamily> = IconTypeMap[T];

export const IconComponent = ({
  family,
  name,
  color,
  size = 24,
}: {
  family: IconFontFamily;
  name: IconName<IconFontFamily>;
  color?: string;
  size?: number;
}) => {
  const Icon = IconComponents[family];

  return (
    <Icon
      name={name as any}
      size={size}
      color={color || "#666"}
      style={{ marginRight: 16 }}
    />
  );
};

export default IconComponent;
