// mapShelter.ts
import type { ApiShelter, Shelter } from "../types/shelter";
import type { ImageURISource } from "react-native";

type Table = "heat" | "smart" | "finedust" | "climate" | "extra";

const tableToType: Record<Table, string> = {
  heat: "무더위 쉼터",
  smart: "스마트 쉼터",
  finedust: "미세먼지 쉼터",
  climate: "기후쉼터",
  extra: "기타 쉼터",
};

export function mapApiShelter(s: ApiShelter, table?: Table): Shelter {
  const name =
    // heat / finedust / climate 에 있을 수 있음
    (s as any).shelter_name ??
    // smart / climate 에 있을 수 있음
    (s as any).facility_name ??
    undefined;

  const address =
    (s as any).road_address ?? (s as any).detailed_address ?? undefined;

  const facilityType =
    // heat 전용
    (s as any).facility_type_2 ??
    // (있다면) 일반 키
    (s as any).facility_type ??
    // 없으면 테이블명으로 추정
    (table ? tableToType[table] : undefined);

  // 사진: string[] | ImageURISource[] 모두 대응
  const rawPhotos = (s as any).photos;
  const photos: ImageURISource[] = Array.isArray(rawPhotos)
    ? rawPhotos.map((u: string | ImageURISource) =>
        typeof u === "string" ? { uri: u } : u
      )
    : [];

  return {
    id: s.id,
    shelterName: name,
    facilityType,
    roadAddress: address,
    time: (s as any).time ?? undefined,
    capacity: (s as any).capacity ?? undefined,
    note: (s as any).note ?? undefined,
    photos,
    // 만약 Shelter 타입에 좌표 필드가 있으면 아래 두 줄도 추가
    // latitude: (s as any).latitude ?? (s as any).lat,
    // longitude: (s as any).longitude ?? (s as any).long,
  };
}
