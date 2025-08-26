import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SHome from "../screens/Home_Senior";
import AddShelter_Senior from "../screens/AddShelter_Senior";

const Stack = createNativeStackNavigator();

export default function SeniorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SHome" component={SHome} />
      <Stack.Screen name="SAddShelter" component={AddShelter_Senior} />
      {/* 시니어 전용 화면 추가 */}
    </Stack.Navigator>
  );
}
