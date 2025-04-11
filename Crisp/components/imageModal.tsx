import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

interface ImageModalProps {
  fullImageModalVisible: boolean;
  setFullImageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedImage: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
  fullImageModalVisible,
  setFullImageModalVisible,
  selectedImage,
}) => {
  const { width, height } = Dimensions.get("window");

  return (
    <Modal
      visible={fullImageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setFullImageModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFullImageModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: width * 0.9,
                height: height * 0.55,
                borderRadius: 10,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ImageModal;
