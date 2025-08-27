// App.tsx
/*
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 추가
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./navigation/AppNavigator";
import {
  SeniorModeProvider,
  useSeniorMode,
} from "./contexts/SeniorModeContext";
import SeniorNavigator from "./navigation/SeniorNavigator";
import { NavigationContainer } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

function Root() {
  const { isSenior, loading } = useSeniorMode();
  if (loading) return null;
  return isSenior ? <SeniorNavigator /> : <AppNavigator />;
}

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
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SeniorModeProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </SeniorModeProvider>
    </GestureHandlerRootView>
  );
}
*/
/*
// 특정 스크린만 테스트 하고 싶은 경우, 아래 코드 수정해서 사용
import "react-native-gesture-handler";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileSetup from "./screens/ProfileSetup";
import Home from "./screens/Home";
import AddShelter from "./screens/AddShelter";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import Profile from "./screens/Profile";
import ShelterDetail from "./screens/ShelterDetail";
import Star from "./screens/Star";
import SHome from "./screens/Home_Senior"
import SAdd from "./screens/AddShelter_Senior";
import SStar from "./screens/Star_Senior";
import SSetting from "./screens/Settings_Senior"
import Setting from "./screens/Settings";
import SProfile from "./screens/Profile_Senior";
import SShelterDetail from "./screens/ShelterDetail_Senior";
import SLogin from "./screens/Login_Senior";

export type RootStackParamList = {
  BottomTabs: undefined;
  Profile: undefined;
  AddShelter: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  ShelterDetail: { shelterId: string } | undefined;
  Star: undefined;
  SHome: undefined;
  SAdd: undefined;
  SStar: undefined;
  SSetting: undefined;
  Setting: undefined;
  SProfile: undefined;
  SShelterDetail: undefined;
  SLogin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="AddShelter" component={AddShelter} />
          <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Star" component={Star} />
          <Stack.Screen name="SHome" component={SHome} />
          <Stack.Screen name="SAdd" component={SAdd} />
          <Stack.Screen name="SStar" component={SStar} />
          <Stack.Screen name="SSetting" component={SSetting} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="SProfile" component={SProfile} />
          <Stack.Screen name="SShelterDetail" component={SShelterDetail} />
          <Stack.Screen name="SLogin" component={SLogin} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
*/

/* 시니어모드 변환 테스트 */
// App.tsx — 이 파일만 수정

import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileSetup from "./screens/ProfileSetup";
import Home from "./screens/Home";
import AddShelter from "./screens/AddShelter";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import Profile from "./screens/Profile";
import ShelterDetail from "./screens/ShelterDetail";
import Star from "./screens/Star";
import SHome from "./screens/Home_Senior";
import SAdd from "./screens/AddShelter_Senior";
import SStar from "./screens/Star_Senior";
import SSetting from "./screens/Settings_Senior";
import Setting from "./screens/Settings";
import SProfile from "./screens/Profile_Senior";
import SShelterDetail from "./screens/ShelterDetail_Senior";
import SLogin from "./screens/Login_Senior";
import * as SplashScreen from "expo-splash-screen";
import { SeniorModeProvider, useSeniorMode } from "./contexts/SeniorModeContext";

export type RootStackParamList = {
  BottomTabs: undefined;
  Profile: undefined;
  AddShelter: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  ShelterDetail: { shelterId: string } | undefined;
  Star: undefined;
  // 시니어
  SHome: undefined;
  SAdd: undefined;
  SStar: undefined;
  SSetting: undefined;
  Setting: undefined;
  SProfile: undefined;
  SShelterDetail: undefined;
  SLogin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

// 🔸 토글 상태로 일반/시니어 스택을 갈아끼우는 테스트용 루트
function RootStacks() {
  const { isSenior, loading } = useSeniorMode();
  if (loading) return null;

  if (isSenior) {
    // 시니어 모드일 때: 시니어 설정 화면부터 시작
    return (
      <Stack.Navigator initialRouteName="SSetting" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SLogin" component={SLogin} />
        <Stack.Screen name="SHome" component={SHome} />
        <Stack.Screen name="SAdd" component={SAdd} />
        <Stack.Screen name="SStar" component={SStar} />
        <Stack.Screen name="SSetting" component={SSetting} />
        <Stack.Screen name="SProfile" component={SProfile} />
        <Stack.Screen name="SShelterDetail" component={SShelterDetail} />
      </Stack.Navigator>
    );
  }

  // 일반 모드일 때: 일반 설정 화면부터 시작
  return (
    <Stack.Navigator initialRouteName="Setting" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="AddShelter" component={AddShelter} />
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Star" component={Star} />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen name="ShelterDetail" component={ShelterDetail} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 500));
      setIsReady(true);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) await SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SeniorModeProvider>
        <NavigationContainer>
          <RootStacks />
        </NavigationContainer>
      </SeniorModeProvider>
    </GestureHandlerRootView>
  );
}
