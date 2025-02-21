import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import CustomDrawer from "./CustomDrawer";

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
