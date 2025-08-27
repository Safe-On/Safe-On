import React, { useEffect, useRef, useState } from "react";
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
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { getDistance } from "geolib";
import { Modalize } from "react-native-modalize";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { KAKAO_REST_API_KEY } from "@env";

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

  // places를 selectedCategory 기준으로 필터링
  const filteredPlaces =
    selectedCategory && selectedCategory !== "전체"
      ? places.filter((p) => p.category === selectedCategory)
      : places;
  // 초기 마운트 시 위치 권한 요청 및 백엔드 데이터 불러오기
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("위치 권한이 필요합니다.");
          fetchBackendPlaces(); // 권한 없으면 테스트 좌표로
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.005,
        });

        fetchBackendPlaces(loc.coords.latitude, loc.coords.longitude); // 실제 위치 기반
      } catch (err) {
        console.error("위치 가져오기 실패:", err);
        fetchBackendPlaces(); // 오류 시 테스트 좌표로
      }
    })();
  }, []);

  /*
  // 검색 키워드가 변경되면 카카오 API를 호출 (카테고리 기능과 분리)
  useEffect(() => {
    if (!region || !keyword.trim()) return;
    searchPlacesKakao(region.latitude, region.longitude, keyword);
  }, [keyword, region]);

  // 카카오 장소 검색
  const searchPlacesKakao = async (lat: number, lng: number, query: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://dapi.kakao.com/v2/local/search/keyword.json",
        {
          params: {
            query: query,
            x: lng.toString(),
            y: lat.toString(),
            radius: 3000,
            sort: "distance",
          },
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      const filtered = res.data.documents.filter((place: PlaceType) => {
        const dist = getDistance(
          { latitude: lat, longitude: lng },
          { latitude: parseFloat(place.y), longitude: parseFloat(place.x) }
        );
        return dist <= 3000;
      });

      setPlaces(filtered);
      setLoading(false);
      modalRef.current?.open();
    } catch (err) {
      console.error("카카오 검색 실패:", err);
      setLoading(false);
    }
  };
*/
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

  // 백엔드 데이터 가져오기
  // fetchBackendPlaces 함수 수정
  const fetchBackendPlaces = async (lat?: number, lng?: number) => {
    try {
      const useLat = lat ?? 37.5759;
      const useLng = lng ?? 126.9768;

      const kinds = ["heat", "climate", "smart", "finedust"];

      const res = await axios.get(
        "https://e80451de14f5.ngrok-free.app/shelters/nearby",
        {
          params: {
            kinds: kinds.join(","),
            lat: useLat,
            lng: useLng,
            radius: 3000,
            limit: 20,
          },
        }
      );

      console.log("백엔드 데이터:", res.data);

      const uniqueItems = uniqueByCoords(res.data.items);

      const backendPlaces: BackendPlaceType[] = uniqueItems;

      const converted: PlaceType[] = backendPlaces.map((p) => {
        // p.props가 유효한지 확인하고 파싱
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

        return {
          id: p.id,
          place_name: propsObj.shelter_name || p.name || "이름 없음",
          address_name: propsObj.road_address || "주소 없음",
          x: p.longitude.toString(),
          y: p.latitude.toString(),
          category: category,
          kind: p.kind,
        };
      });

      setPlaces(converted);
      modalRef.current?.open();
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
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: parseFloat(place.y),
                longitude: parseFloat(place.x),
              }}
              title={place.place_name}
              description={place.address_name}
              pinColor="green"
            />
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
        <Text>{places.length}개의 결과</Text>
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
          keyExtractor: (item) => item.id,
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
