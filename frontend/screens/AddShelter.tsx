import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import Home from "./Home";

export default function AddShelter() {
  const [images, setImages] = useState<string[]>([]);
  const [shelterName, setShelterName] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [climateOption, setClimateOption] = useState<"on" | "off" | null>(null);
  const [details, setDetails] = useState("");
  const navigation = useNavigation<any>();

  const pickImage = async () => {
    // 권한 요청
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("사진 접근 권한이 필요합니다!");
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSave = () => {
    const shelterData = {
      name: shelterName,
      time: visitTime,
      climate: climateOption,
      details: details,
      photos: images,
    };

    console.log("저장할 데이터:", shelterData);
    alert("저장완료 (현재는 콘솔에만 저장)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        {/*1. 쉼터 추가*/}
        <View style={styles.floatingBtn}>
          <MaterialIcons name="add" size={30} color="#fff" />
        </View>
        <Text style={styles.title}> 쉼터 추가</Text>
      </View>

      <View style={styles.addBox}>
        {/* 2. 쉼터 등록 */}
        <TextInput
          style={styles.searchInput}
          value={shelterName}
          onChangeText={setShelterName}
          placeholder="쉼터 이름 입력"
        />
        {/* 3. 운영시간 */}
        <View style={styles.checkItem}>
          {/* 방문 시간 */}
          <Text style={styles.label}>운영 시간</Text>
          <TextInput
            style={styles.timeInput}
            value={visitTime}
            onChangeText={setVisitTime}
            placeholder="00:00"
          />
        </View>
        {/* 4. 냉난방 여부 */}
        <View style={styles.checkItem}>
          <Text style={styles.label}>냉난방 여부</Text>
          <View style={styles.checkRow}>
            <TouchableOpacity onPress={() => setClimateOption("on")}>
              <MaterialIcons
                name={
                  climateOption === "on"
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={24}
                color="#34A853"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setClimateOption("off")}>
              <MaterialIcons
                name={
                  climateOption === "off"
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={24}
                color="#EA4335"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* 5. 상세내용 */}
        <Text style={styles.label}>상세 내용</Text>
        <TextInput
          style={[styles.detailInput, { height: 80 }]}
          value={details}
          onChangeText={setDetails}
          multiline
        />
        {/* 6. 사진 등록 */}
        <Text style={styles.label}>사진 등록</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.preview} />
          ))}

          {/* + 버튼 */}
          <TouchableOpacity style={styles.addBox} onPress={pickImage}>
            <MaterialIcons name="add" size={40} color="#ccc" />
          </TouchableOpacity>
        </ScrollView>

        {/* 7. 작성완료 버튼 */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>저장하기</Text>
        </TouchableOpacity>
      </View>

      {/* 8. 하단바 */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    position: "relative",
    paddingTop: 50,
    marginLeft: 20,
  },
  backBtn: {
    marginRight: 80,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 0,
    fontSize: 25,
    alignItems: "center",
  },
  floatingBtn: {
    alignItems: "center",
    backgroundColor: "#34A853",
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  addBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    right: -10,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#34A853",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
  preview: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 6,
  },
});
