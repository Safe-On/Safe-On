import React,{useState} from "react";
import { View, SafeAreaView, TouchableOpacity, StyleSheet, Text, ScrollView, Image, FlatList, Dimensions, Linking, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Home from "./Home";
import {SHELTERS} from "../data/mockDetail";
import * as Speech from "expo-speech";

const SCREEN_W = Dimensions.get("window").width;
const H_PADDING = 20;
const ITEM_GAP = 12;
const ITEM_W = SCREEN_W - H_PADDING * 2;

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABEL: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
  hol: "공휴일",
};

const openDial = (phone?: string) => {
  if (!phone) return;
  const digits = phone.replace(/[^0-9+]/g, "");
  Linking.openURL(`tel:${digits}`);
};

const openMap = (addr?: string) => {
  if (!addr) return;
  const q = encodeURIComponent(addr);
  const url = Platform.select({
    ios: `http://maps.apple.com/?q=${q}`,
    android: `geo:0,0?q=${q}`,
    default: `https://maps.google.com/?q=${q}`,
  }) as string;
  Linking.openURL(url);
};


function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOpenNow(schedule: any, date = new Date()): boolean {
  const dayIdx = date.getDay(); // 0=Sun
  const key = dayIdx === 0 ? "sun" : DAY_ORDER[dayIdx - 1];
  const d = schedule?.[key];
  if (!d || d.closed || !d.open) return false;

  const now = date.getHours() * 60 + date.getMinutes();
  const start = toMin(d.open.start);
  const end = toMin(d.open.end);
  let open = now >= start && now < end;

  if (open && d.breaks?.length) {
    for (const b of d.breaks) {
      if (now >= toMin(b.start) && now < toMin(b.end)) {
        open = false;
        break;
      }
    }
  }
  return open;
}

function formatDailyHours(d: any) {
  if (!d || d.closed || !d.open) return "휴무";
  const base = `${d.open.start}–${d.open.end}`;
  const brk = d.breaks?.length
    ? ` (점심 ${d.breaks.map((b: any) => `${b.start}–${b.end}`).join(", ")})`
    : "";
  return base + brk;
}

function formatTodayHours(schedule: any, date = new Date()) {
  const dayIdx = date.getDay(); // 0=Sun
  const key = dayIdx === 0 ? "sun" : DAY_ORDER[dayIdx - 1];
  return formatDailyHours(schedule?.[key]);
}

function weeklyHours(schedule: any) {
  return DAY_ORDER.map((k) => ({
    day: `${DAY_LABEL[k]}요일`,
    text: formatDailyHours(schedule?.[k]),
  }));
}

export default function ShelterDetail() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const shelterId = route.params?.shelterId ?? "TEST_001";
  const shelter = SHELTERS[shelterId];

  const [current, setCurrent] = useState(0);

  const [isFav, setIsFav] = useState<boolean>(false);

const showToast = (msg: string) => {
  if (Platform.OS === "android") {
    const { ToastAndroid } = require("react-native"); // ← Android일 때만 로드
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else if (Platform.OS === "ios") {
    Alert.alert("", msg);
  } else {
    // web 등
    // @ts-ignore
    if (typeof window !== "undefined" && window.alert) window.alert(msg);
    else console.log(msg);
  }
};

  const onToggleFavorite = () => {
    setIsFav((prev) => {
      const next = !prev;
      // 추가될 때만 메시지 띄우고 싶으면 if (next) 만 남겨도 됨
      showToast(
        next ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다."
      );
      return next;
    });
  };

  const onPressTTS = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      Speech.stop(); // 다시 누르면 정지
      return;
    }
    const text =
      [
        shelter?.name,
        shelter?.category,
        shelter?.address && `주소 ${shelter.address}`,
        shelter?.phone && `전화 ${shelter.phone}`,
        shelter?.schedule &&
          `오늘 운영시간 ${formatTodayHours(shelter.schedule)}`,
        shelter?.eligibility?.groups?.length &&
          `이용 대상 ${shelter.eligibility.groups.join(", ")}`,
        shelter?.usage?.howTo && `이용 방법 ${shelter.usage.howTo}`,
        shelter?.usage?.procedure?.length &&
          `이용 절차 ${shelter.usage.procedure.join(", 다음, ")}`,
        shelter?.notes && `기타 ${shelter.notes}`,
      ]
        .filter(Boolean)
        .join(". ") + ".";

    if (text) {
      Speech.speak(text, { language: "ko-KR", rate: 0.8, pitch: 0.8 });
    }
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
        <Text style={styles.title}> 쉼터 상세보기</Text>
      </View>
      <View style={styles.line}></View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 쉼터 이름 */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{shelter?.name ?? "-"}</Text>
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
        <Text style={styles.category}>{shelter?.category ?? "-"}</Text>

        {/* 쉼터 사진 */}
        <View style={{ paddingHorizontal: H_PADDING }}>
          <FlatList
            data={shelter?.photos ?? []}
            keyExtractor={(_, i) => String(i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={ITEM_W + ITEM_GAP}
            snapToAlignment="start"
            contentContainerStyle={{ columnGap: ITEM_GAP }}
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
            {(shelter?.photos ?? []).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === current && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.line}></View>

        {/* 주소/전화 */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={18} color="#475467" />
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{shelter?.address ?? "-"}</Text>
            {!!shelter?.address && (
              <TouchableOpacity
                style={styles.infoAction}
                onPress={() => openMap(shelter.address!)}
              >
                <MaterialIcons name="map" size={18} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="call" size={18} color="#475467" />
            <Text style={styles.infoLabel}>전화</Text>
            <Text style={styles.infoValue}>{shelter?.phone ?? "-"}</Text>
            {!!shelter?.phone && (
              <TouchableOpacity
                style={styles.infoAction}
                onPress={() => openDial(shelter.phone!)}
              >
                <MaterialIcons name="phone" size={18} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>

          {/* 운영시간 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={18} color="#475467" />
            <Text style={styles.infoLabel}>운영시간:</Text>
            <Text style={styles.infoValue}>
              {formatTodayHours(shelter.schedule)}
            </Text>
          </View>

          {/* 이용 대상 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="groups" size={18} color="#475467" />
            <Text style={styles.infoLabel}>이용 대상:</Text>
            <Text style={styles.infoValue}>
              {(shelter.eligibility?.groups || []).join(", ") || "-"}
            </Text>
          </View>

          {/* 이용 방법 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="check-circle" size={18} color="#475467" />
            <Text style={styles.infoLabel}>이용 방법:</Text>
            <Text style={styles.infoValue}>{shelter.usage?.howTo || "-"}</Text>
          </View>

          {/* 이용 절차 */}
          <View style={styles.infoRow}>
            <MaterialIcons
              name="assignment-turned-in"
              size={18}
              color="#475467"
            />
            <Text style={styles.infoLabel}>이용 절차:</Text>
            <Text style={styles.infoValue}>
              {(shelter.usage?.procedure || []).join(" → ") || "-"}
            </Text>
          </View>

          {/* 기타 */}
          <View style={styles.infoRow}>
            <MaterialIcons name="eco" size={18} color="#475467" />
            <Text style={styles.infoLabel}>기타:</Text>
            <Text style={styles.infoValue}>{shelter.notes || "-"}</Text>
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
  infoValue: { flex: 1, color: "#101828" }, // 길면 자동 줄바꿈
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
    backgroundColor: "#fff", // 꽉 찬 검정 원이 좋으면 "#111827"로 바꾸고 아이콘 색을 "#fff"로
  },
});