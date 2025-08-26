import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SeniorCtx = {
  isSenior: boolean;
  setSenior: (v: boolean) => void;
  loading: boolean;
};

const SeniorModeContext = createContext<SeniorCtx>({
  isSenior: false,
  setSenior: () => {},
  loading: true,
});

export const useSeniorMode = () => useContext(SeniorModeContext);

export const SeniorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSenior, setIsSenior] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("seniorMode");
        if (saved != null) setIsSenior(saved === "1");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSenior = (v: boolean) => {
    setIsSenior(v);
    AsyncStorage.setItem("seniorMode", v ? "1" : "0").catch(() => {});
  };

  return (
    <SeniorModeContext.Provider value={{ isSenior, setSenior, loading }}>
      {children}
    </SeniorModeContext.Provider>
  );
};
