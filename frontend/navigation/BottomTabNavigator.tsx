import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Map from "../screens/Map";
import Home from "../screens/Home";
import Settings from "../screens/Settings";
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

type TabParamList = {
  Map: undefined;
  Home: undefined;
  Settings: undefined;
};

// Ionicons에서 사용할 아이콘 이름을 직접 명시
type IoniconName = "home" | "home-outline" | "map-outline" | "settings-outline";

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<TabParamList, keyof TabParamList>;
      }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: IoniconName = "home";

          if (route.name === "Map") iconName = "map-outline";
          else if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Settings") iconName = "settings-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
