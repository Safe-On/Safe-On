import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabNavigator from "./BottomTabNavigator";

import FirstScreen from "../screens/FirstScreen";
import Permission from "../screens/Permission";
import ShelterDetail from "../screens/ShelterDetail";
import Profile from "../screens/Profile";
import Signup from "../screens/Signup";
import Login from "../screens/Login";
import AddShelter from "../screens/AddShelter";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={FirstScreen} />
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
