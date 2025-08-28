// navigation/SeniorBottomNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Home_Senior from "../screens/Home_Senior";
import AddShelter_Senior from "../screens/AddShelter_Senior";
import Map_Senior from "../screens/Map";
import Settings_Senior from "../screens/Settings_Senior";
import Profile_Senior from "../screens/Profile_Senior";
import Login_Senior from "../screens/Login_Senior";
import Signup from "../screens/Signup";
import Star_Senior from "../screens/Star_Senior";

export type SeniorTabParamList = {
  SHomeTab: undefined;
  SMapTab: undefined;
  SSettingsTab:
    | { screen?: keyof SeniorSettingsStackParamList } // 중첩 스택으로 진입 시
    | undefined;
};

export type SeniorHomeStackParamList = {
  SHome: undefined;
  SAdd: undefined;
};

export type SeniorSettingsStackParamList = {
  SSettings: undefined;
  SProfile: undefined;
  SLogin: undefined;
  SSignup: undefined;
  SStar: undefined;
};

const Tab = createBottomTabNavigator<SeniorTabParamList>();
const HomeStack = createNativeStackNavigator<SeniorHomeStackParamList>();
const SettingsStack =
  createNativeStackNavigator<SeniorSettingsStackParamList>();


function SeniorHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="SHome" component={Home_Senior} />
      <HomeStack.Screen name="SAdd" component={AddShelter_Senior} />
    </HomeStack.Navigator>
  );
}

function SeniorSettingsStack() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SSettings" component={Settings_Senior} />
      <SettingsStack.Screen name="SProfile" component={Profile_Senior} />
      <SettingsStack.Screen name="SLogin" component={Login_Senior} />
      <SettingsStack.Screen name="SSignup" component={Signup} />
      <SettingsStack.Screen name="SStar" component={Star_Senior} />
    </SettingsStack.Navigator>
  );
}

export default function SeniorBottomNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      initialRouteName="SHomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 16, fontWeight: "bold" },
        tabBarStyle: {
          height: 58 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
        },
        tabBarIcon: ({ color, size }) => {
          const map: Record<
            keyof SeniorTabParamList,
            keyof typeof Ionicons.glyphMap
          > = {
            SHomeTab: "home",
            SMapTab: "map",
            SSettingsTab: "settings",
          };
          return (
            <Ionicons
              name={map[route.name as keyof SeniorTabParamList]}
              size={size + 8}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "green",
        tabBarInactiveTintColor: "#8E8E93",
      })}
    >
      <Tab.Screen
        name="SHomeTab"
        component={SeniorHomeStack}
        options={{ tabBarLabel: "홈" }}
      />
      <Tab.Screen
        name="SMapTab"
        component={Map_Senior}
        options={{ tabBarLabel: "지도" }}
      />
      <Tab.Screen
        name="SSettingsTab"
        component={SeniorSettingsStack}
        options={{ tabBarLabel: "설정" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // 탭을 누를 때 설정 스택의 루트로 이동
            navigation.navigate("SSettingsTab", { screen: "SSettings" });
          },
        })}
      />
    </Tab.Navigator>
  );
}
