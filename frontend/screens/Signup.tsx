import React from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm, Controller } from "react-hook-form";

export default function Signup({ navigation }: { navigation: any }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: {
    email: string;
    password: string;
    passwordConfirm: string;
  }) => {
    if (data.password !== data.passwordConfirm) {
      Alert.alert("비밀번호 오류", "비밀번호와 일치하지 않습니다.");
      return;
    }

    navigation.navigate("ProfileSetup", {
      email: data.email,
      password: data.password,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.Header}>
          <Text style={styles.title}>회원가입</Text>
        </View>
        <View style={styles.body}>
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
                placeholderTextColor="#34A853"
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
                placeholderTextColor="#34A853"
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
                placeholderTextColor="#34A853"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                style={[
                  styles.input,
                  errors.passwordConfirm && styles.errorInput,
                ]}
              />
            )}
          />
          {errors.passwordConfirm && (
            <Text style={styles.errorText}>
              {errors.passwordConfirm.message}
            </Text>
          )}
        </View>
        <View style={styles.footer}>
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
              <Text style={styles.registerButtonText}>다음</Text>
            )}
          </Pressable>
        </View>
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
  Header: {
    flex: 0.35,
    justifyContent: "center",
  },
  title: {
    marginTop: 170,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    flex: 0.45,
    justifyContent: "center",
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
    shadowColor: "#57cf77",
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
  startButton: {
    backgroundColor: "#34A853",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
  },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footer: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
  },
});
