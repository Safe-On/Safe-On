import React from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signup({ navigation }: { navigation: any }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => {
    if (data.password !== data.passwordConfirm) {
      Alert.alert(
        "비밀번호 오류",
        "비밀번호와 비밀번호 확인이 일치하지 않습니다."
      );
      return;
    }

    try {
      const response = await fetch("http://10.91.21.156:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입 실패");
      }

      Alert.alert(
        "회원가입 성공",
        "회원가입이 완료되었습니다. 로그인 화면으로 이동합니다."
      );
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert(
        "회원가입 실패",
        error.message || "입력 정보를 확인해주세요."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <Controller
        control={control}
        name="username"
        rules={{
          required: "아이디를 입력하세요.",
          minLength: { value: 4, message: "최소 4자리 이상입니다." },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="아이디"
            placeholderTextColor="#2e9d4c"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            style={[styles.input, errors.username && styles.errorInput]}
          />
        )}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username.message}</Text>
      )}

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
            placeholder="이메일"
            placeholderTextColor="#2e9d4c"
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
            placeholderTextColor="#2e9d4c"
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

      <Controller
        control={control}
        name="passwordConfirm"
        rules={{
          required: "비밀번호 확인을 입력하세요.",
          minLength: { value: 6, message: "최소 6자리 이상이어야 합니다." },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="비밀번호 확인"
            placeholderTextColor="#2e9d4c"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={[styles.input, errors.passwordConfirm && styles.errorInput]}
          />
        )}
      />
      {errors.passwordConfirm && (
        <Text style={styles.errorText}>{errors.passwordConfirm.message}</Text>
      )}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={({ pressed }) => [
          styles.registerButton,
          isSubmitting && styles.registerButtonDisabled,
          pressed && !isSubmitting && { opacity: 0.8 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting }}
      >
        {isSubmitting ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.registerButtonText}>회원가입</Text>
        )}
      </Pressable>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>로그인</Text>
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
    marginBottom: 40,
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
  registerButton: {
    backgroundColor: "#34A853",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
    shadowColor: "#86d99c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  errorInput: { borderColor: "#e74c3c" },
  errorText: { color: "#e74c3c", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  linkText: {
    color: "#34A853",
    fontSize: 14,
    fontWeight: "500",
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
