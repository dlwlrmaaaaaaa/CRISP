import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import MapPicker from "@/components/mapPicker";
import LogoutModal from "@/components/logout";
import ChangePasswordModal from "@/components/changePassword";
import SaveConfirmationModal from "@/components/saveConfirmModal";
import CancelModal from "@/components/cancelModal";
import TermsCondition from "@/components/termsCondition";
import { router } from "expo-router";
const bgImage = require("@/assets/images/bgImage.png");
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";
const { width, height } = Dimensions.get("window");

export default function Profile() {
  return <App />;
}

function App() {
  const { getUserInfo, updateProfile, isPending } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [coordinates, setCoordinates] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await (getUserInfo
        ? getUserInfo()
        : Promise.resolve({}));
      const station_address = await SecureStore.getItemAsync("station_address");
      const [latStr, longStr] =
        station_address?.split(",") || "Address cannot fetch at the moment.";
      const lat = parseInt(latStr);
      const long = parseInt(longStr);
      // const address_name = await getAddressFromCoordinates(lat, long);
      setName(userInfo?.username || "");
      setAddress(station_address || "");
      setEmail(userInfo?.email || "");
      setContact(userInfo?.contact_number || "");
      setIsVerified(userInfo?.is_verified || "");
    };

    loadUserInfo();
  }, [getUserInfo]);

  // State to hold previous values
  const [prevValues, setPrevValues] = useState({
    name,
    address,
    email,
    contact,
  });

  const handleLogout = () => {
    // console.log("User logged out");
    setLogoutModalVisible(false);
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // console.log("Change password:", {
      //   currentPassword,
      //   newPassword,
      //   confirmPassword,
      // });
      setTimeout(() => {
        if (newPassword === confirmPassword && newPassword.length > 0) {
          // console.log("Password changed successfully!");
          resolve();
        } else {
          reject(new Error("Passwords do not match or are invalid."));
        }
      }, 2000);
    });
  };

  const pickImage = async () => {
    // Request permission to access the gallery
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Open the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setShowSaveConfirmation(true); // Show confirmation when trying to save
    }
    setIsEditing(!isEditing);
  };

  const confirmCancel = () => {
    cancelSave(); // Call the function to revert changes
    setCancelModalVisible(false);
    router.push("/(tabs)/profile");
  };

  const confirmSave = async () => {
    if (updateProfile) {
      const station_address =
        (await SecureStore.getItemAsync("station_address")) || "";
      try {
        const updatedUser = await updateProfile(
          name,
          address,
          contact,
          station_address
        );
        // console.log("Profile updated successfully:", updatedUser);
        setPrevValues({ name, address, email, contact }); // Update previous values
        setShowSaveConfirmation(false);
        setIsEditing(false);
        // You can show a success message or redirect the user if needed
      } catch (error) {
        console.error("Error updating profile:", error);
        // Handle the error (e.g., show an error message)
      }
    } else {
      console.error("updateProfile function is not available");
      // Handle the case when updateProfile is undefined
    }
  };

  const cancelSave = () => {
    // Revert to previous values
    setName(prevValues.name);
    setAddress(prevValues.address);
    setEmail(prevValues.email);
    setContact(prevValues.contact);
    setShowSaveConfirmation(false);
    setIsEditing(false); // Exit edit mode
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    const address: any = await getAddressFromCoordinates(
      location.latitude,
      location.longitude
    );
    // Convert coordinates to address if needed
    setAddress(address);
    setCoordinates(`${location.latitude}, ${location.longitude}`);
    setShowMapPicker(false); // Close the map picker
  };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CRISP/1.0.9 crisp.uccbscs@gmail.com", // Replace with your app name and contact email
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching address:", errorText);
        return null;
      }

      const data = await response.json();

      if (data && data.address) {
        // Try to extract all address components
        const {
          residential,
          road,
          neighbourhood,
          suburb,
          city_district,
          city,
          state_district,
          region,
          country,
          postcode,
        } = data.address;

        // Include all parts to form a full address
        const addressParts = [
          residential,
          road,
          neighbourhood,
          suburb,
          city_district,
          city,
          state_district,
          region,
          postcode,
          country,
        ].filter(Boolean); // filter out null/undefined values

        // Join all parts into a single string
        const address = addressParts.join(", ") || "Address not found";
        // console.log("Fetched address:", address);
        return address;
      } else {
        console.error("Nominatim API error:", data);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="w-full h-full flex-1 justify-start items-center absolute bg-[#0C3B2D] pt-9">
        <View className="flex flex-row h-auto w-full items-center justify-between px-6">
          <Text className="font-bold text-3xl text-white mt-3 mb-2">
            Account
          </Text>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
            <MaterialCommunityIcons
              name="logout"
              size={RFPercentage(4)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <ScrollView className="w-full h-full flex">
          <View className="flex flex-col w-full h-full items-center ">
            <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
              <Image
                source={{
                  uri:
                    selectedImage ||
                    "https://static.vecteezy.com/system/resources/thumbnails/020/911/740/small_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
                }}
                className="w-48 h-48 rounded-full border-4 border-white mb-8 mt-8 bg-white"
              />
            </TouchableOpacity>
            <View className="justify-center w-full items-center px-12 mt-6">
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Name:</Text>
              </View>
              <TextInput
                className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={name}
                editable={isEditing}
                onChangeText={setName}
                placeholderTextColor="#888"
                placeholder="Name"
              />
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">
                  Station Address:
                </Text>
              </View>
              <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                <TextInput
                  className="w-4/5 text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                  value={address}
                  editable={isEditing}
                  onChangeText={setAddress}
                  placeholderTextColor="#888"
                  placeholder="Address"
                />
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="white"
                />
                {isEditing && (
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
                )}
              </View>
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Email Address:</Text>
              </View>
              <TextInput
                className={`w-full text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D] ${
                  isEditing ? "bg-slate-300" : "bg-white"
                }`}
                value={email}
                editable={false}
                onChangeText={setEmail}
                placeholderTextColor="#888"
                placeholder="Email Address"
              />
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">Contact Number:</Text>
              </View>
              <TextInput
                className="w-full bg-white text-md px-4 py-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                value={contact}
                editable={isEditing}
                onChangeText={setContact}
                placeholderTextColor="#888"
                placeholder="Phone Number"
              />
              <View style={{ width: "100%", alignItems: "flex-start" }}>
                <Text className="text-md text-white mb-1">
                  Is User Verfied:
                </Text>
              </View>
              <View
                className={`w-full flex flex-row justify-between items-center bg-white mx-3 mb-4 rounded-lg ${
                  isEditing ? "bg-slate-300" : "bg-white"
                }`}
              >
                {!isVerified ? (
                  <>
                    {isPending ? (
                      <Text className="text-md p-4 font-bold text-[#0C3B2D]">
                        Verification is in Process..
                      </Text>
                    ) : (
                      <>
                        <Text className="text-md p-4 font-bold text-[#0C3B2D]">
                          Not Yet Verified
                        </Text>
                        <TouchableOpacity
                          className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg"
                          onPress={() => router.push("/pages/verifyPage")}
                        >
                          <Text className="text-white text-md font-normal">
                            Verify
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                ) : (
                  <Text className="text-md p-4 font-bold text-[#0C3B2D]">
                    Verified
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="mt-12 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
                onPress={toggleEdit}
              >
                <Text className="text-xl py-1 font-bold text-white">
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
              {isEditing && (
                <TouchableOpacity
                  className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                  onPress={() => setCancelModalVisible(true)}
                >
                  <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              {!isEditing && (
                <TouchableOpacity
                  className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                  onPress={() => setChangePasswordModalVisible(true)}
                >
                  <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                    Change Password
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className={"flex-col items-center mt-5"}>
              <TouchableOpacity
                onPress={() => {
                  setFullImageModalVisible(true);
                }}
              >
                <Text className={"text-white text-md font-bold mt-1"}>
                  Terms and Conditions
                </Text>
              </TouchableOpacity>
              <Text className={"text-slate-400 text-sm font-semibold mt-2"}>
                Version 1.6.5
              </Text>
            </View>
          </View>

          {/* Logout Confirmation Modal */}
          <LogoutModal
            visible={logoutModalVisible}
            onConfirm={handleLogout}
            onCancel={() => setLogoutModalVisible(false)}
          />

          {/* Change Password Modal */}
          <ChangePasswordModal
            visible={changePasswordModalVisible}
            onConfirm={handleChangePassword}
            onCancel={() => setChangePasswordModalVisible(false)}
          />

          {/* Save Confirmation Modal */}
          <SaveConfirmationModal
            visible={showSaveConfirmation}
            onConfirm={confirmSave}
            onCancel={cancelSave}
          />

          {/* Cancel Modal */}
          <CancelModal
            visible={cancelModalVisible}
            onConfirm={confirmCancel}
            onCancel={() => setCancelModalVisible(false)}
          />
          <TermsCondition
            fullImageModalVisible={fullImageModalVisible}
            setFullImageModalVisible={setFullImageModalVisible}
          />

          <View className="flex flex-row items-center">
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons
                name="format-align-justify"
                size={width * 0.2} // Responsive icon size
                color="#0C3B2D"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      {showMapPicker && (
        <View className="absolute top-0 left-0 right-0 bottom-10 justify-center items-center">
          <MapPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
          />
        </View>
      )}
    </ImageBackground>
  );
}
