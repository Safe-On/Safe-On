// cspell:words finedust safeon
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TabParamList } from "../navigation/BottomTabNavigator";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { mockNotices } from "../data/mockNotices";
import { mockWeather } from "../data/mockWeather";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

/* --------------------- 공통 fetch 헬퍼 --------------------- */
const API_BASE_URL = "https://a2a1f1492028.ngrok-free.app";
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  needAuth = false
) {
  const access = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(needAuth && access ? { Authorization: `Bearer ${access}` } : {}),
    },
  });
  if (res.status !== 401) return res;

  // 401 → refresh
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return res;

  const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!r.ok) return res;

  const { access_token: newAccess } = await r.json();
  if (newAccess) {
    await AsyncStorage.setItem(TOKEN_KEY, newAccess);
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        ...(needAuth ? { Authorization: `Bearer ${newAccess}` } : {}),
      },
    });
  }
  return res;
}

/* ------------------------------ 타입 ------------------------------ */
type ReviewItem = {
  id: number;
  shelter_id?: number;
  shelter_type?: "heat" | "climate" | "smart" | "finedust";
  rating: number;
  review_text: string;
  review_name: string | null;
  created_at: string;
  comfort?: "여유" | "보통" | "혼잡";
  accessibility_rating?: "상" | "중" | "하";
  heating_cooling_status?: "on" | "off";
  updated_at?: string;
  user_id?: number;
};

type Shelter = {
  id: number;
  name: string;
  shelter_type: "heat" | "climate" | "smart" | "finedust";
};

/* ------------------------------ 컴포넌트 ------------------------------ */
export default function Home() {
  const navigation = useNavigation<HomeNav>();

  // 검색/선택
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Shelter[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  // 리뷰 작성 상태
  const [rating, setRating] = useState<number>(0);
  const [congestion, setCongestion] = useState<string>();
  const [climateOption, setClimateOption] = useState<"on" | "off" | null>(null);
  const [accessLevel, setAccessLevel] = useState<string>();
  const [reviewName, setReviewName] = useState<string>("");
  const [reviewText, setReviewText] = useState<string>("");

  const [isScrolled, setIsScrolled] = useState(false);

  // 리뷰 목록 상태
  const [list, setList] = useState<ReviewItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;

  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
    });
    const subHide = Keyboard.addListener(hideEvt, () => setKbHeight(0));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);
  
  /* ------------------------------ 함수 ------------------------------ */
  // 이름으로 쉼터 검색
  const searchShelters = useCallback(async (q: string) => {
    setQuery(q);
    if (!q || q.trim().length < 1) {
      setResults([]);
      return;
    }
    const res = await fetchWithAuth(
      `/shelters/search?q=${encodeURIComponent(q)}&size=10`,
      { method: "GET" },
      false
    );
    if (!res.ok) return;
    const data: Shelter[] = await res.json();
    setResults(data);
  }, []);

  // 쉼터 선택
  const pickShelter = (s: Shelter) => {
    setSelectedShelter(s);
    setQuery(s.name);
    setResults([]);
    loadReviews(true);
  };

  // 리뷰 목록 불러오기
  const loadReviews = useCallback(
    async (reset = true) => {
      if (!selectedShelter) return;
      try {
        setLoadingList(true);
        const nextPage = reset ? 0 : page + 1;
        const res = await fetchWithAuth(
          `/shelters/${selectedShelter.shelter_type}/${selectedShelter.id}/reviews?page=${nextPage}&size=${size}`,
          { method: "GET" },
          false
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: ReviewItem[] = Array.isArray(json) ? json : json.items; // 래핑 응답 대비
        setList((prev) => (reset ? data : [...prev, ...data]));
        setPage(nextPage);
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingList(false);
      }
    },
    [page, size, selectedShelter]
  );

  useEffect(() => {
    loadReviews(true);
  }, [loadReviews]);

  // 리뷰 저장
  const handleSave = useCallback(async () => {
    if (!selectedShelter) {
      alert("먼저 쉼터를 선택하세요.");
      return;
    }
    if (!rating || !reviewText.trim()) {
      alert("별점과 상세 리뷰를 입력해주세요.");
      return;
    }
    const body = {
      rating,
      review_text: reviewText.trim(),
      review_name: reviewName.trim() || null,
      comfort: congestion as "여유" | "보통" | "혼잡" | undefined,
      accessibility_rating: accessLevel as "상" | "중" | "하" | undefined,
      heating_cooling_status: climateOption as "on" | "off" | undefined,
    };

    const res = await fetchWithAuth(
      `/shelters/${selectedShelter.shelter_type}/${selectedShelter.id}/reviews`,
      { method: "POST", body: JSON.stringify(body) },
      true
    );
    if (!res.ok) {
      const raw = await res.text();
      console.log("POST /reviews error raw:", res.status, raw);

      Alert.alert("리뷰 저장", "저장 실패");
      return;
    }

    await loadReviews(true);
    setReviewText("");
    setReviewName("");
    setRating(0);
    setCongestion(undefined);
    setAccessLevel(undefined);
    setClimateOption(null);
    alert("리뷰가 저장되었습니다.");
  }, [
    selectedShelter,
    rating,
    reviewText,
    reviewName,
    congestion,
    accessLevel,
    climateOption,
    loadReviews,
  ]);

  /* ------------------------------ UI ------------------------------ */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 30)}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 24 + kbHeight }}
        >
          {/* 1. 로고, 알림 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.alertIcon}
              onPress={() => alert("알림")}
            >
              <Ionicons
                name="notifications-outline"
                size={30}
                color="#34A853"
              />
            </TouchableOpacity>
            <Image
              source={require("../assets/safeon_logo.jpg")}
              style={styles.image}
            />
          </View>

          {/* 2. 배너 */}
          <View style={styles.banner}>
            <Text style={styles.title}>
              <MaterialIcons name="warning" size={16} color="#000" />
              {`${mockWeather.alert} · 기온 ${mockWeather.temperature}°C · 체감 ${mockWeather.feelTemperature}°C`}
            </Text>
          </View>

          {/* 3. 즐겨찾기, 공지 */}
          <View style={styles.favorites}>
            <TouchableOpacity
              style={styles.cardFav}
              onPress={() => navigation.navigate("Star")}
              activeOpacity={0.7}
            >
              <Text style={styles.title}>쉼터 즐겨찾기</Text>
              <FontAwesome name="star" size={70} color="#FFD700" />
            </TouchableOpacity>
            <View style={styles.cardNotice}>
              <Text style={styles.subTitle}>쉼터 공지</Text>
              {mockNotices.map((notice) => (
                <View key={notice.id} style={{ marginBottom: 8 }}>
                  <Text>
                    {"\u00B7"}
                    {notice.shelterName} - {notice.content}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4. 쉼터 리뷰 */}
          <View style={styles.reviewBox}>
            {/*
            검색 
            <TextInput
              placeholder="쉼터 검색"
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={query}
              onChangeText={searchShelters}
            />
            */}
            {/*쉼터검색 만들기 전*/}
            <TextInput
              placeholder="쉼터 검색"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => {
                // 그냥 강제로 선택
                setSelectedShelter({
                  id: 1,
                  name: query,
                  shelter_type: "climate",
                });
              }}
              style={styles.searchInput}
            />
            {/* 검색 결과 드롭다운 */}
            {results.length > 0 && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {results.map((s) => (
                  <TouchableOpacity
                    key={`${s.shelter_type}-${s.id}`}
                    onPress={() => pickShelter(s)}
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderColor: "#eee",
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {s.shelter_type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 선택된 쉼터 표시 */}
            <Text style={styles.subTitle}>선택한 쉼터:</Text>
            <Text style={styles.shelterName}>
              {selectedShelter ? selectedShelter.name : "쉼터를 선택하세요"}
            </Text>

            {/* 별점 */}
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                  <FontAwesome
                    name={i < rating ? "star" : "star-o"}
                    size={24}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* 방문시간/혼잡도 */}
            <View style={styles.twoBody}>
              <View style={styles.checkItem}>
                <Text style={styles.label}>방문 시간</Text>
                <TextInput style={styles.timeInput} placeholder="00:00" />
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.label}>혼잡도</Text>
                <View style={styles.chipsRow}>
                  {["여유", "보통", "혼잡"].map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      selected={congestion === item}
                      onPress={() => setCongestion(item)}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* 냉난방/접근성 */}
            <View style={styles.twoBody}>
              <View style={styles.checkItem}>
                <Text style={styles.label}>냉난방 여부</Text>
                <View style={styles.checkRow}>
                  <TouchableOpacity
                    onPress={() => setClimateOption("on")}
                    style={styles.checkItem}
                  >
                    <Ionicons
                      name={
                        climateOption === "on"
                          ? "checkbox-outline"
                          : "square-outline"
                      }
                      size={24}
                      color="#34A853"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setClimateOption("off")}
                    style={styles.checkItem}
                  >
                    <Ionicons
                      name={
                        climateOption === "off"
                          ? "close-outline"
                          : "square-outline"
                      }
                      size={24}
                      color="#EA4335"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.checkItem}>
                <Text style={styles.label}>장애인 접근 수준</Text>
                <View style={styles.chipsRow}>
                  {["상", "중", "하"].map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      selected={accessLevel === level}
                      onPress={() => setAccessLevel(level)}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* 작성자 이름 */}
            <Text style={styles.label}>작성자 이름(선택)</Text>
            <TextInput
              value={reviewName}
              onChangeText={setReviewName}
              placeholder="예: 홍길동"
              style={styles.timeInput}
            />

            {/* 상세 리뷰 */}
            <Text style={styles.label}>상세 리뷰</Text>
            <TextInput
              style={[
                styles.reviewInput,
                { minHeight: 120, textAlignVertical: "top" },
              ]}
              placeholder=""
              multiline
              value={reviewText}
              onChangeText={setReviewText}
              returnKeyType="done"
              blurOnSubmit
            />

            {/* 버튼 */}
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 20,
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setReviewText("");
                  setReviewName("");
                  setRating(0);
                  setCongestion(undefined);
                  setAccessLevel(undefined);
                  setClimateOption(null);
                }}
              >
                <Text style={styles.actionBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: selectedShelter ? "#34A853" : "#A0A0A0" },
                ]}
                onPress={handleSave}
                disabled={!selectedShelter}
              >
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                  저장
                </Text>
              </TouchableOpacity>
            </View>

            {/* 리뷰 목록 */}
            <View style={{ marginTop: 12 }}>
              {loadingList ? (
                <Text>불러오는 중...</Text>
              ) : list.length === 0 ? (
                <Text>작성된 리뷰가 없습니다.</Text>
              ) : (
                list.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: "#eee",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {item.review_name || "익명"} · ★ {item.rating}
                    </Text>
                    <Text style={{ marginTop: 4 }}>{item.review_text}</Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
          <View style={{ height: kbHeight }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Chip ---------- */
const Chip = ({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      {
        backgroundColor: selected ? "#34A85320" : "#eee",
        borderColor: selected ? "#34A853" : "#ccc",
      },
    ]}
    onPress={onPress}
  >
    <Text style={{ color: selected ? "#34A853" : "#333", fontSize: 12 }}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ---------- styles ---------- */
const cardBase = {
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 12,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 2,
  elevation: 2,
  minHeight: 100,
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    position: "relative",
    right: -10,
  },
  banner: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    right: -20,
    top: -40,
    flexWrap: "nowrap",
    maxWidth: "100%",
  },
  favorites: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: -40,
  },
  cardFav: { flex: 1, marginRight: 6, ...cardBase },
  cardNotice: { flex: 2, marginLeft: 6, ...cardBase },
  title: { fontWeight: "bold", marginBottom: 8, fontSize: 14 },
  bullet: { fontSize: 13, marginBottom: 4 },
  reviewBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 0,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  review: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  subTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 14 },
  shelterName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  label: { fontSize: 13, marginTop: 8, marginBottom: 4 },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 120,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 50,
    marginBottom: 12,
  },
  chipsRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    right: -10,
  },
  checkLabel: { marginBottom: 4, marginLeft: 4, fontSize: 14, color: "#333" },
  floatingBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#34A853",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  image: { width: 150, height: 150, marginTop: -15, right: 10, top: -10 },
  alertIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  bodyText: { marginBottom: 8, fontSize: 14 },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionBtnText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  twoBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
});
