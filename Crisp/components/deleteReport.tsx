import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface DeleteReportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reportId: string) => Promise<void>;
  reportId: string | null;
}

const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  visible,
  onClose,
  onConfirm,
  reportId,
}) => {
  const [success, setSuccess] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (reportId) {
      setLoading(true); // Set loading to true when confirmation begins
      try {
        await onConfirm(reportId);
        setSuccess(true);
        setSuccessMessageVisible(true);
      } catch (error) {
        console.error("Error deleting report:", error);
      } finally {
        setLoading(false); // Set loading to false after the process
      }
    }
  };

  useEffect(() => {
    if (!visible) {
      setSuccess(false); // Reset success state when modal is closed
      setSuccessMessageVisible(false);
    } else if (successMessageVisible) {
      let timer: NodeJS.Timeout;

      // Set a timer to hide the success message after 3 seconds
      timer = setTimeout(() => {
        setSuccessMessageVisible(false);
        onClose(); // Close the modal after the message is hidden
      }, 3000); // Duration for success message

      return () => {
        clearTimeout(timer); // Clean up the timer
      };
    }
  }, [visible, successMessageVisible]);

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          {!success ? (
            <>
              <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
                Delete Report
              </Text>
              <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
                Are you sure you want to delete your post?
              </Text>
              <View className="flex flex-row justify-end w-full mt-3 px-3">
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" /> // Show loading spinner
                  ) : (
                    <Text className="text-md font-semibold text-white px-4">
                      Confirm
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
                >
                  <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : successMessageVisible ? (
            <View className="full p-3 bg-white rounded-xl items-start">
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                Report has been Deleted successfully!
              </Text>
              <View className="flex flex-row justify-end w-full ">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={onClose} // Close the modal here
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default DeleteReportModal;
