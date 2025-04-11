import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapPicker from "@/components/mapPicker";
import { useAuth } from "@/AuthContext/AuthContext";
import LoadingButton from "@/components/loadingButton";
import TermsCondition from "@/components/termsCondition";
const bgImage = require("@/assets/images/landing_page.png");
const { width, height } = Dimensions.get("window");
import { scheduleNotification } from "../utils/notifications";

export default function Register() {
  const [password, setPassword] = useState("");
  const [password_confirm, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onRegister } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handlePasswordChange = (text: string) => {
    if (text.length <= 16) {
      setPassword(text);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (text.length <= 16) {
      setConfirmPassword(text);
    }
  };

  const isPasswordComplex = (text: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSymbol;
  };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CRISP/1.0.9 crisp.uccbscs@gmail.com",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching address:", errorText);
        return null;
      }
      const data = await response.json();

      if (data && data.address) {
        const { road, suburb, city, region, country, postal_code } =
          data.address;

        const addressParts = [
          road,
          suburb,
          city,
          region,
          country,
          postal_code,
        ].filter(Boolean);

        const address = addressParts.join(", "); // Join the non-empty parts
        return address || "Address not found";
      } else {
        console.error("Nominatim API error:", data);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    // Convert coordinates to address if needed
    const address: any = await getAddressFromCoordinates(
      location.latitude,
      location.longitude
    );
    setAddress(address);
    setCoordinates(`${location.latitude}, ${location.longitude}`);
    setShowMapPicker(false); // Close the map picker
  };

  const emptyFieldChecker = () => {
    if (!username || !email || !password || !password_confirm || !address) {
      setErrors("Empty fields must be filled up!");
      setTimeout(() => {
        setErrors("");
      }, 2000);
      return false;
    }
    return true;
  };
  // Email regex for validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email) && !/\.\./.test(email);
  };

  const handleRegister = async () => {
    // Reset errors
    setErrors("");

    if (!isChecked) {
      setErrors("You must agree to the terms and conditions first.");
      setTimeout(() => {
        setErrors("");
      }, 2000);
      return; // Stop execution if the checkbox is not checked
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setErrors("Please enter a valid email address.");
      setTimeout(() => {
        setErrors("");
      }, 2000);
      return; // Stop execution if email is invalid
    }

    try {
      const validatedFields = emptyFieldChecker();
      if (!validatedFields) return;

      // Check password complexity
      if (!isPasswordComplex(password)) {
        alert(
          "Password must contain at least one uppercase letter, one number, and one special character."
        );
        return;
      }

      if (password !== password_confirm) {
        alert("Passwords do not match.");
        return;
      }

      setLoading(true);

      if (!onRegister) {
        throw new Error("Undefined onRegister");
      }
      const res = await onRegister!(
        username,
        email,
        password,
        password_confirm,
        address,
        coordinates,
        contact_number
      );
      if (res.error) {
        const errorMessages: string[] = [];

        // Check if res has a msg field (which will be used in case of error)
        if (res.msg) {
          errorMessages.push(res.msg);
        }

        // If error contains more specific error details like email or ipv, add them as well
        if (res.error.email) {
          errorMessages.push(res.error.email[0]);
        }
        if (res.error.ipv) {
          errorMessages.push(res.error.ipv[0]);
        }

        // Update the error state with the combined messages
        setErrors(errorMessages.join(", "));
        console.log("Errors:", errorMessages.join(", "));
        return;
      }

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Register Error!");
      }
      router.push("/pages/verifyEmail");
    } catch (error: any) {
      alert(error?.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ImageBackground source={bgImage} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }} // Ensures ScrollView takes full height
          >
            <View className="w-full h-full relative items-center justify-center">
              {/* Ensure this View fills the full screen */}
              <View className="w-full h-full bg-[#F0F4C3] flex flex-col rounded-t-3xl justify-center items-center">
                {/* <View className="w-full h-auto bg-white flex flex-col rounded-t-3xl justify-center items-center bottom-0 absolute border-2 border-[#0C3B2D]"> */}
                <View className="w-full flex justify-start items-start">
                  <Text className="text-3xl font-extrabold text-[#0C3B2D] my-10 ml-10">
                    Create an Account
                  </Text>
                </View>
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Enter your name
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-4/5 bg-white text-md px-4 py-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholder="Enter your name"
                  placeholderTextColor="#888"
                  onChangeText={(text) => setUsername(text.toLowerCase())}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Enter your address
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <View className="w-4/5 bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                    placeholder="Enter your address"
                    placeholderTextColor="#888"
                    value={address}
                    editable={false} // Make it non-editable
                    onChangeText={setAddress}
                  />
                  <TouchableOpacity
                    onPress={() => setShowMapPicker(true)}
                    className="text-lg p-3 items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={24}
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Enter your email
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-4/5 bg-white text-md px-4 py-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  onChangeText={setEmail}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Enter your 11 digits mobile number
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-4/5 bg-white text-md px-4 py-3 rounded-lg mb-2 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  maxLength={11}
                  onChangeText={setContactNumber}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Enter your password
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <View className="w-4/5 bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                    placeholder="Enter your password"
                    placeholderTextColor="#888"
                    secureTextEntry={!passwordVisible}
                    maxLength={16}
                    onChangeText={handlePasswordChange}
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
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-[#0C3B2D] mb-1 ml-12">
                    Confirm your password
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <View className="w-4/5 bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TextInput
                    className="w-4/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                    placeholder="Confirm your password"
                    placeholderTextColor="#888"
                    secureTextEntry={!confirmPasswordVisible}
                    maxLength={16}
                    onChangeText={handleConfirmPasswordChange}
                  />
                  <TouchableOpacity
                    className="text-lg p-3 items-center justify-center"
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  >
                    <MaterialCommunityIcons
                      name={confirmPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color="#0C3B2D"
                    />
                  </TouchableOpacity>
                </View>
                <View className={"flex-row items-center my-2"}>
                  <Checkbox
                    value={isChecked}
                    onValueChange={handleCheckboxChange}
                    className="mr-2"
                    color={isChecked ? "#0C3B2D" : "gray"}
                  />
                  <Text className={"text-sm"}>I agree to the </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFullImageModalVisible(true);
                    }}
                  >
                    <Text className={"text-[#0C3B2D] font-bold"}>
                      Terms and Conditions
                    </Text>
                  </TouchableOpacity>
                </View>
                {password.length > 0 && password.length < 6 && (
                  <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                    Password must be at least 6 characters long.
                  </Text>
                )}
                {password.length > 0 && !/[A-Z]/.test(password) && (
                  <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                    Password must contain at least one uppercase letter.
                  </Text>
                )}
                {password.length > 0 && !/\d/.test(password) && (
                  <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                    Password must contain at least one number.
                  </Text>
                )}
                {password.length > 0 &&
                  !/[!@#$%^&*(),.?":{}|<>]/.test(password) && (
                    <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                      Password must contain at least one special character.
                    </Text>
                  )}
                {password_confirm.length > 0 &&
                  password_confirm !== password && (
                    <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                      Passwords do not match.
                    </Text>
                  )}
                {errors && (
                  <Text className="text-md text-red-800 font-semibold flex text-left w-full ml-24 mt-2">
                    {errors}
                  </Text>
                )}
                <LoadingButton
                  style="mt-3 w-full max-w-[80%] bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center"
                  title="REGISTER"
                  onPress={handleRegister}
                  loading={loading}
                />
                <TouchableOpacity
                  className="w-full flex items-center justify-center flex-row mt-6"
                  onPress={() => router.navigate(`/pages/login`)}
                >
                  <Text className="text-lg text-[#7e9778] mr-3 mt-1 mb-8 font-semibold flex">
                    Already have an account?
                  </Text>
                  <Text className="text-lg text-[#0C3B2D] mt-1 mb-8 font-bold flex">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
              {showMapPicker && (
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  onClose={() => setShowMapPicker(false)}
                />
              )}
              <TermsCondition
                fullImageModalVisible={fullImageModalVisible}
                setFullImageModalVisible={setFullImageModalVisible}
              />
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
