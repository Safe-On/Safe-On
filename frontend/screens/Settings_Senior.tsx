import React from "react";
// cSpell:ignore Pressable
import { View, StyleSheet, Pressable, Text, ScrollView, TouchableOpacity } from "react-native";
import ToggleButton from "../components/ToggleButton";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

export default function Settings_Senior() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [inSeniorMode, setInSeniorMode] = React.useState(false);
  const [ttsMode, setTtsMode] = React.useState(false);
  const [notificationMode, setNotificationMode] = React.useState(false);
  const [language, setLanguage] = React.useState("한국어");

  const handleLanguageChange = () => {
    setLanguage((prev) => (prev === "한국어" ? "English" : "한국어"));
  };

  return (
    <SafeAreaView style={styles.SafeAreaView} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>설정</Text>
      </View>
      <View style={styles.container}>
        {/* 스크롤 가능한 설정 목록 */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.main}>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate("SProfile")}
          >
            <Text style={styles.buttonText}>내 정보</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleLanguageChange}>
            <Text style={styles.buttonText}>언어</Text>
            <Text style={styles.buttonText}>{language}</Text>
          </Pressable>

          <View style={styles.button}>
            <Text style={styles.buttonText}>시니어 모드</Text>
            <ToggleButton value={inSeniorMode} onToggle={setInSeniorMode} />
          </View>

          <View style={styles.button}>
            <Text style={styles.buttonText}>TTS 모드</Text>
            <ToggleButton value={ttsMode} onToggle={setTtsMode} />
          </View>

          <View style={styles.button}>
            <Text style={styles.buttonText}>알림 모드</Text>
            <ToggleButton
              value={notificationMode}
              onToggle={setNotificationMode}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: -2,
    fontSize: 35,
    fontWeight: "700",
  },
  main: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: {
    fontSize: 25,
    fontWeight: "400",
  },
  backBtn: { position: "absolute", left: 16, top: 50 },
});