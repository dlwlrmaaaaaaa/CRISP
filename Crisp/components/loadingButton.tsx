import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean; // Accept loading state
  style?: string;
  textStyle?: ViewStyle;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (!loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      className={style}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator className="text-xl py-2 font-bold text-white" />
      ) : (
        <Text className="text-xl py-1 font-bold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default LoadingButton;
