// shelter.ts
import type { ImageSourcePropType } from "react-native";

export interface ApiShelter {
  id: string;
  shelter_name?: string | null;
  facility_type_2?: string | null;
  road_address?: string | null;
  time?: string | null;
  capacity?: string | null;
  note?: string | null;
  photos?: string[] | null;
}
export interface Shelter {
  id: string;
  shelterName?: string;
  facilityType?: string;
  roadAddress?: string;
  time?: string;
  capacity?: string;
  note?: string;
  photos?: ImageSourcePropType[];
}
