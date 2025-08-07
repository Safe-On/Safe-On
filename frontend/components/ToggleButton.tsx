import React, { useRef, useState, useEffect } from "react";
import { Animated, StyleSheet, TouchableWithoutFeedback } from "react-native";

type Props = {
  value: boolean;
  onToggle: (newValue: boolean) => void;
};
export default function ToggleButton({ value, onToggle }: Props) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  // 버튼 배경 색 애니메이션
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ccc", "#34A853"],
  });

  const circlePosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 24],
  });

  return (
    <TouchableWithoutFeedback onPress={() => onToggle(!value)}>
      <Animated.View style={[styles.toggleContainer, { backgroundColor }]}>
        <Animated.View style={[styles.circle, { left: circlePosition }]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    width: 54,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    position: "absolute",
    top: 3,
  },
});
