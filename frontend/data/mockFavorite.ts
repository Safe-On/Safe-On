export type FavoritePlace = {
    id: string;
    name: string;
    address: string;
    phone?: string;
}

export const FAVORITES_MOCK: FavoritePlace[] = [
  {
    id: "shelter-001",
    name: "소공동주민센터",
    address: "서울특별시 중구 남대문로 123",
    phone: "02-123-4567",
  },
  {
    id: "shelter-002",
    name: "중구청사",
    address: "서울특별시 중구 필동로 45",
  },
  {
    id: "shelter-003",
    name: "을지로 경로당",
    address: "서울특별시 중구 을지로 12",
    phone: "02-987-6543",
  },
  {
    id: "shelter-004",
    name: "무교동 커뮤니티센터",
    address: "서울특별시 종로구 무교로 32",
  },
  {
    id: "shelter-005",
    name: "정동 시민회관",
    address: "서울특별시 중구 정동길 21",
    phone: "02-555-2222",
  },
];