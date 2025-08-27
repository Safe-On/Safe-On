import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { KAKAO_REST_API_KEY } from "@env";
type AddShelterRouteProp = RouteProp<RootStackParamList, "AddShelter">;

export default function AddShelter() {
  const [facilityType, setFacilityType] = useState("");
  const [shelterName, setShelterName] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const route = useRoute<AddShelterRouteProp>();
  const { lat, lng } = route.params;
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
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          "https://dapi.kakao.com/v2/local/geo/coord2address.json",
          {
            params: { x: lng, y: lat },
            headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
          }
        );
        const doc = res.data?.documents?.[0];
        const road =
          doc?.road_address?.address_name || doc?.address?.address_name;
        if (road) {
          setRoadAddress((prev) => prev || road);
        }
      } catch (e) {
        console.error("역지오코딩 실패:", e);
      }
    })();
  }, [lat, lng]);

  const handleSave = async () => {
    if (!shelterName.trim()) {
      alert("쉼터 이름을 입력하세요.");
      return;
    }
    const formData = new FormData();
    formData.append("facility_type_2", facilityType);
    formData.append("shelter_name", shelterName);
    formData.append("road_address", roadAddress);
    formData.append("time", time);
    formData.append("capacity", capacity);
    formData.append("note", note);
    formData.append("lat", String(lat));
    formData.append("lng", String(lng));
    photos.forEach((uri, index) => {
      formData.append("photos", {
        uri,
        type: "image/jpeg", // PNG면 "image/png"
        name: `photo_${index}.jpg`,
      } as any);
    });
    try {
      const response = await fetch("http://<서버주소>/add_shelter", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("서버 응답:", result);
      alert("저장 완료!");
      navigation.navigate("Map");
    } catch (error) {
      console.error("업로드 에러:", error);
      alert("업로드 실패");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.container}>
          <View style={styles.header}>
            {/* 0. 뒤로가기 */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="black" />
            </TouchableOpacity>
            {/* 0. 쉼터 추가*/}
            <View style={styles.floatingBtn}>
              <MaterialIcons name="add" size={30} color="#fff" />
            </View>
            <Text style={styles.title}> 쉼터 추가</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.addBox}>
              {/* 1. 사진 등록 */}
              <Text style={styles.label}>사진 등록</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.preview} />
                ))}

                {/* + 버튼 */}
                <TouchableOpacity
                  style={styles.photoAddBtn}
                  onPress={pickImage}
                >
                  <MaterialIcons name="add" size={40} color="#ccc" />
                </TouchableOpacity>
              </ScrollView>
              {/* 2. 쉼터 이름 */}
              <Text style={styles.label}>쉼터 이름</Text>
              <TextInput
                style={styles.searchInput}
                value={shelterName}
                onChangeText={setShelterName}
                placeholder="쉼터 이름 입력"
              />
              {/* 3. 주소 */}
              <Text style={styles.label}>주소</Text>
              <TextInput
                style={styles.searchInput}
                value={roadAddress}
                onChangeText={setRoadAddress}
                placeholder="주소 입력"
              />
              {/* 4. 쉼터 유형 */}
              <Text style={styles.label}>쉼터 유형</Text>
              <TextInput
                style={styles.searchInput}
                value={facilityType}
                onChangeText={setFacilityType}
                placeholder="쉼터 유형 입력"
              />
              {/* 5. 운영시간 */}
              <Text style={styles.label}>운영 시간</Text>
              <TextInput
                style={styles.timeInput}
                value={time}
                onChangeText={setTime}
                placeholder="00:00"
              />
              {/* 5. 수용인원 */}
              <Text style={styles.label}>수용인원</Text>
              <TextInput
                style={styles.timeInput}
                value={capacity}
                onChangeText={setCapacity}
                placeholder="인원수 입력"
              />
              {/* 6. 상세내용 */}
              <Text style={styles.label}>상세 내용</Text>
              <TextInput
                style={[styles.detailInput, { height: 80 }]}
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
          </ScrollView>

          {/* 7. 작성완료 버튼 */}
          <View style={styles.btnBox}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    position: "relative",
    marginLeft: 2,
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
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  photoAddBtn: {
    marginTop: 12,
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 30,
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
  btnBox: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#34A853",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  preview: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 6,
  },
});
