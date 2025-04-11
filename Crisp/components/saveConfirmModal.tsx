import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

const { width } = Dimensions.get("window");

interface SaveConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
            Data Modified
          </Text>
          <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
            Do you wish to save your changes?
          </Text>
          <View className="flex flex-row justify-end w-full ">
            <TouchableOpacity
              className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
              onPress={onConfirm}
            >
              <Text className="text-md font-semibold text-white px-4">
                Confrim
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

export default SaveConfirmationModal;
