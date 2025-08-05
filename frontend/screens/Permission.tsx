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
    <View style={styles.container}>
      <Text style={styles.text}>권한 설정</Text>
      <Pressable style={styles.button} onPress={onPressAgree}>
        <Text style={styles.buttonText}>동의</Text>
      </Pressable>
      {isRequesting && <ActivityIndicator />}
    </View>
  );
};

export default Permission;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
