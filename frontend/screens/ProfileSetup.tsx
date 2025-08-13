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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const timeOptions = [
  {
    id: "1",
    title: "10분 미만",
    subtitle1: "이동 보조기구 사용 / 장거리 보행 불가",
    subtitle2: "자주 휴식이 필요하거나 이동 보조기구를 사용한다.",
  },
  {
    id: "2",
    title: "10분~20분 (500m~1.5km)",
    subtitle1: "짧은 거리만 가능",
    subtitle2: "평지는 무리 없으나, 언덕이나 계단은 힘들다.",
  },
  {
    id: "3",
    title: "20분~30분 (1.5km~2.5km)",
    subtitle1: "평소 걷기에 무리가 없음",
    subtitle2: "평지를 무리 없이 걸을 수 있으며, 경사로도 천천히 오를 수 있다.",
  },
  {
    id: "4",
    title: "30분 이상 (2.5km)",
    subtitle1: "평지, 언덕 포함 장거리 이동 가능",
    subtitle2: "장시간 보행 가능, 등산, 장거리 산책이 가능하다.",
  },
];

const diseaseOptions = [
  {
    id: "1",
    title: "보행 보조기구 사용 (예: 휠체어, 지팡이, 보행차)",
  },
  {
    id: "2",
    title: "호흡기, 심혈관 질환",
  },
  {
    id: "3",
    title: "임신 중중",
  },
  {
    id: "4",
    title: "없음",
  },
];

const ProfileSetup: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedDisease, setSelectedDisease] = useState<null | string>(null);
  const [age, setAge] = useState("");
  const [selectedTime, setSelectedTime] = useState<null | string>(null);

  const onPressAgree = async () => {
    try {
      await AsyncStorage.setItem("ProfileSetupDone", "true");
      await AsyncStorage.setItem("age", age);
      await AsyncStorage.setItem("Time", selectedTime ?? "");
      await AsyncStorage.setItem("disability", selectedDisease ?? "");
      console.log("프로필 저장 완료:", {
        age,
        selectedTime,
        selectedDisease,
      });
      navigation.navigate("BottomTabs", { screen: "Home" });
    } catch (error) {
      console.error("프로필 완료 상태 저장 실패:", error);
    }
  };

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
            {timeOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedTime(option.id)}
                style={[
                  styles.optionButton,
                  selectedTime === option.id && styles.optionButtonSelected,
                ]}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle1}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle2}</Text>
              </Pressable>
            ))}
          </View>

          {/* 장애 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              이동에 영향을 주는 건강 상태가 있나요?{"\n"}*중복 선택 가능
            </Text>
            {diseaseOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedDisease(option.id)}
                style={[
                  styles.optionButton,
                  selectedDisease === option.id && styles.optionButtonSelected,
                ]}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* 시작 버튼 */}
        <View style={styles.footer}>
          <Pressable style={styles.startButton} onPress={onPressAgree}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ProfileSetup;

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
  optionButtonSelected: { backgroundColor: "#d1f4d9", borderWidth: 0 },
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
