// navigation/SeniorAppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SeniorBottomNavigator from "./SeniorBottomNavigator"; // ✅ 이름 명확히
import ShelterDetail_Senior from "../screens/ShelterDetail_Senior";

export type SeniorRootStackParamList = {
  SBottomTabs: undefined; // 탭 루트
  SShelterDetail: { shelterId: string; table: string }; // 탭 밖에서 푸시할 상세만
};

const Stack = createNativeStackNavigator<SeniorRootStackParamList>();

export default function SeniorAppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SBottomTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SBottomTabs" component={SeniorBottomNavigator} />
      <Stack.Screen name="SShelterDetail" component={ShelterDetail_Senior} />
    </Stack.Navigator>
  );
}
