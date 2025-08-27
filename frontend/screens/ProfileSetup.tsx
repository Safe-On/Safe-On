// ProfileSetup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";

type ProfileSetupProps = RouteProp<RootStackParamList, "ProfileSetup">;
export default function ProfileSetup() {
  const route = useRoute<ProfileSetupProps>();
  const navigation = useNavigation<any>();
  const { email, password } = route.params;

  const [age, setAge] = useState("");
  const [healthType, setHealthType] = useState<null | number>(null);

  const handleCompleteSignup = async () => {
    console.log("✅ handleCompleteSignup 함수 실행됨");
    try {
      const payload = {
        email,
        password,
        age: parseInt(age, 10),
        health_type: healthType,
      };

      console.log("회원가입 시도", payload);
      const response = await fetch(
        "https://e80451de14f5.ngrok-free.app/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            age: parseInt(age, 10),
            health_type: healthType,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorText = await response.text(); // 한 번만 읽기
        console.error("HTML 응답:", errorText);
        throw new Error("회원가입에 실패했습니다."); // Alert 용
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("회원가입 성공 응답:", data);
        Alert.alert("회원가입 완료");
        navigation.navigate("Login");
      } else {
        const text = await response.text();
        console.error("예상치 못한 응답:", text);
        throw new Error("예상치 못한 응답입니다.");
      }
    } catch (error) {
      console.error("회원가입 중 오류:", error);
    }
  };
  const healthTypeOptions = [
    {
      id: 1,
      title: "[유형 A-1]",
      subtitle1: "경증 장애 (급성 호흡기 장애, 경미한 보행 장애 등)",
      subtitle2: "0~1.5km",
    },
    {
      id: 2,
      title: "[유형 A-2]",
      subtitle1: "중증 장애 (만성 호흡기 장애, 보행 보조기구 사용 등)",
      subtitle2: "0~0.5km",
    },
    {
      id: 3,
      title: "[유형 B-1]",
      subtitle1: "경증 질환 (급성 호흡기 질환, 경미한 질환 등)",
      subtitle2: "0~2km",
    },
    {
      id: 4,
      title: "[유형 B-2]",
      subtitle1: "중증 질환 (만성 호흡기 질환, 보행 보조기구 사용 등)",
      subtitle2: "0~2km",
    },
    {
      id: 5,
      title: "[유형 C-1]",
      subtitle1: "80세 미만 노인 (65~79세)",
      subtitle2: "0~2.5km",
    },
    {
      id: 6,
      title: "[유형 C-2]",
      subtitle1: "80세 이상 노인",
      subtitle2: "0~1.5km",
    },
    {
      id: 7,
      title: "[유형 D-1]",
      subtitle1: "임신 초기",
      subtitle2: "0~2.5km",
    },
    {
      id: 8,
      title: "[유형 D-2]",
      subtitle1: "임신 후기",
      subtitle2: "0~1.5km",
    },
    {
      id: 9,
      title: "[유형 E]",
      subtitle1: "해당 사항 없음",
      subtitle2: "이동거리 제한 없음",
    },
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>
            맞춤 쉼터 추천을 위해{"\n"}기본 정보를 알려주세요!
          </Text>

          {/* 나이 입력 */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>나이</Text>
            <TextInput
              style={styles.ageInput}
              keyboardType="numeric"
              onChangeText={setAge}
              value={age}
              placeholder="나이 입력"
            />
            <Text style={styles.unitText}>세</Text>
          </View>

          {/* 걸을 수 있는 시간 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              한 번에 걸을 수 있는 시간을 알려주세요.{"\n"}*현재 건강 상태 기준
            </Text>
            {healthTypeOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setHealthType(option.id)}
                style={[
                  styles.optionButton,
                  healthType === option.id && styles.optionButtonSelected,
                ]}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle1}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle2}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* 시작 버튼 */}
        <View style={styles.footer}>
          <Pressable style={styles.startButton} onPress={handleCompleteSignup}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: { fontSize: 24, fontWeight: "600", marginVertical: 40 },
  inputWrapper: { marginBottom: 30, position: "relative" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  ageInput: {
    borderRadius: 8,
    padding: 15,
    width: 130,
    height: 50,
    backgroundColor: "#dff5e4",
    fontSize: 16,
  },
  unitText: {
    position: "absolute",
    left: 140,
    top: 42,
    fontSize: 16,
    fontWeight: "600",
  },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  optionButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  optionButtonSelected: {
    backgroundColor: "#d1f4d9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: "#666" },
  startButton: {
    backgroundColor: "#34A853",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
  },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
  },
});
