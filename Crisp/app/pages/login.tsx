import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingButton from "@/components/loadingButton";
import ForgotPasswordModal from "@/components/forgotPassModal";
import { useAuth } from "@/AuthContext/AuthContext";
const bgImage = require("@/assets/images/landing_page.png");
// Get screen dimensions
const { height } = Dimensions.get("window");
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { onLogin } = useAuth();
  const IS_EMAIL_VERIFIED = "is_email_verified";
  const ACCOUNT_TYPE = "account_type";

  // Email regex for validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setErrors("");

    // Validate email format
    if (!isValidEmail(username)) {
      setErrors("Please enter a valid email address.");
      return; // Stop execution if email is invalid
    }

    setLoading(true);
    try {
      const result = await onLogin!(username, password);
      const is_email_verified =
        await SecureStore.getItemAsync(IS_EMAIL_VERIFIED);
      const is_verified = await SecureStore.getItemAsync("is_verified");
      const account_type = await SecureStore.getItemAsync(ACCOUNT_TYPE);

      if (!result) {
        throw new Error("Error While Logging in!");
      }

      // Redirect based on account type
      if (account_type === "citizen") {
        if (is_email_verified !== "true") {
          router.push("/pages/verifyEmail");
          return;
        }
        if (is_verified !== "true") {
          router.push("/(tabs)/home");
          return;
        }
        router.push("/(tabs)/camera");
      } else if (account_type === "worker") {
        router.push("/(tabs)_employee/reports");
      } else {
        // Handle unexpected account types or default case
        setErrors("Unexpected account type");
      }
    } catch (error: any) {
      if (error.message === "Invalid username or password") {
        setErrors("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          setErrors("");
        }, 2000);
      } else {
        setErrors("Invalid Email or Password");
        console.log(error.message);
        setTimeout(() => {
          setErrors("");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust this value if needed
      >
        <View className="w-full h-full relative items-center justify-center">
          <Image source={bgImage} className="w-full h-full absolute cover" />
          <View className="w-full h-auto bg-[#F0F4C3] flex flex-col rounded-t-3xl justify-center items-center bottom-0 absolute">
            <View className="w-full flex justify-start items-start">
              <Text className="text-3xl font-extrabold text-[#0C3B2D] my-10 ml-10">
                Welcome Back!
              </Text>
            </View>

            <View className="w-full flex flex-row">
              <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                Enter your email
              </Text>
              <Text className="text-md font-semibold text-red-500 ml-1">*</Text>
            </View>
            <TextInput
              className="w-4/5 bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
              placeholder="Enter your email"
              onChangeText={(text) => setUsername(text.toLowerCase())}
              placeholderTextColor="#888"
            />
            <View className="w-full flex flex-row">
              <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                Enter your password
              </Text>
              <Text className="text-md font-semibold text-red-500 ml-1">*</Text>
            </View>
            <View className="w-4/5 bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
              <TextInput
                className="w-4/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-start justify-start"
                placeholder="Enter your password"
                placeholderTextColor="#888"
                secureTextEntry={!passwordVisible}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                className="text-lg p-3 items-center justify-center"
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <MaterialCommunityIcons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#0C3B2D"
                />
              </TouchableOpacity>
            </View>
            {errors ? (
              <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                {errors}
              </Text>
            ) : null}
            <TouchableOpacity
              className="w-full flex items-end justify-end mr-24"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-lg text-[#0C3B2D] mt-1 mb-8 font-semibold flex">
                Forgot Password?
              </Text>
            </TouchableOpacity>
            <LoadingButton
              style="mt-3 w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center"
              title="LOGIN"
              onPress={handleLogin}
              loading={loading}
            />
            <TouchableOpacity
              className="w-full flex items-center justify-center flex-row mt-15 mb-2"
              onPress={() => router.navigate(`/pages/register`)}
            >
              <Text className="text-lg text-[#7e9778] mr-3 mt-1 mb-10 font-semibold flex">
                Don't have an account?
              </Text>
              <Text className="text-lg text-[#0C3B2D] mt-1 mb-10 font-bold flex">
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal for Forgot Password */}
          <ForgotPasswordModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
