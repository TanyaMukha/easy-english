import { DrawerMenuItem } from "../components/layout/CustomDrawer";
import { IconFontFamily } from "../components/ui/IconComponent";

export const MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: "home",
    title: "menu.home",
    icon: { family: IconFontFamily.FontAwesome, name: "home" },
    route: "/",
  },
  {
    id: "dictionary",
    title: "menu.dictionary",
    icon: { family: IconFontFamily.FontAwesome, name: "book" },
    // route: "/dictionary",
  },
  {
    id: "units",
    title: "menu.units",
    icon: { family: IconFontFamily.Ionicons, name: "list-sharp" },
    // route: "/units",
  },
  {
    id: "learning-words",
    title: "menu.wordLearning",
    icon: { family: IconFontFamily.Ionicons, name: "school-outline" },
    // route: "/learning-words",
  },
  {
    id: "learning-irregular",
    title: "menu.irregularForms",
    icon: { family: IconFontFamily.Ionicons, name: "library-outline" },
    // route: "/learning-irregular-forms",
  },
  {
    id: "tests",
    title: "menu.tests",
    icon: { family: IconFontFamily.FontAwesome, name: "question-circle-o" },
    // route: "/tests",
  },
  {
    id: "grammar",
    title: "menu.grammar",
    icon: { family: IconFontFamily.Ionicons, name: "book-outline" },
    // route: "/grammar",
  },
  {
    id: "statistics",
    title: "menu.statistics",
    icon: { family: IconFontFamily.FontAwesome, name: "bar-chart" },
    // route: "/statistics",
  },
  {
    id: "settings",
    title: "menu.settings",
    icon: { family: IconFontFamily.Ionicons, name: "settings-outline" },
    // route: "/settings",
  },
  {
    id: "clear",
    title: "menu.clear",
    icon: { family: IconFontFamily.Ionicons, name: "trash-outline" },
    // route: "/clear",
    color: "red",
  },
  {
    id: "feedback",
    title: "menu.feedback",
    icon: { family: IconFontFamily.Ionicons, name: "mail-outline" },
    // route: "/feedback",
  },
  {
    id: "about",
    title: "menu.about",
    icon: {
      family: IconFontFamily.Ionicons,
      name: "information-circle-outline",
    },
    // route: "/about",
  },
];
