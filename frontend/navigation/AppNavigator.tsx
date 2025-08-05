// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import BottomTabNavigator from "./BottomTabNavigator"; // 경로 확인
import FirstScreen from "../screens/FirstScreen";
import Permission from "../screens/Permission";
import ShelterDetail from "../screens/ShelterDetail";
import Profile from "../screens/Profile";
import Signup from "../screens/Signup";
import Login from "../screens/Login";
import AddShelter from "../screens/AddShelter";

export type RootStackParamList = {
  First: undefined;
  Permission: undefined;
  MainTabs: undefined;
  ShelterDetail: { shelterId: string } | undefined; // 필요하면 파라미터 타입 맞춰
  Profile: undefined;
  Signup: undefined;
  Login: undefined;
  AddShelter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="Permission" component={Permission} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ShelterDetail" component={ShelterDetail} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AddShelter" component={AddShelter} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
