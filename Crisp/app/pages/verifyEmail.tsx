import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";
import api from "@/app/api/axios";
import { scheduleNotification } from "../utils/notifications";
import LoadingButton from "@/components/loadingButton";

const { height } = Dimensions.get("window");

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(120); // Timer set to 2 minutes (120 seconds)
  const [canResend, setCanResend] = useState(false); // State for enabling/disabling resend button
  const [loading, setLoading] = useState(false);
  const { onVerifyEmail } = useAuth();

  // Countdown timer logic
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true); // Enable the resend button when timer reaches 0
    }
  }, [timer]);

  const handleOtpChange = (text: string) => {
    if (/^\d*$/.test(text) && text.length <= 6) {
      setOtp(text);
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      const email = await SecureStore.getItemAsync("email");
      if (!email) throw new Error("Email is missing!");

      const isVerified = await onVerifyEmail!(email, otp);

      if (!isVerified) {
        setOtpError(true);
        setLoading(false);
        setTimeout(() => setOtpError(false), 3500);
      }
    } catch (error) {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 3000);
    } finally {
      // Stop loading in both success and error cases
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setTimer(120);
    setCanResend(false);
    try {
      const email = await SecureStore.getItemAsync("email");
      if (!email) throw new Error("Email is missing!");
      const res = await api.post("api/resend-otp/verify/", { email });
      if (!res) throw new Error("Error resend-otp");
      scheduleNotification(
        "Email has been sent!",
        "Please check your email.",
        1,
        ""
      );
    } catch (error) {
      console.log("Resend OTP: ", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full h-full bg-[#F0F4C3] justify-center items-center p-5">
        <Text className="text-4xl text-[#0C3B2D] font-extrabold w-full flex text-left pl-10 mb-2">
          Verify your Email
        </Text>
        <Text className="text-md text-[#7e9778] font-bold w-full flex text-left px-10 mb-10">
          CRISP has sent you an OTP to verify your email address.
        </Text>
        <TextInput
          className="w-4/5 bg-white text-md p-4 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D] flex text-center"
          placeholder="Enter OTP"
          placeholderTextColor="#888"
          keyboardType="numeric"
          maxLength={6}
          onChangeText={handleOtpChange}
          value={otp}
        />
        {/* Timer and Resend Button */}
        <Text className="text-center text-[#0C3B2D] font-semibold mb-4">
          {canResend ? "Didn't receive the code?" : `Resend OTP in ${timer}s`}
        </Text>
        {otpError && (
          <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mb-2">
            Please enter a valid OTP.
          </Text>
        )}

        <TouchableOpacity
          disabled={!canResend} // Disable button until timer reaches 0
          onPress={resendOtp}
          className={`w-full max-w-[80%] p-2 rounded-xl shadow-lg justify-center items-center ${
            canResend ? "bg-[#0C3B2D]" : "bg-gray-400"
          }`}
        >
          <Text className="text-xl py-1 font-bold text-white">Resend OTP</Text>
        </TouchableOpacity>

        <LoadingButton
          style="w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center mt-4"
          title="Verify"
          onPress={sendOtp}
          loading={loading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
