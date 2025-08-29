// ShelterDetail.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ApiShelter, Shelter } from "./types/shelter";
import { mapApiShelter } from "./utils/mapShelter";

const SCREEN_W = Dimensions.get("window").width;
const H_PADDING = 20;
const ITEM_GAP = 12;
const ITEM_W = SCREEN_W - H_PADDING * 2;

const BASE_URL = "https://3ea2c99591da.ngrok-free.app";

export default function ShelterDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "ShelterDetail">>();
  const shelterId = route.params?.shelterId!;
  const table = route.params?.table!;
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isFav, setIsFav] = useState<boolean>(false);

  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      const { ToastAndroid } = require("react-native");
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("", msg);
    } else {
      if (typeof window !== "undefined" && window.alert) window.alert(msg);
      else console.log(msg);
    }
  };

  const onToggleFavorite = () => {
    setIsFav((prev) => {
      const next = !prev;
      showToast(
        next ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다."
      );
      return next;
    });
  };

  const onPressTTS = async () => {
    try {
      const speaking = await Speech.isSpeakingAsync();
      if (speaking) {
        Speech.stop();
        return;
      }
      const text =
        [
          shelter?.shelterName,
          shelter?.facilityType,
          shelter?.roadAddress && `주소 ${shelter.roadAddress}`,
          shelter?.time && `오늘 운영시간 ${shelter.time}`,
          shelter?.capacity && `수용 인원 ${shelter.capacity}`,
          shelter?.note && `기타 ${shelter.note}`,
        ]
          .filter(Boolean)
          .join(". ") + ".";

      if (text) {
        Speech.speak(text, { language: "ko-KR", rate: 0.8, pitch: 0.8 });
      }
    } catch (error) {
      console.error("TTS error:", error);
      showToast("음성 재생 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/shelters/detail/${encodeURIComponent(table)}/${encodeURIComponent(shelterId)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiShelter = await res.json();
        if (mounted) setShelter(mapApiShelter(data, table as any));
      } catch (e) {
        Alert.alert("오류", "쉼터 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [table, shelterId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}> 쉼터 상세보기</Text>
      </View>
      <View style={styles.line}></View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 쉼터 이름 */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{shelter?.shelterName ?? "-"}</Text>
          {/* 즐겨찾기 */}
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={isFav ? "star" : "star-border"}
              size={22}
              color={isFav ? "#FACC15" : "#9AA5B1"}
            />
          </TouchableOpacity>

          {/* TTS 버튼 */}
          <TouchableOpacity
            onPress={onPressTTS}
            style={[styles.ttsBtn, { marginLeft: "auto" }]}
            accessibilityRole="button"
            accessibilityLabel="TTS 재생"
          >
            <MaterialIcons name="volume-up" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* 쉼터 종류 */}
        <Text style={styles.category}>{shelter?.facilityType ?? "-"}</Text>

        {/* 쉼터 사진 */}
        {(shelter?.photos?.length ?? 0) > 0 && (
          <View style={{ paddingHorizontal: H_PADDING }}>
            <FlatList
              data={shelter?.photos}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={ITEM_W + ITEM_GAP}
              snapToAlignment="start"
              contentContainerStyle={{ paddingRight: ITEM_GAP }}
              ItemSeparatorComponent={() => (
                <View style={{ width: ITEM_GAP }} />
              )}
              renderItem={({ item }) => (
                <View style={{ width: ITEM_W }}>
                  <Image
                    source={typeof item === "string" ? { uri: item } : item}
                    style={styles.photo}
                  />
                </View>
              )}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / (ITEM_W + ITEM_GAP)
                );
                setCurrent(idx);
              }}
            />
            <View style={styles.pagination}>
              {shelter?.photos!.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === current && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.line}></View>

        {/* 상세 정보 */}
        <View style={styles.infoBox}>
          {/* 주소 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={18} color="#475467" />
            <Text style={styles.infoLabel}>주소:</Text>
            <Text style={styles.infoValue}>{shelter?.roadAddress ?? "-"}</Text>
          </View>
          {/* 운영시간 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={18} color="#475467" />
            <Text style={styles.infoLabel}>운영시간:</Text>
            <Text style={styles.infoValue}>{shelter?.time ?? "-"}</Text>
          </View>
          {/* 수용 인원 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="groups-2" size={18} color="#475467" />
            <Text style={styles.infoLabel}>수용 인원:</Text>
            <Text style={styles.infoValue}>{shelter?.capacity ?? "-"}</Text>
          </View>
          {/* 기타 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="eco" size={18} color="#475467" />
            <Text style={styles.infoLabel}>기타:</Text>
            <Text style={styles.infoValue}>{shelter?.note || "-"}</Text>
          </View>
        </View>
      </ScrollView>
      {/* 하단 바 */}
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
  line: {
    height: 1,
    backgroundColor: "#E0E0E0",
    opacity: 0.6,
    marginVertical: 12,
  },
  name: { fontSize: 18, fontWeight: "600" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },

  category: {
    fontSize: 14,
    color: "#667085",
    marginLeft: 20,
    marginBottom: 12,
  },

  // 갤러리
  photo: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D0D5DD" },
  dotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111827",
  },

  // 운영시간/본문
  sectionTitle: {
    marginTop: 16,
    marginLeft: 20,
    fontWeight: "700",
    fontSize: 16,
  },
  todayHours: { marginLeft: 20, marginTop: 6, color: "#344054" },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6,
  },
  hoursDay: { color: "#667085" },
  hoursText: { color: "#101828" },
  body: { marginLeft: 20, marginTop: 6, color: "#101828" },
  infoBox: { marginTop: 8, paddingHorizontal: 20 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: { color: "#475467", marginLeft: 6, marginRight: 8, fontSize: 13 },
  infoValue: { flex: 1, color: "#101828" },
  infoAction: { paddingHorizontal: 6, paddingVertical: 4 },
  ttsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: 10,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
