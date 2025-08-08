import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, Text, ScrollView } from "react-native";
import ToggleButton from "../components/ToggleButton";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-gesture-handler";

export default function Profile() {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [age, setAge] = React.useState("");
  const [disease, setDisease] = React.useState("X");
  const [disability, setDisability] = React.useState("X");

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedAge = await AsyncStorage.getItem("age");
        const savedDisease = await AsyncStorage.getItem("disease");
        const savedDisability = await AsyncStorage.getItem("disability");
        console.log("loadData - age:", savedAge);
        console.log("loadData - disease:", savedDisease);
        console.log("loadData - disability:", savedDisability);
        setAge(savedAge || "");
        setDisease(savedDisease || "X");
        setDisability(savedDisability || "X");
      } catch (e) {
        console.error("AsyncStorage 불러오기 실패", e);
      }
    };
    loadData();
  }, []);

  const saveProfile = async () => {
    await AsyncStorage.setItem("name", name);
    await AsyncStorage.setItem("phone", phone);
    alert("프로필이 저장되었습니다!");
  };
  return (
    <SafeAreaView style={styles.SafeAreaView} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>내 정보</Text>
      </View>
      <View style={styles.container}>
        {/* 스크롤 가능한 설정 목록 */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.main}>
          <View style={styles.label}>
            <Text style={styles.labelText}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.label}>
            <Text style={styles.labelText}>전화번호</Text>
            <TextInput
              style={styles.input}
              placeholder="전화번호를 입력해주세요"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.label}>
            <Text style={styles.labelText}>나이</Text>
            <Text>{age} 세</Text>
          </View>

          <View style={styles.label}>
            <Text style={styles.labelText}>질환</Text>
            <Pressable
              onPress={() => {
                const newVal = disease === "O" ? "X" : "O";
                setDisease(newVal);
                AsyncStorage.setItem("disease", newVal);
              }}
            >
              <Text>{disease}</Text>
            </Pressable>
          </View>

          <View style={styles.label}>
            <Text style={styles.labelText}>장애</Text>
            <Pressable
              onPress={() => {
                const newVal = disability === "O" ? "X" : "O";
                setDisability(newVal);
                AsyncStorage.setItem("disability", newVal);
              }}
            >
              <Text>{disability}</Text>
            </Pressable>
          </View>
        </ScrollView>
        <View style={styles.footerbutton}>
          <Pressable style={styles.button} onPress={saveProfile}>
            <Text style={styles.buttonText}>저장하기</Text>
          </Pressable>
        </View>
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
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    height: 42,
  },
  title: {
    marginTop: -4,
    fontSize: 18,
    fontWeight: "700",
  },
  main: {
    paddingTop: 16,
  },
  label: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelText: {
    fontSize: 16,
    fontWeight: "400",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#eaeaea",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "400",
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
