import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";

const Permission: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const [cam, noti, loc] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        Notifications.getPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);

      if (
        cam.status === "granted" &&
        noti.status === "granted" &&
        loc.status === "granted"
      ) {
        await AsyncStorage.setItem("PermissionAgreed", "true");
        navigation.replace("Login");
      } else {
        const agreed = await AsyncStorage.getItem("PermissionAgreed");
        if (agreed === "true") {
          navigation.replace("Login");
        }
      }
    };

    checkPermissions();
  }, []);

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
      console.log("권한 요청 실패");
      setIsRequesting(false);
      return;
    }
    await AsyncStorage.setItem("PermissionAgreed", "true");
    const check = await AsyncStorage.getItem("PermissionAgreed");
    console.log("저장 확인:", check);
    setIsRequesting(false);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>권한 설정</Text>
        </View>
        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <Ionicons name="camera-outline" size={24} color="black" />
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>사진 권한</Text>
              <Text style={styles.permissionDesc}>
                사진 촬영 및 갤러리 접근을 위해 필요합니다.
              </Text>
            </View>
          </View>
          <View style={styles.permissionItem}>
            <View style={styles.icon}>
              <Ionicons name="location-outline" size={24} color="black" />
            </View>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>위치 권한</Text>
              <Text style={styles.permissionDesc}>
                근처 쉼터 찾기 및 위치 기반 서비스를 위해 필요합니다.
              </Text>
            </View>
          </View>
          <View style={styles.permissionItem}>
            <View style={styles.icon}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </View>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>알림 권한</Text>
              <Text style={styles.permissionDesc}>
                중요한 알람을 보내기 위해 필요합니다.
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.footerbutton}>
          <Pressable style={styles.button} onPress={onPressAgree}>
            <Text style={styles.buttonText}>동의합니다.</Text>
          </Pressable>
        </View>
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
  },
  header: {
    flex: 0.2,
    alignItems: "center",
  },
  title: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: "600",
  },
  permissionList: {
    flex: 0.6,
    marginTop: 15,
  },
  permissionItem: {
    marginBottom: 16,
    width: "100%",
    maxWidth: 400,
    height: 75,
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#effaf1",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    marginTop: 5,
    marginLeft: 15,
    justifyContent: "center",
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    justifyContent: "center",
  },
  permissionDesc: {
    fontSize: 12,
    color: "#666",
  },
  footerbutton: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#34A853",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    height: 60,
    marginBottom: -55,
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
