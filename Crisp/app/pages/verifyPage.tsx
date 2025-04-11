import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  ImageBackground,
  TouchableWithoutFeedback,
  Event,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RFPercentage } from "react-native-responsive-fontsize";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Camera } from "expo-camera";
import { router } from "expo-router";
import CancelModal from "@/components/cancelModal";
const bgImage = require("@/assets/images/bgImage.png");
import { useAuth } from "@/AuthContext/AuthContext";
import LoadingButton from "@/components/loadingButton";

const { width, height } = Dimensions.get("window");

export default function VerifyPage() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [idPicture, setIdPicture] = useState<string | null>(null);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { verifyAccount } = useAuth();

  const validateName = (text: string) => {
    // Regular expression to allow letters (A-Z, a-z) and spaces
    const namePattern = /^[A-Za-z ]*$/; // Allow empty string (this handles backspace)

    // Only set the state with valid characters (no empty string return)
    if (namePattern.test(text)) {
      return text; // Allow the input if it matches the pattern
    } else {
      return text.slice(0, -1); // Remove last character if invalid (essentially block invalid chars)
    }
  };

  const handleVerify = async () => {
    console.log("Verifying with inputs:", {
      firstName,
      middleName,
      lastName,
      address,
      // birthday,
      idNumber,
      selfie,
      photo,
      idPicture,
    });
    try {
      setLoading(true);
      const emptyFields = [];

      if (!firstName) emptyFields.push("First Name");
      if (!lastName) emptyFields.push("Last Name");
      if (!middleName) emptyFields.push("Middle Name");
      if (!address) emptyFields.push("Address");
      // if (!birthday) emptyFields.push("Birthday");
      if (!idNumber) emptyFields.push("ID Number");
      if (!selfie) emptyFields.push("Selfie");
      if (!photo) emptyFields.push("Picture");
      if (!idPicture) emptyFields.push("ID Picture");

      if (emptyFields.length > 0) {
        setErrorMessage(
          `Please fill in all required fields: ${emptyFields.join(", ")}`
        );
        console.log("Empty fields:", emptyFields);
        setValidationModalVisible(true); // Show validation modal
        return; // Exit the function if validation fails
      }

      console.log("Verifying with inputs:", {
        firstName,
        middleName,
        lastName,
        address,
        // birthday,
        idNumber,
        selfie,
        photo,
        idPicture,
      });

      // Check if verifyAccount function is defined
      if (!verifyAccount) {
        throw new Error("verifyAccount function is not defined");
      }

      const res = await verifyAccount(
        firstName,
        middleName,
        lastName,
        address,
        // birthday,
        idNumber,
        selfie || "", // Use fallback
        photo || "", // Use fallback
        idPicture || "" // Use fallback
      );
      if (!res) {
        throw new Error("Cannot verify your account at the moment.");
      }
      console.log("Account verified successfully.");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setAddress("");
      setBirthday("");
      setIdNumber("");
      setSelfie(null);
      setPhoto(null);
      setIdPicture(null);
      setLoading(false);
      setModalVisible(true);
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(`Error: ${error.response.data.message || error.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setBirthday(currentDate.toLocaleDateString()); // Format the date as needed
    setSelectedDate(currentDate);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        await SecureStore.setItemAsync("photoUri", result.assets[0].uri);
        console.log("ID photo stored:", result.assets[0].uri);
      }
    }
  };

  const takeSelfie = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setSelfie(result.assets[0].uri);
        await SecureStore.setItemAsync("selfieUri", result.assets[0].uri);
        console.log("Selfie stored:", result.assets[0].uri);
      }
    }
  };

  const takeIdPicture = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setIdPicture(result.assets[0].uri);
        await SecureStore.setItemAsync("idPictureUri", result.assets[0].uri);
        console.log("ID picture stored:", result.assets[0].uri);
      }
    }
  };

  const loadStoredImages = async () => {
    const photoUri = await SecureStore.getItemAsync("photoUri");
    const selfieUri = await SecureStore.getItemAsync("selfieUri");
    const idPictureUri = await SecureStore.getItemAsync("idPictureUri");

    // Use the stored URIs as needed
    if (photoUri) {
      setPhoto(photoUri);
    }
    if (selfieUri) {
      setSelfie(selfieUri);
    }
    if (idPictureUri) {
      setIdPicture(idPictureUri);
    }
  };

  // Call loadStoredImages on component mount or when needed
  useEffect(() => {
    console.log(showDatePicker);
    loadStoredImages();
  }, []);

  const confirmCancel = async () => {
    // Clear the input states
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setAddress("");
    setBirthday("");
    setIdNumber("");
    setSelfie(null);
    setPhoto(null);
    setIdPicture(null);

    // Clear stored URIs
    await SecureStore.deleteItemAsync("photoUri");
    await SecureStore.deleteItemAsync("selfieUri");
    await SecureStore.deleteItemAsync("idPictureUri");

    // Navigate and close modal
    setCancelModalVisible(false);
    router.back();
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <TouchableWithoutFeedback>
        <SafeAreaView className="flex-1">
          <View className="flex flex-row w-full items-center justify-between px-6">
            <Text className="font-bold text-4xl text-white mt-8 mb-8 ml-4">
              Verify Account
            </Text>
          </View>
          <ScrollView className="w-full h-full flex">
            <View className="flex flex-col w-full h-full items-center ">
              <View className="justify-center w-full items-center px-10 mt-6">
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your Last Name
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholderTextColor="#888"
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={(text) => setLastName(validateName(text))}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your First Name
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholderTextColor="#888"
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={(text) => setFirstName(validateName(text))}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your Middle Name
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholderTextColor="#888"
                  placeholder="Middle Name"
                  value={middleName}
                  onChangeText={(text) => setMiddleName(validateName(text))}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your Address
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholderTextColor="#888"
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                />
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your Birthday
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  {/* Birthday Button */}
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <TextInput
                      className="w-full text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                      placeholderTextColor="#888"
                      placeholder="Select Birthday"
                      value={birthday}
                      editable={false}
                    />
                  </TouchableOpacity>
                  {/* DateTimePicker */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={onChange}
                    />
                  )}
                </View>
                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Enter your ID Number
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <TextInput
                  className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                  placeholderTextColor="#888"
                  placeholder="ID Number"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  keyboardType="numeric"
                />
                {/* ID Photo Upload Button */}

                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Choose a Photo
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TouchableOpacity
                    className="w-3/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-start justify-center"
                    onPress={() => {
                      if (photo) {
                        // Ensure there's a selfie to show
                        setSelectedImage(photo);
                        setFullImageModalVisible(true);
                      }
                    }}
                  >
                    <TextInput
                      className="text-[#0C3B2D] text-md font-bold"
                      value={photo || ""}
                      editable={false}
                      placeholderTextColor="#888"
                      placeholder="Choose a Photo "
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickImage}
                    className="bg-[#0C3B2D] border border-[#8BC34A] px-4 py-3 rounded-lg items-center justify-center"
                  >
                    <Text className="text-white text-md font-normal">
                      Choose Photo
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Take a selfie with ID
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                {/* Selfie with ID Button */}
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TouchableOpacity
                    className="w-3/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-start justify-center"
                    onPress={() => {
                      if (selfie) {
                        // Ensure there's a selfie to show
                        setSelectedImage(selfie);
                        setFullImageModalVisible(true);
                      }
                    }}
                  >
                    <TextInput
                      className="text-[#0C3B2D] text-md font-bold"
                      value={selfie || ""}
                      editable={false}
                      placeholderTextColor="#888"
                      placeholder="Take a Selfie with ID "
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takeSelfie}
                    className="bg-[#0C3B2D] border border-[#8BC34A] px-4 py-3 rounded-lg items-center justify-center"
                  >
                    <Text className="text-white text-md font-normal">
                      Take a Selfie
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="w-full flex flex-row">
                  <Text className="text-md font-semibold text-white mb-1">
                    Take a Picture of ID
                  </Text>
                  <Text className="text-md font-semibold text-red-500 ml-1">
                    *
                  </Text>
                </View>
                {/* Take Picture of ID Button */}
                <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                  <TouchableOpacity
                    className="w-3/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-start justify-center"
                    onPress={() => {
                      if (idPicture) {
                        // Ensure there's a selfie to show
                        setSelectedImage(idPicture);
                        setFullImageModalVisible(true);
                      }
                    }}
                  >
                    <TextInput
                      className="text-[#0C3B2D] text-md font-bold"
                      value={idPicture || ""}
                      editable={false}
                      placeholderTextColor="#888"
                      placeholder="Take a Picture of the ID "
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takeIdPicture}
                    className="bg-[#0C3B2D] border border-[#8BC34A] px-4 py-3 rounded-lg items-center justify-center"
                  >
                    <Text className="text-white text-md font-normal">
                      Take a Photo
                    </Text>
                  </TouchableOpacity>
                </View>
                <LoadingButton
                  title={"Verify"}
                  onPress={handleVerify}
                  loading={loading}
                  style={
                    "mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
                  }
                />

                <TouchableOpacity
                  className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 mb-6  shadow-lg justify-center items-center"
                  onPress={() => setCancelModalVisible(true)}
                >
                  <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          {/* Modal for Verification */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={validationModalVisible}
            onRequestClose={() => setValidationModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="w-4/5 py-5 px-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
                  Validation Error
                </Text>
                <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
                  {errorMessage}
                </Text>
                <View className="flex flex-row justify-end w-full">
                  <TouchableOpacity
                    className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                    onPress={() => setValidationModalVisible(false)}
                  >
                    <Text className="text-lg font-semibold text-white px-2">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* // Success Modal */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="w-4/5 py-5 px-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
                  Done
                </Text>
                <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
                  Wait for Verification
                </Text>
                <View className="flex flex-row justify-end w-full">
                  <TouchableOpacity
                    className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                    onPress={() => {
                      setModalVisible(false); // Close the modal
                      router.back(); // Navigate back
                    }}
                  >
                    <Text className="text-lg font-semibold text-white px-2">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Cancel Modal */}
          <CancelModal
            visible={cancelModalVisible}
            onConfirm={confirmCancel}
            onCancel={() => setCancelModalVisible(false)}
          />
          {/* Full Screen Image Modal */}
          <Modal
            visible={fullImageModalVisible}
            transparent={true}
            animationType="fade"
          >
            <TouchableWithoutFeedback
              onPress={() => setFullImageModalVisible(false)}
            >
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
                      width: width * 0.9, // 90% of screen width
                      height: height * 0.55, // 60% of screen height
                      borderRadius: 10,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}
