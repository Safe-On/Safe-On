// src/screens/Star.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FAVORITES_MOCK, type FavoritePlace } from "../data/mockFavorite";

export default function Star() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<FavoritePlace[]>(FAVORITES_MOCK);

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

  const openDial = useCallback((phone: string) => {
    const digits = phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${digits}`);
  }, []);

  // 별 클릭 → 즐겨찾기 해제(리스트에서 제거)
  const unfavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((x) => x.id !== id));
    // TODO: 실제 앱이면 AsyncStorage/서버에 반영
  }, []);

  const renderItem = ({ item }: { item: FavoritePlace }) => (
    <View style={styles.card}>
      {/* 상단: 이름 + 채워진 별 */}
      <View style={styles.rowBetween}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.row}>
          {/* 즐겨찾기 해제: 노란색 채워진 별 */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => unfavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="star" size={22} color="#FACC15" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 주소 행 */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>주소</Text>
        <View style={styles.infoRight}>
          <Text style={styles.infoValue} numberOfLines={1}>
            {item?.address ?? "-"}
          </Text>
          {!!item?.address && (
            <TouchableOpacity
              style={styles.infoAction}
              onPress={() => openMap(item.address!)}
            >
              <MaterialIcons name="map" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 전화 행 */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>전화</Text>
        <View style={styles.infoRight}>
          <Text style={styles.infoValue} numberOfLines={1}>
            {item?.phone ?? "-"}
          </Text>
          {!!item?.phone && (
            <TouchableOpacity
              style={styles.infoAction}
              onPress={() => openDial(item.phone!)}
            >
              <MaterialIcons name="phone" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>즐겨찾기</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.line} />

      {/* 리스트 */}
      <FlatList
        data={favorites}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="star-border" size={28} />
            <Text style={styles.emptyTitle}>아직 즐겨찾기가 없어요</Text>
            <Text style={styles.emptySub}>
              쉼터 상세에서 별표를 눌러 추가하세요
            </Text>
          </View>
        }
        contentContainerStyle={
          favorites.length === 0
            ? { flex: 1, justifyContent: "center" }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backBtn: { paddingRight: 8, paddingVertical: 8 },
  title: { fontWeight: "bold", fontSize: 20 },

  line: {
    height: 1,
    backgroundColor: "#E0E0E0",
    opacity: 0.6,
    marginVertical: 12,
  },

  card: { paddingHorizontal: 16, paddingVertical: 12 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", flexShrink: 1, paddingRight: 8 },
  iconBtn: { padding: 4 },

  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  infoLabel: { width: 40, fontSize: 12, color: "#666" },
  infoRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoValue: { flex: 1, fontSize: 13, color: "#333", marginRight: 8 },
  infoAction: { paddingHorizontal: 4, paddingVertical: 2 },

  separator: { height: 1, backgroundColor: "#F0F0F0" },

  emptyWrap: { alignItems: "center", gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  emptySub: { fontSize: 13, color: "#666" },
});
