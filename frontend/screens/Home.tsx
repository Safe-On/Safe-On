import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { mockNotices } from "../data/mockNotices";
import { mockWeather } from "../data/mockWeather";
import AddShelter from "./AddShelter";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;


export default function Home() {
  const [rating, setRating] = useState<number>();
  const [congestion, setCongestion] = useState<string>();
  const [climateOption, setClimateOption] = useState<"on" | "off" | null>(null);
  const [accessLevel, setAccessLevel] = useState<string>();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setIsScrolled(y > 30); // 30px 이상 스크롤되면 true
        }}
        scrollEventThrottle={16}
      >
        {/* 1. 로고, 알림 버튼 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.alertIcon}
            onPress={() => alert("알림")}
          >
            <Ionicons name="notifications-outline" size={30} color="#34A853" />
          </TouchableOpacity>
          <Image
            source={require("../assets/safeon_logo.jpg")}
            style={styles.image}
          />
        </View>

        {/* 2. 폭염주의보와 같은 배너 */}
        <View style={styles.banner}>
          <Text style={styles.title}>
            <MaterialIcons name="warning" size={16} color="#000" />
            {`${mockWeather.alert} · 기온 ${mockWeather.temperature}°C · 체감 온도 ${mockWeather.feelTemperature}°C`}
          </Text>
        </View>

        {/* 3. 즐겨찾기, 쉼터 공지 */}
        <View style={styles.favorites}>
          {/* 즐겨찾기 */}
          <View style={styles.cardFav}>
            <Text style={styles.title}>쉼터 즐겨찾기</Text>
            <FontAwesome name="star" size={70} color="#FFD700" />
          </View>
          {/* 쉼터 공지 */}
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
          {/* 검색창 */}
          <TextInput
            placeholder="쉼터 검색"
            style={styles.searchInput}
            placeholderTextColor="#999"
          />

          <Text style={styles.subTitle}>최근 이용한 쉼터:</Text>

          {/* 쉼터 이름 + 별점 */}
          <Text style={styles.shelterName}>보라매경로당</Text>
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

          <View style={styles.twoBody}>
            <View style={styles.checkItem}>
              {/* 방문 시간 */}
              <Text style={styles.label}>방문 시간</Text>
              <TextInput style={styles.timeInput} placeholder="00:00" />
            </View>
            {/* 혼잡도 */}
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

          <View style={styles.twoBody}>
            {/* 냉난방 여부 */}
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

            {/* 장애인 접근 수준 */}
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

          {/* 상세 리뷰 */}
          <Text style={styles.label}>상세 리뷰</Text>
          <TextInput style={styles.reviewInput} placeholder="" />

          {/* 저장, 취소 */}
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
                // 취소 동작
                console.log("취소됨");
              }}
            >
              <Text style={styles.actionBtnText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#34A853" }]}
              onPress={() => {
                // 저장 동작
                console.log("저장됨");
              }}
            >
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                저장
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 5. 플로팅 “쉼터 추가” 버튼 */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => navigation.navigate("AddShelter")}
      >
        <Ionicons name="add" size={36} color="#fff" />
        {!isScrolled && <Text style={styles.title}>쉼터추가</Text>}
      </TouchableOpacity>

      {/* 6. 하단 탭바 */}
      <Text>하단 탭(나중에 따로 파일 만들어서 넣을 예정)</Text>
    </SafeAreaView>
  );
}

/* ---------- Chip(선택 버튼) ---------- */
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
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
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
  cardFav: {
    flex: 1,
    marginRight: 6,
    ...cardBase,
  },
  cardNotice: {
    flex: 2,
    marginLeft: 6,
    ...cardBase,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 14,
  },
  bullet: {
    fontSize: 13,
    marginBottom: 4,
  },
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
  subTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 14,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 50,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
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
  checkLabel: {
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 14,
    color: "#333",
  },

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
  image: {
    width: 150,
    height: 150,
    marginTop: -15,
    right: 10,
    top: -10,
  },
  alertIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  bodyText: {
    marginBottom: 8,
    fontSize: 14,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  twoBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
});
