// CancelModal.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

interface CancelModalModalProps {
  visible: boolean;
  onConfirm: () => void; // Changed to a function type
  onCancel: () => void; // Changed to a function type
}

const CancelModal: React.FC<CancelModalModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
            Leave Page
          </Text>
          <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
            Changes that you made may not be saved.
          </Text>
          <View className="flex flex-row justify-end w-full mt-3  px-3">
            <TouchableOpacity
              className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
              // onPress={onConfirm}
              onPress={() => {
                // setCancelModalVisible(true);
                onConfirm();
                router.back();
              }}
            >
              <Text className="text-md font-semibold text-white px-4">
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
              onPress={onCancel}
            >
              <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CancelModal;
