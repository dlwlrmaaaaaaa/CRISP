import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

interface ReportValidationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmValidation: () => void;
  isSuccess: boolean;
  modalMessage?: string;
}

const ReportValidationModal: React.FC<ReportValidationModalProps> = ({
  visible,
  onClose,
  onConfirmValidation,
  isSuccess,
  modalMessage,
}) => {
  const handleClose = () => {
    onClose(); // Close the modal when clicking Cancel or Close
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 p-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          {isSuccess ? (
            <>
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                Report validation successful!
              </Text>
              <View className="flex flex-row justify-end mt-3 w-full">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={handleClose} // Close the modal here
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : modalMessage ? (
            <>
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                {modalMessage}
              </Text>
              <View className="flex flex-row justify-end mt-3 w-full">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={handleClose} // Close modal
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                Confirm Report Validation
              </Text>
              <View className="flex flex-row justify-end mt-3 w-full">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={onConfirmValidation} // Confirm validation
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
                  onPress={handleClose} // Close modal
                >
                  <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReportValidationModal;
