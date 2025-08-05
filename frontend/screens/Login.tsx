import React from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import { login as apiLogin } from "../services/api"; // 백엔드 api (없으면 모킹 가능)

export default function Login({ navigation }: { navigation: any }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await fetch(
        "https://your-backend-domain.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        }
      );

      if (!response.ok) {
        // 200번대 응답이 아니면 에러로 처리
        const errorData = await response.json();
        throw new Error(errorData.message || "로그인 실패");
      }

      const res = await response.json();

      // 예: 서버에서 { token: "...", user: {...} } 형태로 반환한다고 가정
      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      navigation.replace("Main"); // 로그인 성공 후 메인 화면 이동
    } catch (error: any) {
      Alert.alert(
        "로그인 실패",
        error.message || "아이디나 비밀번호를 확인해 주세요."
      );
    }
  };

  return (
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
            placeholderTextColor={"#FF9728"}
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
            placeholderTextColor={"#FF9728"}
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
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate("IdpwFind")}>
          <Text style={styles.linkText}>아이디/비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>* 실제 백엔드 준비되면 API 연동</Text>
    </View>
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
    backgroundColor: "#fff6eb",
    width: "100%",
    maxWidth: 400,
    height: 60,
  },
  loginButton: {
    backgroundColor: "#FF9728",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
    // iOS 그림자 - 주황색으로 전체 방향에 그림자 주기
    shadowColor: "#FFCE93", // 주황색 그림자
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
    color: "#FF9728",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 6,
  },
  separator: {
    color: "#FF9728",
    marginHorizontal: 6,
    fontWeight: "400",
    fontSize: 14,
  },
  note: { marginTop: 12, fontSize: 12, color: "#666", textAlign: "center" },
});
