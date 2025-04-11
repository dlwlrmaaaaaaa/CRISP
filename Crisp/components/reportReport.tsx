import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";

interface ReportReportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmReport: (reason: string) => void;
}

const reasons = [
  "Spam",
  "Inappropriate Content",
  "Harassment",
  "False Information",
  "Other",
];

const ReportReportModal: React.FC<ReportReportModalProps> = ({
  visible,
  onClose,
  onConfirmReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const handleConfirm = async () => {
    let reason;

    if (selectedReason === "Other" && customReason.trim()) {
      reason = customReason;
    } else if (selectedReason) {
      reason = selectedReason;
    }

    if (reason) {
      try {
        await onConfirmReport(reason);
        setReportSuccess(true); // Display success message
      } catch (error) {
        console.error("Error submitting report:", error);
        // Optional: display error feedback to the user
      }
    }
  };

  // Modify handleClose to reset success state after confirming
  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason("");
    setReportSuccess(false);
    onClose();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className={`w-full p-2 border-b border-[#0C3B2D] ${
        selectedReason === item ? "bg-[#E0E0E0]" : ""
      }`}
      onPress={() => {
        setSelectedReason(item);
        if (item !== "Other") {
          setCustomReason(""); // Reset custom reason if not "Other"
        }
      }}
    >
      <Text className="text-md font-semibold py-2">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
          {reportSuccess ? ( // Conditional rendering for success message
            <View className="full p-3 bg-white rounded-xl items-start">
              <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                Your report has been submitted successfully!
              </Text>
              <View className="flex flex-row justify-end w-full ">
                <TouchableOpacity
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                  onPress={handleClose}
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-extrabold text-[#0C3B2D] px-3">
                Report Reason
              </Text>
              <View style={{ width: "100%", padding: 10 }}>
                <FlatList
                  data={reasons}
                  keyExtractor={(item) => item}
                  renderItem={renderItem}
                />
                {selectedReason === "Other" && (
                  <TextInput
                    className="w-full bg-white text-md py-4 px-2 mb-4 items-center justify-center text-[#0C3B2D] font-semibold border-b border-[#0C3B2D]"
                    placeholder="Please specify..."
                    placeholderTextColor={"#0C3B2D"}
                    value={customReason}
                    onChangeText={setCustomReason}
                  />
                )}
              </View>
              <View className="flex flex-row justify-end w-full mt-3 px-3">
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                >
                  <Text className="text-md font-semibold text-white px-4">
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
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

export default ReportReportModal;
