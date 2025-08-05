// screens/FirstScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  First: undefined;
  MainTabs: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "First">;

const FirstScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    async function initialize() {
      try {
        // 실제 초기화 작업들: 예시
        // await restoreAuthState();
        // await fetchUserSettings();
        await new Promise((r) => setTimeout(r, 1000)); // 예시 지연
      } catch (e) {
        console.warn("초기화 오류:", e);
      } finally {
        // 준비 끝나면 메인 탭으로 이동 (스택을 교체)
        navigation.replace("MainTabs");
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
