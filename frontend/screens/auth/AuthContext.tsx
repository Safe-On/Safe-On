// screens/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://678281b933c5.ngrok-free.app"; // ← 서버 주소

type User = {
  id: number;
  email: string;
  health_type?: number;
  [k: string]: any;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  // (A) 컨텍스트가 직접 로그인 호출(fetch)
  signIn: (email: string, password: string) => Promise<void>;
  // (B) 화면이 이미 로그인 응답을 받았을 때 상태만 반영
  acceptLogin: (payload: {
    token?: string | null;
    user: User;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  acceptLogin: async () => {},
  signOut: async () => {},
});

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  // 앱 시작 시 저장된 로그인 정보 복구
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // (A) 컨텍스트에서 직접 로그인(fetch) 처리
  // screens/auth/AuthContext.tsx (나머지는 그대로 두고, signIn 함수만 이걸로 교체)
  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || `HTTP ${res.status}`);
    }

    // ① 토큰/유저 추출: 어떤 형태로 와도 흡수
    const tk = json.token ?? json.access_token ?? null;

    // 보편적으로 { user: {...} } 또는 통째로 {...}
    let usr: User = json.user ?? json.profile ?? json;

    // 응답 구조에 따라 token이 user에 섞여있으면 제거
    if (usr && (usr as any).token) {
      const { token, ...rest } = usr as any;
      usr = rest as User;
    }

    // ② health_type이 없으면 me 호출로 보강 (가능할 때만)
    if (!usr.health_type && tk) {
      try {
        const me = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${tk}` },
        });
        if (me.ok) {
          const meJson = await me.json();
          usr = { ...usr, ...meJson };
        }
      } catch (e) {
        console.log("me 호출 실패(무시):", e);
      }
    }

    // ③ 숫자 보정 (문자열로 오면 숫자로)
    if (usr && (usr as any).health_type != null) {
      (usr as any).health_type = Number((usr as any).health_type);
    }

    await acceptLogin({ token: tk, user: usr });
  };

  // (B) 이미 받은 로그인 응답을 상태/저장에 반영
  const acceptLogin = async ({
    token: tk = null,
    user: usr,
  }: {
    token?: string | null;
    user: User;
  }) => {
    setUser(usr);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));

    if (tk) {
      setToken(String(tk));
      await SecureStore.setItemAsync(TOKEN_KEY, String(tk));
    } else {
      setToken(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, acceptLogin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
