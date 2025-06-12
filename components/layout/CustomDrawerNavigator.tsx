import { useColorScheme } from "react-native";
import { Drawer } from "expo-router/drawer";

import CustomDrawer from "./CustomDrawer";
import Colors from "../../constants/Colors";

const CustomDrawerNavigator = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      initialRouteName="index"
      screenOptions={{
        drawerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].drawerBackgroundColor,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      {children}
    </Drawer>
  );
};

export default CustomDrawerNavigator;
