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
    if (facilityType.trim())
      formData.append("facility_type", facilityType.trim());
    formData.append("shelter_name", shelterName.trim());
    if (roadAddress.trim()) formData.append("road_address", roadAddress.trim());
    if (time.trim()) formData.append("time", time.trim());
    if (capacity.trim()) formData.append("capacity", capacity.trim()); // 서버에서 숫자로 파싱
    if (note.trim()) formData.append("note", note.trim());

    formData.append("lat", String(lat));
    formData.append("lng", String(lng));

    // 📌 사진은 있을 때만 append (옵션)
    if (photos.length > 0) {
      photos.forEach((uri, index) => {
        formData.append("photos", {
          uri,
          name: `photo_${index}.jpg`,
          type: "image/jpeg",
        } as any);
        // 서버가 photos[]를 요구하면 키를 "photos[]"로 바꾸세요.
      });
    }

    try {
      const response = await fetch(
        "https://a2a1f1492028.ngrok-free.app/add_shelter",
        {
          method: "POST",
          headers: { Accept: "application/json" }, // Content-Type은 지정하지 않기!
          body: formData,
        }
      );

      const ct = response.headers.get("content-type") || "";
      if (!response.ok) {
        const text = await response.text();
        console.error(`업로드 실패 ${response.status}\n${text}`);
        alert(`업로드 실패(${response.status})`);
        return;
      }

      if (ct.includes("application/json")) {
        const result = await response.json();
        console.log("서버 응답:", result);
        alert("저장 완료!");
        navigation.goBack();
      } else {
        const text = await response.text();
        console.error("JSON 아님, 서버 응답:", text);
        alert("서버가 JSON이 아닌 응답을 보냈어요(콘솔 참고).");
      }
    } catch (e) {
      console.error("업로드 에러:", e);
      alert("업로드 중 오류");
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
                autoCapitalize="none"
              />
              {/* 5. 수용인원 */}
              <Text style={styles.label}>수용인원</Text>
              <TextInput
                style={styles.timeInput}
                value={capacity}
                onChangeText={setCapacity}
                placeholder="인원수 입력"
                keyboardType="number-pad"
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
