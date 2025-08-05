import React, { useState } from "react";
import { View, Text, Alert, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const Permission: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestImagePickerPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("사진 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("알림 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("위치 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const onPressAgree = async () => {
    setIsRequesting(true);

    if (
      !(await requestImagePickerPermission()) ||
      !(await requestNotificationPermission()) ||
      !(await requestLocationPermission())
    ) {
      setIsRequesting(false);
      return;
    }
    await AsyncStorage.setItem("PermissionAgreed", "true");
    setIsRequesting(false);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>권한 설정</Text>
        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>사진 권한</Text>
            <Text style={styles.permissionDesc}>
              사진 촬영 및 갤러리 접근을 위해 필요합니다.
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>위치 권한</Text>
            <Text style={styles.permissionDesc}>
              근처 쉼터 찾기 및 위치 기반 서비스를 위해 필요합니다.
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>알림 권한</Text>
            <Text style={styles.permissionDesc}>
              중요한 알람을 보내기 위해 필요합니다.
            </Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onPressAgree}>
          <Text style={styles.buttonText}>동의</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Permission;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  permissionList: {
    marginBottom: 24,
  },
  permissionItem: {
    marginBottom: 16,
    maxWidth: 400,
    height: 60,
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#fff6eb",
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
