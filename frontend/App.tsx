// App.tsx
/*
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./navigation/AppNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((r) => setTimeout(r, 500));
      } catch (e) {
        console.warn("초기화 중 오류:", e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
}
*/
// 특정 스크린만 테스트 하고 싶은 경우, 아래 코드 수정해서 사용

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileSetup from "./screens/ProfileSetup";
import Home from "./screens/Home";
import AddShelter from "./screens/AddShelter";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import Profile from "./screens/Profile";
import ShelterDetail from "./screens/ShelterDetail";

export type RootStackParamList = {
  BottomTabs: undefined;
  Profile: undefined;
  AddShelter: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  ShelterDetail: { shelterId: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ShelterDetail"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AddShelter" component={AddShelter} />
        <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="ShelterDetail"
          component={ShelterDetail}
          initialParams={{ shelterId: "TEST_001" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

