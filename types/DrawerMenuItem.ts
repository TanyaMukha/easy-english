import { IconFontFamily, IconName } from "../components/ui/IconComponent";

export type DrawerMenuItem = {
  id: string;
  title: string;
  icon: {
    family: IconFontFamily;
    name: IconName<IconFontFamily>;
  };
  route?: string;
  color?: string;
}