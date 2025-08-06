// App.tsx

/* 잠시 로그인 화면만 실행
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login";
import Signup from "./screens/Signup";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/

// 원래코드
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FirstScreen from "./screens/FirstScreen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import Permission from "./screens/Permission";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
SplashScreen.preventAutoHideAsync();

type RootStackParamList = {
  First: undefined;
  MainTabs: undefined;
  Permission: undefined;
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 네이티브 스플래시(로고) 보여주는 동안 할 최소 초기화가 있으면 여기.
        await new Promise((r) => setTimeout(r, 500)); // 필요 없으면 줄이거나 지워
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
      await SplashScreen.hideAsync(); // Expo 스플래시 숨김
    }
  }, [isReady]);

  if (!isReady) return null; // 네이티브 스플래시 유지

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="First" component={FirstScreen} />
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Permission" component={Permission} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
