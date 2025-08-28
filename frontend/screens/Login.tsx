import React from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  // cSpell:ignore Pressable
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "./auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

//import { login as apiLogin } from "../services/api"; // 백엔드 api (없으면 모킹 가능)
console.log("Hello");
export default function Login({ navigation }: { navigation: any }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const { signIn } = useAuth();

  const onSubmit = async (data: { email: string; password: string }) => {
    {/*
    // 백엔드 연동한 실제 사용 코드
    try {
      const { email, password } = data;
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해 주세요.");
      }

      // 컨텍스트가 fetch + 저장까지 처리
      await signIn(email, password);

      // 네 기존 플래그 유지하고 싶으면 그대로 둠(선택)
      await AsyncStorage.setItem("LoggedIn", "true");

      // 네가 쓰던 네비게이션 형태 유지
      navigation.navigate("BottomTabs", { screen: "Home" });
      // 또는 더 깔끔한 전환을 원하면:
      // navigation.reset({ index: 0, routes: [{ name: "BottomTabs", params: { screen: "Home" } }] });
    } catch (error: any) {
      Alert.alert(
        "로그인 실패",
        error?.message || "아이디나 비밀번호를 확인해 주세요."
      );
    }
*/}
    // 백엔드 없이 테스트용 코드
      
    try {
      // ✅ 여기부터는 테스트용 로직
      console.log("입력된 이메일:", data.email);
      console.log("입력된 비밀번호:", data.password);
      // 예시: 이메일과 비밀번호가 비어있지 않으면 로그인 성공으로 처리
      if (!data.email || !data.password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
      }
      // AsyncStorage에 로그인 상태 저장
      await AsyncStorage.setItem("LoggedIn", "true");
      navigation.replace("BottomTabs", { screen: "Home" });
    } catch (error: any) {
      Alert.alert(
        "로그인 실패",
        error.message || "아이디나 비밀번호를 확인해 주세요."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: "이메일을 입력하세요.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "유효한 이메일 형식이어야 합니다.",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="이메일(@dgu.ac.kr)"
              placeholderTextColor={"#34A853"}
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, errors.email && styles.errorInput]}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          rules={{
            required: "비밀번호를 입력하세요.",
            minLength: { value: 6, message: "최소 6자리 이상이어야 합니다." },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="비밀번호"
              placeholderTextColor={"#34A853"}
              value={value}
              onChangeText={onChange}
              secureTextEntry
              style={[styles.input, errors.password && styles.errorInput]}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.loginButton,
            isSubmitting && styles.loginButtonDisabled,
            pressed && !isSubmitting && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
        >
          {isSubmitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </Pressable>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>|</Text>
          <TouchableOpacity onPress={() => navigation.navigate("IdpwFind")}>
            <Text style={styles.linkText}>아이디/비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <Pressable
          onPress={async () => {
            await AsyncStorage.removeItem("ProfileSetupDone");
            await AsyncStorage.removeItem("age");
            await AsyncStorage.removeItem("disease");
            await AsyncStorage.removeItem("disability");
            Alert.alert("초기화 완료", "프로필 정보가 초기화되었습니다.");
          }}
          style={{ marginTop: 20, padding: 10, backgroundColor: "#f00" }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            프로필 초기화
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 60,
    textAlign: "center",
  },
  input: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 17,
    backgroundColor: "#effaf1",
    width: "100%",
    maxWidth: 400,
    height: 60,
  },
  loginButton: {
    backgroundColor: "#34A853",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
    // iOS 그림자 - 초록색으로 전체 방향에 그림자 주기
    shadowColor: "#57cf77", // 초록색 그림자
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  errorInput: { borderColor: "#e74c3c" },
  errorText: { color: "#e74c3c", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  linkText: {
    color: "#34A853",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 6,
  },
  separator: {
    color: "#34A853",
    marginHorizontal: 6,
    fontWeight: "400",
    fontSize: 14,
  },
  note: { marginTop: 12, fontSize: 12, color: "#666", textAlign: "center" },
});
