// screens/FirstScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "First">;

const FirstScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    if (__DEV__) {
      AsyncStorage.removeItem("PermissionAgreed");
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        const permissionAgreed = await AsyncStorage.getItem("PermissionAgreed");
        const loggedIn = await AsyncStorage.getItem("LoggedIn");
        if (permissionAgreed === "true") {
          if (loggedIn === "true") {
            navigation.replace("BottomTabs", { screen: "Home" }); // 권한도 동의했고, 로그인도 되어 있으면 홈으로
          } else {
            navigation.replace("Login"); // 권한 동의했지만 로그인 안 했으면 로그인 화면으로
          }
        } else {
          navigation.replace("Permission"); // 권한 동의 안 했으면 권한 화면으로
        }
      } catch (e) {
        console.warn("초기화 오류:", e);
      }
    }
    initialize();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* 로고 */}
      <Image source={require("../assets/icon.png")} style={styles.logo} />

      {/* 상황 표시 */}
      <Text style={styles.text}>로딩 중...</Text>
      <ActivityIndicator size="small" />

      {/* 필요하면 애니메이션이나 버전 표시도 가능 */}
    </View>
  );
};

export default FirstScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});
