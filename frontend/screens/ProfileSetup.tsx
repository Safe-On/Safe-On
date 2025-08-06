/*
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
import { Ionicons } from "@expo/vector-icons";

const ProfileSetup: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState("O"|"X");

  
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>맞춤 쉼터 추천을 위해\n기본 정보를 알려주세요!</Text>
        </View>
        <View style={styles.profileSetupList}>
          <View style={styles.profileSetupItemAge}>
            <Text style={styles.profileSetupItemAgeText}>나이</Text>
            <TextInput style={styles.profileSetupItemAgeInput} />
          </View>
          <View style={styles.profileSetupItemOX}>
            <Text style={styles.profileSetupItemOXText}>질환</Text>
            <View style={styles.oxContainer}>
              {["O", "X"].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setSelectedDisease(item as "O" | "X")}
                  style={[
                    styles.oxButton,
                    selectedDisease === item ? styles.oxButtonSelected : styles.oxButtonUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.oxButtonText,
                      selectedDisease === item ? styles.oxButtonTextSelected : styles.oxButtonTextUnselected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.profileSetupItemOX}>
            <View style={styles.icon}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </View>
          </View>
        </View>
        <View style={styles.footerbutton}>
          <Pressable style={styles.button} onPress={onPressAgree}>
            <Text style={styles.buttonText}>시작하기기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileSetup;

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
    fontWeight: "bold",
    textAlign: "center",
  },
  profileSetupList: {
    flex: 0.6,
    marginTop: 15,
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
*/
