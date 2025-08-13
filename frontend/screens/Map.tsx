import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { KAKAO_REST_API_KEY } from "@env";
import { getDistance } from "geolib";
import { Modalize } from "react-native-modalize";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const CATEGORY_OPTIONS = [
  "경로당",
  "행정복지센터",
  "은행",
  "스마트 쉼터",
  "편의점",
  "그늘막",
];

export type PlaceType = {
  id: string;
  place_name: string;
  address_name: string;
  x: string;
  y: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<RegionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceType[]>([]);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 위치 권한 확인 및 현재 위치 얻기
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("위치 권한이 필요합니다.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync();
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  // 키워드와 위치 변경 시 장소 검색
  useEffect(() => {
    if (!region || !keyword) return;
    searchPlaces(region.latitude, region.longitude, keyword);
  }, [keyword, region]);

  const searchPlaces = async (lat: number, lng: number, query: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://dapi.kakao.com/v2/local/search/keyword.json",
        {
          params: {
            query,
            x: lng,
            y: lat,
            radius: 300,
            sort: "distance",
          },
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      // 300m 이내 필터링
      const filtered = res.data.documents.filter((place: PlaceType) => {
        const dist = getDistance(
          { latitude: lat, longitude: lng },
          { latitude: parseFloat(place.y), longitude: parseFloat(place.x) }
        );
        return dist <= 300;
      });
      setPlaces(filtered);
      setLoading(false);
      modalRef.current?.open(); // 검색 후 바텀시트 오픈
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("장소 검색 중 오류가 발생했습니다.");
    }
  };

  // 거리 계산 (m 단위)
  const calcDistance = (place: PlaceType) => {
    if (!region) return "";
    const dist = getDistance(
      { latitude: region.latitude, longitude: region.longitude },
      { latitude: parseFloat(place.y), longitude: parseFloat(place.x) }
    );
    if (dist < 1000) return dist + "m";
    else return (dist / 1000).toFixed(1) + "km";
  };

  // 카테고리 선택 시
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setKeyword(category); // 검색 키워드도 변경
    setCategoryModalVisible(false); // 카테고리 모달 닫기
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {region && (
        <MapView style={styles.map} region={region} showsUserLocation={true}>
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
        </MapView>
      )}
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="장소 검색"
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>

      {/* 카테고리 선택 및 결과 개수 */}
      <View style={styles.categoryContainer}>
        <Pressable
          onPress={() => setCategoryModalVisible(true)}
          style={styles.buttonStyle}
        >
          <Text style={styles.buttonTextStyle}>
            {selectedCategory ?? "이용 시설"}
          </Text>
        </Pressable>
        <Text style={styles.resultCount}>{places.length}개의 결과</Text>
      </View>

      {/* 카테고리 중앙 모달 */}
      <Modal
        transparent
        animationType="fade"
        visible={isCategoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            {/* 각 카테고리마다 버튼 만듦 */}
            {CATEGORY_OPTIONS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryItem,
                  selectedCategory === cat && styles.selectedItem,
                ]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.selectedText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={styles.closeButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.mapContainer}>
        {/* 바텀시트 - 장소 리스트 */}
        <Modalize
          ref={modalRef}
          snapPoint={250}
          modalHeight={400}
          handleStyle={{ backgroundColor: "#ccc", width: 50 }}
          withOverlay={false}
          flatListProps={{
            data: places,
            keyExtractor: (item) => item.id,
            renderItem: ({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemTextContainer}>
                  <Text style={styles.placeName}>{item.place_name}</Text>
                  <Text style={styles.placeDistance}>{calcDistance(item)}</Text>
                </View>
                <Pressable
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate("ShelterDetail", {
                      shelterId: item.id,
                    })
                  }
                >
                  <Text style={styles.detailButtonText}>상세보기</Text>
                </Pressable>
              </View>
            ),
            ListEmptyComponent: () => (
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            ),
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
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
    marginTop: -6,
    marginBottom: 2,
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
    marginTop: 5,
  },
  buttonTextStyle: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  resultCount: { fontSize: 13, alignSelf: "center" },
  mapContainer: { flex: 1 },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: { padding: 16, backgroundColor: "#fff" },
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
  detailButton: {
    backgroundColor: "#34A853",
    padding: 8,
    borderRadius: 8,
  },
  detailButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },

  // 중앙 모달 스타일
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedItem: {
    backgroundColor: "#f0f0f0",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#34A853",
    borderRadius: 5,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
