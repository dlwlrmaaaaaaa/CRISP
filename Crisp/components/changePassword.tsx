import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/AuthContext/AuthContext";

const { width } = Dimensions.get("window");

interface ChangePasswordModalProps {
  visible: boolean;
  onConfirm: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  onCancel: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const { verifyCurrentPassword, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
      setSuccess(false);
      setErrorMessage(null);
      setIsCurrentPasswordValid(false); // Reset this state when modal opens
    }
  }, [visible]);

  const handleCurrentPasswordCheck = async () => {
    if (!verifyCurrentPassword) {
      setErrorMessage("Verify current password function is not available.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const valid = await verifyCurrentPassword(currentPassword);
      setIsCurrentPasswordValid(valid);
      if (!valid) {
        setErrorMessage("Current password is incorrect.");
      }
    } catch (error) {
      setErrorMessage("Current password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (isCurrentPasswordValid) {
      // Check if newPassword meets the requirements
      if (newPassword !== confirmPassword) {
        setErrorMessage("New passwords do not match.");
        return;
      }

      // Password validation checks
      if (newPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setErrorMessage("Password must contain at least one uppercase letter.");
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        setErrorMessage(
          "Password must contain at least one special character."
        );
        return;
      }
      if (!/\d/.test(newPassword)) {
        setErrorMessage("Password must contain at least one number.");
        return;
      }

      if (!changePassword) {
        setErrorMessage("Change password function is not available.");
        return;
      }

      // Proceed with changing password
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        await changePassword(currentPassword, newPassword);
        setSuccess(true); // Set success to true here
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        // Handle error here (optional)
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust this value if needed
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
            {!success ? (
              <>
                <View className="flex flex-col w-full px-3">
                  <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5">
                    Change Password
                  </Text>

                  {/* Current Password Input */}
                  <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                    <TextInput
                      className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                      placeholder="Current Password"
                      placeholderTextColor={"#0C3B2D"}
                      secureTextEntry={!showCurrent}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      editable={!isCurrentPasswordValid}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrent(!showCurrent)}
                      disabled={isCurrentPasswordValid}
                      className="text-lg p-3 items-center justify-center"
                    >
                      <MaterialCommunityIcons
                        name={showCurrent ? "eye" : "eye-off"}
                        size={RFPercentage(2.5)}
                        color="#0C3B2D"
                      />
                    </TouchableOpacity>
                  </View>

                  {isCurrentPasswordValid ? (
                    <>
                      {/* New Password Input */}
                      <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                        <TextInput
                          className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                          placeholder="New Password"
                          placeholderTextColor={"#0C3B2D"}
                          secureTextEntry={!showNew}
                          value={newPassword}
                          onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNew(!showNew)}
                          className="text-lg p-3 items-center justify-center"
                        >
                          <MaterialCommunityIcons
                            name={showNew ? "eye" : "eye-off"}
                            size={RFPercentage(2.5)}
                            color="#0C3B2D"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Confirm New Password Input */}
                      <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between items-center border border-[#0C3B2D]">
                        <TextInput
                          className="w-4/5 text-md p-4 text-[#0C3B2D] font-semibold items-center h-full justify-center"
                          placeholder="Confirm New Password"
                          placeholderTextColor={"#0C3B2D"}
                          secureTextEntry={!showConfirm}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirm(!showConfirm)}
                          className="text-lg p-3 items-center justify-center"
                        >
                          <MaterialCommunityIcons
                            name={showConfirm ? "eye" : "eye-off"}
                            size={RFPercentage(2.5)}
                            color="#0C3B2D"
                          />
                        </TouchableOpacity>
                      </View>

                      {newPassword.length > 0 && newPassword.length < 6 && (
                        <Text className="text-md text-red-800 font-semibold flex text-left w-full mt-2">
                          Password must be at least 6 characters long.
                        </Text>
                      )}
                      {newPassword.length > 0 && !/[A-Z]/.test(newPassword) && (
                        <Text className="text-md text-red-800 font-semibold flex text-left w-full mt-2">
                          Password must contain at least one uppercase letter.
                        </Text>
                      )}
                      {newPassword.length > 0 && !/\d/.test(newPassword) && (
                        <Text className="text-md text-red-800 font-semibold flex text-left w-full mt-2">
                          Password must contain at least one number.
                        </Text>
                      )}
                      {newPassword.length > 0 &&
                        !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                          <Text className="text-md text-red-800 font-semibold flex text-left w-full mt-2">
                            Password must contain at least one special
                            character.
                          </Text>
                        )}
                      {confirmPassword.length > 0 &&
                        confirmPassword !== newPassword && (
                          <Text className="text-md text-red-800 font-semibold flex text-left w-full mt-2">
                            Passwords do not match.
                          </Text>
                        )}
                    </>
                  ) : (
                    <View className="flex flex-row justify-end w-full">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center mb-4"
                        onPress={handleCurrentPasswordCheck}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text className="text-md font-semibold text-white px-4">
                            Continue
                          </Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3 mb-4"
                        onPress={onCancel}
                      >
                        <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {errorMessage && (
                    <View className="w-full flex items-start">
                      <Text className="text-md text-red-700 font-semibold mb-5">
                        {errorMessage}
                      </Text>
                    </View>
                  )}

                  {isCurrentPasswordValid && (
                    <View className="flex flex-row justify-end w-full">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                        onPress={handleConfirm}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text className="text-md font-semibold text-white px-4">
                            Confirm
                          </Text>
                        )}
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
                  )}
                </View>
              </>
            ) : (
              <View className="full p-3 bg-white rounded-xl items-start">
                <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                  Password changed successfully!
                </Text>
                <View className="flex flex-row justify-end w-full ">
                  <TouchableOpacity
                    className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                    onPress={onCancel}
                  >
                    <Text className="text-md font-semibold text-white px-4">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangePasswordModal;
