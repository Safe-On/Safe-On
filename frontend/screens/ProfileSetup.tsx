// ProfileSetup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import OSvg from "../assets/O.svg";
import OBlackSvg from "../assets/Oblack.svg";
import XSvg from "../assets/X.svg";
import XBlackSvg from "../assets/Xblack.svg";

const ProfileSetup: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedDisease, setSelectedDisease] = useState<"O" | "X">("O");
  const [selectedDisability, setSelectedDisability] = useState<"O" | "X">("O");

  // onPressAgree 함수 정의
  const onPressAgree = async () => {
    try {
      // AsyncStorage에 ProfileSetupDone 저장
      await AsyncStorage.setItem("ProfileSetupDone", "true");

      // 다음 화면으로 이동
      navigation.navigate("BottomTabs", { screen: "Home" });
    } catch (error) {
      console.error("프로필 완료 상태 저장 실패:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              맞춤 쉼터 추천을 위해{"\n"}기본 정보를 알려주세요!
            </Text>
          </View>

          <View style={styles.profileSetupList}>
            {/* 나이 입력 */}
            <View style={styles.profileSetupItemAge}>
              <Text style={styles.profileSetupItemAgeText}>나이</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.profileSetupItemAgeInput}
                  keyboardType="numeric"
                />
                <Text style={styles.unitText}>세</Text>
              </View>
            </View>

            {/* 질환 선택 */}
            <View style={styles.profileSetupItemOX}>
              <Text style={styles.profileSetupItemOXText}>질환</Text>
              <View style={styles.OXButtonContainer}>
                <Pressable onPress={() => setSelectedDisease("O")}>
                  {selectedDisease === "O" ? (
                    <OSvg width={100} height={100} />
                  ) : (
                    <OBlackSvg width={100} height={100} />
                  )}
                </Pressable>

                <Pressable onPress={() => setSelectedDisease("X")}>
                  {selectedDisease === "X" ? (
                    <XSvg width={100} height={100} />
                  ) : (
                    <XBlackSvg width={100} height={100} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* 장애 선택 */}
            <View style={styles.profileSetupItemOX}>
              <Text style={styles.profileSetupItemOXText}>장애</Text>
              <View style={styles.OXButtonContainer}>
                <Pressable onPress={() => setSelectedDisability("O")}>
                  {selectedDisability === "O" ? (
                    <OSvg width={100} height={100} />
                  ) : (
                    <OBlackSvg width={100} height={100} />
                  )}
                </Pressable>

                <Pressable onPress={() => setSelectedDisability("X")}>
                  {selectedDisability === "X" ? (
                    <XSvg width={100} height={100} />
                  ) : (
                    <XBlackSvg width={100} height={100} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* 시작 버튼 */}
          <View style={styles.footerbutton}>
            <Pressable style={styles.button} onPress={onPressAgree}>
              <Text style={styles.buttonText}>시작하기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flex: 0.2,
  },
  title: {
    marginTop: 40,
    fontSize: 24,
    fontWeight: "600",
  },
  profileSetupList: {
    flex: 0.6,
    marginTop: 15,
  },
  profileSetupItemAge: {
    marginBottom: 36,
  },
  profileSetupItemAgeText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  unitText: {
    position: "absolute",
    left: 100,
    top: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "61b677",
  },
  profileSetupItemAgeInput: {
    borderRadius: 8,
    padding: 18,
    width: 130,
    height: 50,
    backgroundColor: "#dff5e4",
  },
  profileSetupItemOX: {
    marginBottom: 36,
    width: "100%",
  },
  profileSetupItemOXText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  OXButtonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  OButton: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
  XButton: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
  footerbutton: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#34A853",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
    marginBottom: -55,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
