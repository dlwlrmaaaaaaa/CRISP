import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";

const { width, height } = Dimensions.get("window");

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const { onLogout, authState } = useAuth();
  const handleConfirm = async () => {
    if (!authState) {
      return;
    }
    onConfirm();
    await onLogout!();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5">
            Log Out?
          </Text>
          <Text className="text-md font-normal text-[#0C3B2D] mb-10">
            Are you sure you want to log out?
          </Text>
          <View className="flex flex-row justify-end w-full">
            <TouchableOpacity
              className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
              onPress={handleConfirm}
            >
              <Text className="text-md font-semibold text-white px-4">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
              onPress={onCancel}
            >
              <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
