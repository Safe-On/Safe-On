// PlaceDetail.tsx 파일

import { useRoute } from "@react-navigation/native";
import { View, Text } from "react-native";
import { PlaceType } from "../screens/Map";

export default function PlaceDetail() {
  // useRoute 훅을 사용해 전달받은 파라미터를 가져옵니다.
  const route = useRoute();

  // TypeScript에게 route.params의 타입이 { place: PlaceType } 임을 알려줍니다.
  const { place } = route.params as { place: PlaceType };

  // 이제 place 객체에 접근하여 상세 정보를 표시할 수 있습니다.
  return (
    <View>
      <Text>{place.place_name}</Text>
      <Text>{place.address_name}</Text>
      <Text>
        위도: {place.y}, 경도: {place.x}
      </Text>
      {/* 추가적인 상세 정보를 여기에 표시하세요. */}
    </View>
  );
}
