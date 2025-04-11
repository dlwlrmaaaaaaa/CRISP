import api from "@/app/api/axios";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LoadingButton from "./loadingButton";
import { router } from "expo-router";
interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reEnterNewPassword, setReEnterNewPassword] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [timer, setTimer] = useState(60); // Timer for resend code
  const [timerActive, setTimerActive] = useState(false); // To check if the timer is active
  const [passwordUpdated, setPasswordUpdated] = useState(false); // Track if password is updated
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false); // Disable timer when it reaches 0
    }

    // Clean up interval on component unmount or timer change
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email) && !/\.\./.test(email);
  };

  // Password complexity checker
  const isPasswordComplex = (text: string) => {
    const hasUpperCase = /[A-Z]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(text);
    return hasUpperCase && hasNumber && hasSymbol;
  };

  const handleForgotPassword = async () => {
    try {
      if (!isValidEmail(email)) {
        setMessage("Please enter a valid email address.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
        return;
      } else if (email) {
        
        setLoading(true);
        const res = await api.post("api/forgot-password/", { email });
        if (!res) {
          setMessage("An error occurred. Please try again.");
          setTimeout(() => {
            setMessage("");
          }, 2000);
          return;
        }
        setIsSent(true)
        setEmailValid(true);
        setTimer(60); 
        setTimerActive(true); 

        setMessage("CRISP has sent you an OTP to verify your email address.");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      
      } else {
        setMessage("Please enter your email address.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }finally{
      setLoading(false)
    }
  };

  const handleCodeVerification = async () => {
    try {
      if (code) {
        setLoading(true);
        const res = await api.post("api/verify-otp/", { otp: code, email });
        if (!res) {
          setMessage("An error occurred. Please try again.");
          setTimeout(() => {
            setMessage("");
          }, 2000);
          return;
        }
        setCodeVerified(true);
        setIsCodeVerified(true);
        setCode("");
        setMessage("Code verified successfully!");
        setLoading(false)
        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setMessage("Please enter the code.");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
    }
  };

  const handleSubmitNewPassword = async () => {
    if (newPassword !== reEnterNewPassword) {
      setMessage("Passwords do not match.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
  
    try {
      setLoading(true);
      
      const res = await api.post("api/reset-password/", {
        password: newPassword,
        password_confirm: reEnterNewPassword,
        email,
      });
  
      if (res?.status === 200 || res?.status === 201) {
        setPasswordUpdated(true);
        setEmail("");
        setMessage("Password updated successfully!");
  
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 2000);
      } else {
        throw new Error("Failed to update password.");
      }
  
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsSent(false);
      setCodeVerified(false);
      setIsCodeVerified(false);
      setEmailValid(false);

      onClose()
    }
  };
  

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setCode("");
    setNewPassword("");
    setReEnterNewPassword("");
    setCodeVerified(false);
    setEmailValid(false);
    setTimer(60);
    setTimerActive(false); // Reset timer when modal is closed
    setPasswordUpdated(false); // Reset password updated state
    onClose();
  };

  const handleResendCode = () => {
    if (timer === 0) {
      setTimer(60);
      setTimerActive(true);
      setMessage("CRISP has resent the OTP to your email.");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 p-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
            <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5">
              {codeVerified ? "Change Password" : "Forgot Password"}
            </Text>

            {passwordUpdated ? (
              <>
                <Text className="text-md text-[#0C3B2D] font-semibold mb-5">
                  Your password has been successfully updated!
                </Text>
              </>
            ) : (
              <>
                {!isSent ? (
                  <>
                    <TextInput
                      className="w-full h-auto bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                      placeholder="Enter your email"
                      placeholderTextColor="#888"
                      value={email}
                      onChangeText={setEmail}
                    />             
                    <LoadingButton
                      title="Send Email"
                      onPress={handleForgotPassword}
                      loading={loading}
                      style="mt-5 w-full bg-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
                    >

                    </LoadingButton>

                    {/* <TouchableOpacity
                      className="mt-5 w-full bg-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
                      onPress={handleForgotPassword}
                    >
                      <Text className="text-md py-1 font-bold text-white">
                        Send Email
                      </Text>
                    </TouchableOpacity> */}
                  </>
                ) : null}

                {emailValid && !isCodeVerified ? (
                  <>
                    <TextInput
                      className="w-full h-auto bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                      placeholder="Enter code"
                      placeholderTextColor="#888"
                      value={code}
                      onChangeText={setCode}
                    />
                    {message ? (
                      <Text className="text-md text-red-800 font-semibold flex items-center w-full">
                        {message}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      className="mt-5 w-full bg-[#f5f5f5] rounded-lg p-2 justify-center items-center border border-[#0C3B2D]"
                      onPress={handleResendCode}
                      disabled={timerActive}
                    >
                      <Text
                        className={`text-md py-1 font-bold text-[#0C3B2D]  ${timerActive ? "text-gray-400" : ""}`}
                      >
                        {timerActive
                          ? `Resend Code (${timer}s)`
                          : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
             
                    <LoadingButton
                      title="Verify Code"
                      onPress={handleCodeVerification}
                      loading={loading}
                      style="mt-2 w-full bg-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center" 
                    />
                  </>
                ) : null}

                { isCodeVerified && (
                  <>
                    <TextInput
                      className="w-full h-auto bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                      placeholder="New Password"
                      placeholderTextColor="#888"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                    <TextInput
                      className="w-full h-auto bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                      placeholder="Re-enter New Password"
                      placeholderTextColor="#888"
                      value={reEnterNewPassword}
                      onChangeText={setReEnterNewPassword}
                      secureTextEntry
                    />
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <Text className="text-md text-red-800 font-semibold flex text-left w-full  mt-2">
                        Password must be at least 6 characters long.
                      </Text>
                    )}
                    {newPassword.length > 0 && !/[A-Z]/.test(newPassword) && (
                      <Text className="text-md text-red-800 font-semibold flex text-left w-full  mt-2">
                        Password must contain at least one uppercase letter.
                      </Text>
                    )}
                    {newPassword.length > 0 && !/\d/.test(newPassword) && (
                      <Text className="text-md text-red-800 font-semibold flex text-left w-full  mt-2">
                        Password must contain at least one number.
                      </Text>
                    )}
                    {newPassword.length > 0 &&
                      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                        <Text className="text-md text-red-800 font-semibold flex text-left w-full  mt-2">
                          Password must contain at least one special character.
                        </Text>
                      )}
                    {reEnterNewPassword.length > 0 &&
                      reEnterNewPassword !== newPassword && (
                        <Text className="text-md text-red-800 font-semibold flex text-left w-full  mt-2">
                          Passwords do not match.
                        </Text>
                      )}

                    <LoadingButton
                      title="Submit New Password"
                      onPress={handleSubmitNewPassword}
                      loading={loading}
                      style="mt-5 w-full bg-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
                    />

                  </>
                )}
              </>
            )}

            <TouchableOpacity
              className="mt-2 w-full bg-white border border-[#0C3B2D] rounded-lg p-2 shadow-lg justify-center items-center"
              onPress={handleClose}
            >
              <Text className="text-md py-1 font-bold text-[#0C3B2D]">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ForgotPasswordModal;
