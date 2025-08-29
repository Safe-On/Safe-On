import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { getDistance } from "geolib";
import { Modalize } from "react-native-modalize";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { KAKAO_REST_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth/AuthContext";

const getRadiusForUser = (healthType?: number): number => {
  const TYPE_BASE: Record<number, number> = {
    1: 1500,
    2: 500,
    3: 2000,
    4: 1500,
    5: 2500,
    6: 1500,
    7: 2500,
    8: 1500,
    9: 3000,
  };
  let base = TYPE_BASE[healthType ?? 0] ?? 1500;

  return base;
};
const CATEGORY_OPTIONS = [
  "전체",
  "경로당",
  "행정복지센터",
  "은행",
  "스마트 쉼터",
  "편의점",
  "그늘막",
  "기타",
];

export type PlaceType = {
  id: string;
  place_name: string;
  address_name: string;
  x: string;
  y: string;
  category: string;
  kind: string;
};

export type BackendPlaceType = {
  distance_m: number;
  id: string;
  kind: string;
  latitude: number;
  longitude: number;
  name: string | null;
  props: {
    id: number;
    road_address: string;
    shelter_name: string;
    facility_type: string;
  };
};

export default function Map() {
  type RegionType = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  const modalRef = useRef<Modalize>(null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<RegionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [backendPlaces, setBackendPlaces] = useState<PlaceType[]>([]);
  const [ignoreRadius, setIgnoreRadius] = useState(false);

  const firstOpenRef = useRef(false);

  const currentRadius = useMemo(
    () => getRadiusForUser(Number(user?.health_type)),
    [user?.health_type]
  );
  const placeKey = (p: PlaceType) => `${p.kind}:${p.id}:${p.x}:${p.y}`;

  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 150);
    return () => clearTimeout(t);
  }, [keyword]);
  const normalize = (s?: string) =>
    (s ?? "")
      .toLowerCase()
      .normalize("NFC") // 한글 정규화
      .replace(/\s+/g, "") // 공백 제거
      .replace(/[·.,()\-_/]/g, ""); // 흔한 구분자 제거

  const matchesKeyword = (p: PlaceType, kw: string) => {
    if (!kw.trim()) return true;
    const tokens = kw.split(/\s+/).map(normalize).filter(Boolean);
    if (!tokens.length) return true;

    const hay = normalize(`${p.place_name} ${p.address_name}`);
    // 모든 토큰 AND 매칭
    return tokens.every((t) => hay.includes(t));
  };
  // 검색어가 생기면 반경 크게 요청 (예: 100km)
  // 검색어 없으면 원래대로 사용자 반경 요청
  useEffect(() => {
    if (!region) return;

    const wantAll = debouncedKeyword.trim().length > 0;
    fetchBackendPlaces(
      region.latitude,
      region.longitude,
      wantAll ? 100_000 : currentRadius
    );
  }, [debouncedKeyword, region, currentRadius]);

  // places를 selectedCategory 기준으로 필터링
  const filteredPlaces = useMemo(() => {
    const base = backendPlaces; // 항상 백엔드 원본만 기반으로

    const byCategory =
      selectedCategory && selectedCategory !== "전체"
        ? base.filter((p) => p.category === selectedCategory)
        : base;

    return byCategory.filter((p) => matchesKeyword(p, debouncedKeyword));
  }, [backendPlaces, selectedCategory, debouncedKeyword]);

  // 초기 마운트 시 위치 권한 요청 및 백엔드 데이터 불러오기
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("위치 권한이 필요합니다.");
          await fetchBackendPlaces(undefined, undefined, currentRadius); // 권한 없으면 테스트 좌표로
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.005,
        });

        await fetchBackendPlaces(
          loc.coords.latitude,
          loc.coords.longitude,
          currentRadius
        ); // 실제 위치 기반
      } catch (err) {
        console.error("위치 가져오기 실패:", err);
        await fetchBackendPlaces(undefined, undefined, currentRadius); // 오류 시 테스트 좌표로
      }
    })();
  }, [currentRadius]);

  // 중복 장소 제거
  const uniqueByCoords = (items: BackendPlaceType[]) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = `${item.latitude}-${item.longitude}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // 👇 유틸(파일 상단 아무데나)
  const countBy = <T extends string | number>(arr: any[], key: (v: any) => T) =>
    arr.reduce<Record<T, number>>((acc, it) => {
      const k = key(it);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {} as any);

  // 백엔드 데이터 가져오기 (반경 제한을 서버요청 단계에서 제어하고,
  // 클라이언트에서는 반경 필터를 하지 않음)
  const fetchBackendPlaces = async (
    lat?: number,
    lng?: number,
    radiusOverride?: number
  ) => {
    try {
      const useLat = lat ?? 37.5759;
      const useLng = lng ?? 126.9768;

      const kinds = ["heat", "climate", "smart", "finedust", "extra"];

      // 사용자 기본 반경
      const userRadius =
        radiusOverride ?? getRadiusForUser(Number(user?.health_type));

      // ⬇️ 반경 무시 모드거나 검색 중이면 서버 요청 radius를 크게 준다(예: 100km)
      //    그렇지 않으면 기존 사용자 반경 사용
      const requestRadius = radiusOverride ?? userRadius;

      const res = await axios.get(
        "https://3ea2c99591da.ngrok-free.app/shelters/nearby",
        {
          params: {
            kinds: kinds.join(","),
            lat: useLat,
            lng: useLng,
            radius: requestRadius,
            limit: 200, // 넉넉히 받아서 클라에서 카테고리/검색만 필터
          },
        }
      );

      console.log(
        "age:",
        user?.age,
        "health_type:",
        user?.health_type,
        "currentRadius(user):",
        userRadius,
        "requestRadius(sent):",
        requestRadius
      );

      const items: BackendPlaceType[] = Array.isArray(res.data?.items)
        ? res.data.items
        : [];

      console.log("[A] 원본 총개수:", items.length);
      console.log(
        "[A] kind별:",
        countBy(items, (it) => it.kind)
      );

      // 좌표 중복 제거
      const uniqueItems = uniqueByCoords(items);

      console.log("[B] dedup 후 총개수:", uniqueItems.length);
      console.log(
        "[B] kind별:",
        countBy(uniqueItems, (it) => it.kind)
      );

      // ⚠️ 여기서 더 이상 '반경 필터'는 하지 않음!
      // 클라이언트에서 filteredPlaces(useMemo)로 카테고리/검색/반경을 제어하려면
      // 풀 데이터(중복 제거만 한 상태)를 변환해서 상태에 저장한다.

      const convertedAll: PlaceType[] = uniqueItems.map((p) => {
        let propsObj: any = {};
        if (p.props && typeof p.props === "string") {
          try {
            propsObj = JSON.parse(p.props);
          } catch (err) {
            console.error("props 파싱 실패:", err);
          }
        } else if (p.props) {
          propsObj = p.props;
        }

        const name =
          (propsObj.shelter_name || "") + " " + (propsObj.facility_name || "");

        let category = "";
        if (name.includes("경로당")) category = "경로당";
        else if (name.includes("주민센터")) category = "행정복지센터";
        else if (name.includes("스마트쉼터") || name.includes("스마트 쉼터"))
          category = "스마트 쉼터";
        else if (name.includes("은행")) category = "은행";
        else if (name.includes("편의점")) category = "편의점";
        else if (name.includes("그늘막")) category = "그늘막";
        else category = "기타";

        return {
          id: p.id,
          place_name: propsObj.shelter_name || p.name || "이름 없음",
          address_name: propsObj.road_address || "주소 없음",
          x: p.longitude.toString(),
          y: p.latitude.toString(),
          category,
          kind: p.kind,
        };
      });

      console.log("[C] 변환 후 총개수:", convertedAll.length);
      console.log(
        "[C] kind별:",
        countBy(convertedAll, (it) => it.kind)
      );

      // ✅ 풀 데이터 저장: 이후 UI는 filteredPlaces(useMemo)로 카테고리/검색/반경 토글 적용
      setBackendPlaces(convertedAll);

      // (마커/카운트가 places를 참조한다면 초기 표시를 위해 동기화)
      setPlaces(convertedAll);

      if (!firstOpenRef.current) {
        modalRef.current?.open();
        firstOpenRef.current = true; // 다시는 자동 오픈 안 함
      }
    } catch (err) {
      console.error("백엔드 장소 가져오기 실패:", err);
    }
  };

  const calcDistance = (place: PlaceType) => {
    if (!region) return "";
    const dist = getDistance(
      { latitude: region.latitude, longitude: region.longitude },
      { latitude: parseFloat(place.y), longitude: parseFloat(place.x) }
    );
    return dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`;
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setKeyword("");
    setCategoryModalVisible(false);
  };

  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {region && (
        <MapView
          style={{ flex: 1 }}
          region={region}
          showsUserLocation
          onLongPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSelectedCoord({ lat: latitude, lng: longitude });
          }}
          onPress={() => {
            // 다른 곳을 탭하면 마커/버튼 제거
            if (selectedCoord) {
              setSelectedCoord(null);
            }
          }}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="내 위치"
            pinColor="blue"
          />
          {filteredPlaces.map((place) => (
            <Marker
              key={placeKey(place)}
              coordinate={{
                latitude: parseFloat(place.y),
                longitude: parseFloat(place.x),
              }}
              pinColor="green"
            >
              <Callout
                tooltip
                onPress={() =>
                  navigation.navigate("ShelterDetail", {
                    shelterId: place.id,
                    table: place.kind,
                  })
                }
              >
                <View
                  style={{
                    padding: 8,
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    width: 240,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }} numberOfLines={1}>
                    {place.place_name}
                  </Text>
                  <Text numberOfLines={1}>{place.address_name}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
          {selectedCoord && (
            <Marker
              coordinate={{
                latitude: selectedCoord.lat,
                longitude: selectedCoord.lng,
              }}
              title="선택된 위치"
              pinColor="red"
            />
          )}
        </MapView>
      )}

      {selectedCoord && (
        <View style={{ position: "absolute", top: 120, left: 140 }}>
          <Pressable
            style={{
              backgroundColor: "#fff",
              padding: 8,
              borderRadius: 7,
            }}
            onPress={async () => {
              await Haptics.selectionAsync();
              navigation.navigate("AddShelter", {
                lat: selectedCoord.lat,
                lng: selectedCoord.lng,
              });
            }}
          >
            <Text style={{ color: "#333" }}>쉼터 추가하기</Text>
          </Pressable>
        </View>
      )}

      {/* 검색바 */}
      <View style={{ position: "absolute", top: 60, left: 16, right: 16 }}>
        <TextInput
          placeholder="장소 검색"
          style={{
            height: 45,
            backgroundColor: "#fff",
            borderRadius: 7,
            paddingHorizontal: 16,
            fontSize: 15,
          }}
          placeholderTextColor="gray"
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>

      {/* 카테고리 */}
      <View
        style={{
          position: "absolute",
          top: 120,
          left: 16,
          right: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          style={{ backgroundColor: "#fff", padding: 8, borderRadius: 20 }}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text>{selectedCategory ?? "이용 시설"}</Text>
        </Pressable>
        <Text>{filteredPlaces.length}개의 결과</Text>
      </View>

      {/* 바텀시트 */}
      <Modalize
        ref={modalRef}
        snapPoint={100}
        modalHeight={400}
        handleStyle={{ backgroundColor: "#ccc", width: 50 }}
        withHandle={true}
        withOverlay={false}
        alwaysOpen={50}
        disableScrollIfPossible={false}
        panGestureEnabled={true}
        flatListProps={{
          data: filteredPlaces,
          showsVerticalScrollIndicator: false,
          nestedScrollEnabled: true,
          scrollEnabled: true,
          keyboardShouldPersistTaps: "handled",
          keyExtractor: (item) => placeKey(item),
          renderItem: ({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderColor: "#ccc",
              }}
            >
              <View>
                <Text style={{ fontWeight: "bold" }}>{item.place_name}</Text>
                <Text>{calcDistance(item)}</Text>
              </View>
              <Pressable
                style={{
                  backgroundColor: "#34A853",
                  padding: 8,
                  borderRadius: 8,
                }}
                onPress={() =>
                  navigation.navigate("ShelterDetail", {
                    shelterId: item.id,
                    table: item.kind,
                  })
                }
              >
                <Text style={{ color: "#fff" }}>상세보기</Text>
              </Pressable>
            </View>
          ),
          ListEmptyComponent: () => (
            <Text style={{ textAlign: "center", padding: 20 }}>
              검색 결과가 없습니다.
            </Text>
          ),
        }}
      />

      {/* 카테고리 모달 */}
      <Modal
        transparent
        visible={isCategoryModalVisible}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 15 }}
            >
              카테고리 선택
            </Text>
            {CATEGORY_OPTIONS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: "#ddd",
                  backgroundColor:
                    selectedCategory === cat ? "#f0f0f0" : "#fff",
                }}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text
                  style={{
                    color: selectedCategory === cat ? "#007BFF" : "#333",
                    fontWeight: selectedCategory === cat ? "bold" : "normal",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <Pressable
              onPress={() => setCategoryModalVisible(false)}
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: "#34A853",
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// styles 동일하게 유지
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  mapContainer: { flex: 1 },
  map: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  searchContainer: {
    paddingVertical: 8,
    position: "absolute",
    top: 58,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 45,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 7,
    fontSize: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 3,
    elevation: 3,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 115,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  buttonStyle: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 3,
    elevation: 3,
  },
  buttonTextStyle: { fontSize: 13, color: "#333", textAlign: "center" },
  resultCount: { fontSize: 13, alignSelf: "center" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listItemTextContainer: { flex: 1, marginRight: 16 },
  placeName: { fontSize: 16, fontWeight: "bold" },
  placeDistance: { fontSize: 14, color: "#666" },
  placeAddress: { fontSize: 13, color: "#999" },
  detailButton: { backgroundColor: "#34A853", padding: 8, borderRadius: 8 },
  detailButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedItem: { backgroundColor: "#f0f0f0" },
  categoryText: { fontSize: 16, color: "#333" },
  selectedText: { color: "#007BFF", fontWeight: "bold" },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#34A853",
    borderRadius: 5,
  },
  closeText: { color: "#fff", fontWeight: "bold" },
});
