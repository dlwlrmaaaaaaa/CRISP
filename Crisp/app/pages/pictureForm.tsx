import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ImageBackground,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CancelModal from "@/components/cancelModal";
import ImageModal from "@/components/imageModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const bgImage = require("@/assets/images/bgImage.png");
import MapPicker from "@/components/mapPicker";
import * as SecureStore from "expo-secure-store";
import LoadingButton from "@/components/loadingButton";
import { useAuth } from "@/AuthContext/AuthContext";
import * as Location from "expo-location"; // Import Location
import * as Notifications from "expo-notifications";
import { scheduleNotification } from "../utils/notifications";
import { Report } from "../utils/reports";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import api from "../api/axios";
const { width, height } = Dimensions.get("window");
const db = getFirestore(app);

export default function PictureForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState<string | null>(null);
  const [customType, setCustomType] = useState<string>("");
  const [floorNumber, setFloorNumber] = useState<string>("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isFetch, setFetch] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<string>("");
  const [missingFieldsModalVisible, setMissingFieldsModalVisible] =
    useState(false);
  const [missingFieldsMessage, setMissingFieldsMessage] = useState("");
  const { createReport, isDone, setIsDone } = useAuth();

  const report = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (
        !location ||
        !coordinates ||
        !selectedItem ||
        !description ||
        !imageUri
      ) {
        setMissingFieldsMessage("Please fill in all required fields.");
        setMissingFieldsModalVisible(true);
        console.log("Missing fields:");

        // Check and log which fields are missing
        if (!location) console.log("Location is missing.");
        if (!coordinates) console.log("Coordinates are missing.");
        if (!selectedItem) console.log("Selected item is missing.");
        if (!description) console.log("Description is missing.");
        if (!imageUri) console.log("Image URI is missing.");

        setLoading(false);
        return;
      }

      const [latitude, longitude] = coordinates.split(",");
      const is_emergency =
        isEmergency?.toLowerCase() === "yes" ? "emergency" : "not emergency";
      const user_id = await SecureStore.getItemAsync("user_id");
      if (!user_id) {
        console.error("USER_ID is missing!");
        return;
      }

      if (createReport) {
        try {
          const res = await createReport(
            selectedItem,
            description,
            longitude,
            latitude,
            is_emergency,
            imageUri,
            customType,
            floorNumber,
            location
          );

          if (res) {
            handleReportSuccess(user_id, selectedItem);
          }
        } catch (error: any) {
          if (
            error?.response?.data?.detail ===
            "You've already reported or verified this incident."
          ) {
            setLoading(false);
            const existingReport = error?.response?.data?.existing_report;
            Alert.alert(
              "Duplicate Report Detected",
              `A similar report already exists at ${location}. Type: ${existingReport.type_of_report}, Description: ${existingReport.report_description}, Reported on: ${existingReport.report_date}.`
            );
          } else if (
            error?.response?.data?.detail === "A similar report already exists."
          ) {
            const existingReport = error?.response?.data?.existing_report;
            const formData = new FormData();
            formData.append("type_of_report", selectedItem);
            formData.append("report_description", description);
            formData.append("longitude", longitude);
            formData.append("latitude", latitude);
            formData.append("is_emergency", is_emergency);
            formData.append("image_path", imageUri);
            formData.append("custom_type", customType);
            formData.append("floor_number", floorNumber);
            formData.append("location", location);
            await handleDuplicateReport(existingReport, formData);
          } else {
            setLoading(false);
            const errorMessage =
              error?.message ||
              "An unexpected error occurred. Please try again.";
            console.error("Error creating report:", errorMessage);
            alert(errorMessage);
          }
        }
      } else {
        console.error("createReport function is not defined");
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      console.error("Error creating report:", errorMessage);
      alert(errorMessage);
    }
  };

  const handleReportSuccess = async (user_id: string, selectedItem: string) => {
    scheduleNotification(
      "Your Report Has Been Submitted!",
      `Thank you for caring! Your report about the ${selectedItem} has been submitted.`,
      1,
      "/(tabs)/manage"
    );

    // Firestore operations (async)
    await Promise.all([
      addDoc(collection(db, "notifications"), {
        userId: user_id,
        title: "Your Report Has Been Submitted!",
        description: `Thank you for caring! Your report about the ${selectedItem} has been submitted.`,
        screen: "/(tabs)/manage",
        createdAt: new Date(),
      }),
      addDoc(collection(db, "notifications"), {
        title: `Citizen has submitted a report for ${selectedItem}`,
        description: `A citizen has submitted a report for ${selectedItem}. Please take action.`,
        for_superadmin: true,
        createdAt: new Date(),
        user_id: user_id,
      }),
    ]);
    setLoading(false);
    setSuccessModalVisible(true);
  };

  const handleDuplicateReport = async (existingReport: any, formData: any) => {
    const { location, type_of_report, report_description, report_date } =
      existingReport;

    return new Promise((resolve, reject) => {
      Alert.alert(
        "Duplicate Report Detected",
        `A similar report already exists at ${location}. Would you like to proceed? Your submission will verify the existing report and increase its count by 1.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => reject(new Error("Report submission canceled.")),
          },
          {
            text: "Submit Anyway",
            onPress: async () => {
              // Append the flag for force submit
              formData.append("force_submit", "true");

              try {
                // Perform the retry API request
                const retryRes = await api.post(
                  "api/create-report/",
                  formData,
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                // Retrieve user ID from SecureStore
                const user_id = await SecureStore.getItemAsync("user_id");
                if (!user_id) {
                  console.error("USER_ID is missing!");
                  return reject(new Error("User ID is missing!"));
                }

                // Ensure selectedItem is available
                if (!selectedItem) {
                  console.error("selectedItem is missing!");
                  return reject(new Error("Selected item is missing!"));
                }

                // Handle report success
                handleReportSuccess(user_id, selectedItem);

                // Resolve the promise with the response from the retry API call
                resolve(retryRes);
              } catch (retryError: any) {
                // Reject if the retry request fails
                reject(
                  new Error(
                    `An error occurred during forced submission: ${retryError.message}`
                  )
                );
              }
            },
          },
        ]
      );
    });
  };

  const fetchData = async () => {
    try {
      const [uri, locations, coordinates, report_type, isEmergency] =
        await Promise.all([
          SecureStore.getItemAsync("imageUri"),
          SecureStore.getItemAsync("currentLocation"),
          SecureStore.getItemAsync("coordinates"),
          SecureStore.getItemAsync("report_type"),
          SecureStore.getItemAsync("isEmergency"),
        ]);
      setIsEmergency(isEmergency);
      setSelectedItem(report_type);
      setLocation(locations);
      setCoordinates(coordinates as string);
      setImageUri(uri);
      setFetch(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setSelectedItem(null);
    fetchData();
  }, []);

  const confirmCancel = async () => {
    setCancelModalVisible(false);
  };

  // Function to convert coordinates to address

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust based on your header size
        >
          <ScrollView className="w-full h-full flex p-6">
            <Text className="font-bold text-3xl text-white mt-3 mb-3 ml-4">
              Make a Report
            </Text>
            <View className="justify-center items-center px-3 mt-3">
              <View className="w-full h-auto">
                {imageUri ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(imageUri);
                      setFullImageModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
                    />
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: "https://via.placeholder.com/150" }}
                    className="w-full h-60 rounded-lg my-4 border border-[#8BC34A]"
                  />
                )}
              </View>
              <View className="w-full flex flex-row">
                <Text className="text-md font-semibold text-white mb-1">
                  Location
                </Text>
                <Text className="text-md font-semibold text-red-400 ml-1">
                  *
                </Text>
              </View>
              <View className="w-full bg-white mb-2 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                <TextInput
                  className="w-full text-md px-4 py-3 text-[#0C3B2D] font-semibold items-center justify-center"
                  placeholderTextColor="#888"
                  placeholder="Location"
                  value={location || ""}
                  editable={false} // Make it read-only
                />
              </View>

              <View className="w-full flex flex-row">
                <Text className="text-md font-semibold text-white mb-1">
                  Type of Report
                </Text>
                <Text className="text-md font-semibold text-red-400 ml-1">
                  *
                </Text>
              </View>
              <TextInput
                className="w-full bg-white px-4 py-3 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                value={selectedItem || ""}
                editable={false}
              />

              {/* Conditionally render TextInput if "Other" is selected */}
              {selectedItem === "Others" && (
                <>
                  <View className="w-full flex flex-row">
                    <Text className="text-md font-semibold text-white mb-1">
                      Specify the Type of Report (Optional)
                    </Text>
                  </View>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                    placeholder="Please specify..."
                    placeholderTextColor={"#888"}
                    value={customType}
                    onChangeText={setCustomType}
                  />
                </>
              )}
              <View className="w-full flex flex-row">
                <Text className="text-md font-semibold text-white mb-1">
                  If in a Building Specify the Floor Number (Optional)
                </Text>
              </View>
              <TextInput
                className="w-full bg-white px-4 py-3 rounded-lg mb-4 border border-[#0C3B2D] justify-center text-md text-[#0C3B2D] font-semibold"
                placeholder="Please specify..."
                placeholderTextColor={"#888"}
                value={floorNumber}
                onChangeText={setFloorNumber}
                keyboardType="numeric"
              />
              <View className="w-full flex flex-row">
                <Text className="text-md font-semibold text-white mb-1">
                  Description
                </Text>
                <Text className="text-md font-semibold text-red-400 ml-1">
                  *
                </Text>
              </View>
              <TextInput
                className="w-full bg-white text-md px-4 py-4 rounded-lg items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                placeholderTextColor="#888"
                placeholder="Description"
                multiline={true}
                scrollEnabled={true}
                style={{
                  maxHeight: 150,
                  height: 150,
                  textAlignVertical: "top",
                }}
                onChangeText={setDescription}
              />
              <LoadingButton
                style="mt-5 w-full bg-[#0C3B2D] rounded-xl p-2 shadow-lg justify-center items-center border-2 border-[#8BC34A]"
                title="Submit Report"
                onPress={report}
                loading={loading}
              />

              <TouchableOpacity
                className="mt-3 w-full bg-[#8BC34A] rounded-xl p-2 shadow-lg justify-center items-center"
                onPress={() => {
                  setCancelModalVisible(true);
                }}
              >
                <Text className="text-xl py-1 font-bold text-[#0C3B2D]">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-xl py-1 font-bold text-[#0C3B2D]">.</Text>
            </View>
          </ScrollView>

          <Modal
            visible={successModalVisible}
            transparent={true}
            animationType="fade"
          >
            <TouchableWithoutFeedback
              onPress={() => setSuccessModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                  <View className="full p-3 bg-white rounded-xl items-start">
                    <Text className="text-xl font-bold text-[#0C3B2D] mb-5 ">
                      Report has been created successfully!
                    </Text>
                    <View className="flex flex-row justify-end mt-3 w-full ">
                      <TouchableOpacity
                        className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                        onPress={() => {
                          setSuccessModalVisible(false);
                          router.push("/(tabs)/reports");
                        }} // Close the modal here
                      >
                        <Text className="text-md font-semibold text-white px-4">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {/* // Add this new modal component for missing fields */}
          <Modal
            visible={missingFieldsModalVisible}
            transparent={true}
            animationType="fade"
          >
            <TouchableWithoutFeedback
              onPress={() => setMissingFieldsModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                  <Text className="text-xl font-bold text-[#0C3B2D] mb-5  px-3">
                    Some fields are missing!
                  </Text>
                  <Text className="text-md text-[#0C3B2D] mb-10  px-3">
                    {missingFieldsMessage}
                  </Text>
                  <View className="flex flex-row justify-end mt-3 w-full  px-3">
                    <TouchableOpacity
                      className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                      onPress={() => {
                        setMissingFieldsModalVisible(false);
                        setLoading(false);
                      }}
                    >
                      <Text className="text-md font-semibold text-white px-4">
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <ImageModal
            fullImageModalVisible={fullImageModalVisible}
            setFullImageModalVisible={setFullImageModalVisible}
            selectedImage={selectedImage}
          />

          {/* Cancel Modal */}
          <CancelModal
            visible={cancelModalVisible}
            onConfirm={confirmCancel}
            onCancel={() => setCancelModalVisible(false)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
