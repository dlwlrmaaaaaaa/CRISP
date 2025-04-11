import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import FeedbackModal from "@/components/feedback";
import ReportValidationModal from "@/components/reportValidation";
const bgImage = require("@/assets/images/bgImage.png");
import { useAuth } from "@/AuthContext/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase/firebaseConfig";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
const { height, width } = Dimensions.get("window");
import uuid from "react-native-uuid";
import { useRouter } from "expo-router";

const db = getFirestore(app);

interface Report {
  id: string;
  user_id: number;
  username: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  report_date: string;
  location: string;
  status: string;
  is_validated: boolean;
  assigned_to_id: number;
}

export default function Reports() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const { USER_ID, USERNAME } = useAuth();
  const router = useRouter();
  const fetchAllDocuments = async () => {
    const categories = [
      "fire accident",
      "street light",
      "pothole",
      "flood",
      "others",
      "fallen tree",
      "road accident",
    ];

    // Fetch the supervisor_id asynchronously
    const supervisor_id = await SecureStore.getItemAsync("supervisor_id");
    if (!supervisor_id) {
      console.error("Supervisor ID not found!");
      return;
    }

    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        (snapshot) => {
          const reports: Report[] = snapshot.docs
            .map((doc) => {
              const data = doc.data() as Omit<Report, "id">; // Omit the id when fetching data

              // Filter out reports that don't match the supervisor_id
              if (data.assigned_to_id !== parseInt(supervisor_id)) {
                return null; // Mark as null for filtering later
              }

              return {
                id: doc.id, // Include the document ID (UUID)
                username: data.username || "", // Default to empty string if missing
                user_id: data.user_id,
                type_of_report: data.type_of_report || "",
                report_description: data.report_description || "",
                longitude: data.longitude || 0, // Default to 0 if missing
                latitude: data.latitude || 0, // Default to 0 if missing
                category: category, // Set the category based on the current loop
                image_path: data.image_path || "", // Default to empty string if missing
                report_date: data.report_date || "", // Default to empty string if missing
                location: data.location || "", // Default to empty string if missing
                status: data.status || "", // Default to empty string if missing
                is_validated: data.is_validated || false, // Default to false if missing
              };
            })
            .filter((report) => report !== null) as Report[]; // Remove null values

          // Sort reports by report_date in descending order
          const sortedReports = reports.sort((a, b) => {
            const dateA = new Date(a.report_date).getTime();
            const dateB = new Date(b.report_date).getTime();
            return dateB - dateA;
          });

          // Update the state with new sorted reports
          setReports((prevReports) => {
            const existingReports = prevReports.filter(
              (report) => report.category !== category
            );
            return [...existingReports, ...sortedReports]; // Replace old reports of this category
          });
        },
        (error) => {
          console.error(`Error fetching reports from ${category}:`, error);
        }
      );
    });

    // Return a cleanup function to unsubscribe from snapshots
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = await fetchAllDocuments();
      return unsubscribe; // Return the unsubscribe function for cleanup
    };

    fetchData().catch((error) => {
      console.error("Error in fetching documents:", error);
    });
  }, []);

  const loadReports = async () => {
    setRefreshing(true); // Start refreshing
    await fetchAllDocuments(); // Fetch the reports
    setRefreshing(false); // Stop refreshing
  };

  useEffect(() => {
    loadReports(); // Load reports on component mount
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status === "granted") {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log("Location permission denied");
        setLocationPermissionGranted(false);
        setRegion(null);
      }
    };

    const getCurrentLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    const checkFeedbackForReports = async () => {
      const feedbackCheckPromises = reports.map(async (report) => {
        const feedbackRef = doc(
          db,
          `reports/${report.category}/reports/${report.id}/workerFeedback/${USER_ID}`
        );
        const feedbackDoc = await getDoc(feedbackRef);
        return { id: report.id, exists: feedbackDoc.exists() };
      });

      try {
        const feedbackResults = await Promise.all(feedbackCheckPromises);
        const newFeedbackStatus: { [key: string]: boolean } =
          feedbackResults.reduce(
            (acc, { id, exists }) => {
              acc[id] = exists;
              return acc;
            },
            {} as { [key: string]: boolean }
          );
        setFeedbackStatus(newFeedbackStatus);
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };
    checkFeedbackForReports();
  }, [reports, USER_ID]);

  const handleCall = async (user_id: number, username: string) => {
    try {
      const callId = uuid.v4();
      //@ts-ignore
      const callRef = doc(db, "calls", callId);
      //@ts-ignore
      const userRef = doc(db, "users", String(user_id));
      const timestamp = Timestamp.now();

      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userStatus = userDoc.data();
        if (userStatus.callStatus === "in-call") {
          Alert.alert("The user is currently in another call.");
          console.log("The user is currently in another call.");
          return;
        }
        await updateDoc(userRef, {
          user_id,
          callId,
          caller_id: USER_ID,
          caller_name: USERNAME,
          callStatus: "calling",
          timestamp,
        });

        // Create the call record with the existing receiver
        await setDoc(callRef, {
          callId,
          caller_id: USER_ID, // Use Firebase Auth UID for caller
          offer: null,
          answer: null,
          callStatus: "calling",
          receiver_id: user_id,
          timestamp,
        });
      } else {
        await setDoc(userRef, {
          user_id,
          callId,
          caller_id: USER_ID,
          caller_name: USERNAME,
          callStatus: "calling",
          timestamp,
        });

        // Create the call record
        await setDoc(callRef, {
          callId,
          caller_id: USER_ID,
          offer: null,
          answer: null,
          callStatus: "calling",
          receiver_id: user_id,
          timestamp,
        });
      }

      // Navigate to the outgoing call screen
      router.push({
        pathname: "/calls/outgoing",
        params: { mode: "caller", callId, username, receiverId: user_id },
      });
    } catch (error) {
      console.error("Error during handleCall:", error);
    }
  };

  const renderItem = ({ item }: { item: Report }) => {
    const [datePart, timePart] = item.report_date.split("T");
    const formattedDate = datePart.replace(/-/g, "/");
    const formattedTime = timePart.split(".")[0];
    const feedbackExists = feedbackStatus[item.id] || false;

    return (
      <View className="w-full px-3">
        <View className="bg-white w-full rounded-[20px] border-2 border-[#0C3B2D] p-4 my-2 mb-4">
          <View className="flex flex-row w-full items-center">
            <MaterialCommunityIcons
              name="account-circle"
              size={RFPercentage(5)}
              style={{ padding: 5, color: "#0C3B2D" }}
            />
            <View className="flex flex-row w-full justify-between items-start">
              <View className="flex flex-col items-start ">
                <Text className="pl-3 text-md font-bold">
                  {item.username.length > 18
                    ? item.username.slice(0, 18) + "..."
                    : item.username}
                </Text>

                <Text className="pl-3 text-xs font-bold text-slate-500">
                  {formattedDate} {"\n"}
                  <Text className="text-xs font-normal text-slate-500">
                    {formattedTime}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalMessage(
                    `The Report is: ${item.is_validated ? "VALIDATED" : "NOT VALIDATED"}`
                  );
                  setIsSuccess(false);
                  setIsModalVisible(true);
                }}
              >
                <View
                  className={`w-8 h-8 border rounded-full mt-2 ${
                    item.is_validated === null ||
                    item.is_validated === undefined
                      ? "bg-gray-400" // Default gray if no status
                      : item.is_validated
                        ? "bg-green-500" // Amber for pending
                        : "bg-red-500" // Red for invalid or failed
                  }`}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalMessage(
                    `Status of the Report is: ${item.status.toUpperCase()}`
                  );
                  setIsSuccess(false);
                  setIsModalVisible(true);
                }}
              >
                <View
                  className={`w-8 h-8 border rounded-full mt-2 mr-16 ${
                    item.status === "Pending"
                      ? "bg-yellow-400" // Amber for pending
                      : item.status === "Ongoing"
                        ? "bg-blue-500" // Blue for ongoing
                        : item.status === "Under Review"
                          ? "bg-orange-500" // Orange for pending review
                          : item.status === "done"
                            ? "bg-green-500" // Green for done
                            : "bg-gray-400" // Default gray if no status
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedReport(item);
              setModalVisible(true);
            }}
            className="w-full flex flex-row mt-2"
          >
            <Text className="text-md text-left pr-2 font-semibold text-slate-500">
              Location:
              <Text className="text-md font-normal text-black ml-2">
                {" " + item.location}
              </Text>
            </Text>
          </TouchableOpacity>
          <View className="w-full flex flex-row">
            <Text className="text-md text-left pr-2 font-semibold text-slate-500">
              Type of Report:
              <Text className="text-md font-normal text-black ml-2">
                {" " + item.type_of_report}
              </Text>
            </Text>
          </View>
          <View className="w-full flex flex-row">
            <Text className="text-md text-left pr-2 font-semibold text-slate-500">
              Description:
              <Text className="text-md font-normal text-black ml-2">
                {" " + item.report_description}
              </Text>
            </Text>
          </View>
          {item.image_path ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(item.image_path);
                setFullImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item.image_path }}
                className="w-full h-72 rounded-lg my-1 border-2 border-[#0C3B2D]"
              />
            </TouchableOpacity>
          ) : null}
          <View className="flex flex-row justify-end w-full mt-3">
            <View className="flex flex-row items-center">
              {/* Call User Button */}
              <TouchableOpacity
                className={`bg-[#134c3b] p-2 rounded-md h-auto items-center justify-center mr-2 ${
                  item.status === "Under Review" ? "opacity-50" : ""
                }`}
                onPress={() => handleCall(item.user_id, item.username)}
                disabled={item.status === "Under Review"} // Disable if status is "Under Review"
              >
                <Text className="text-xs font-extrabold text-white px-3">
                  Call User
                </Text>
              </TouchableOpacity>

              {/* Disregard Button */}
              <TouchableOpacity
                className={`bg-[#134c3b] p-2 rounded-md h-auto items-center justify-center mr-2 ${
                  item.status === "Under Review" ? "opacity-50" : ""
                }`}
                // onPress={() => handleDisregard(item.id)} // Replace with your disregard handler
                disabled={item.status === "Under Review"} // Disable if status is "Under Review"
              >
                <Text className="text-xs font-extrabold text-white px-3">
                  False
                </Text>
              </TouchableOpacity>

              {/* Done Button */}
              <TouchableOpacity
                className={`bg-[#0C3B2D] p-2 rounded-md h-auto items-center justify-center ${
                  feedbackExists ? "opacity-50" : ""
                }`}
                onPress={() => {
                  if (feedbackExists) {
                    // If feedback exists, show the modal message
                    setModalMessage(
                      `The Report is already marked as ${item.status.toUpperCase()}`
                    );
                    setIsSuccess(false);
                    setIsModalVisible(true);
                  } else {
                    // If feedback doesn't exist, show the feedback modal
                    setFeedbackModalVisible(true);
                    setSelectedReport(item);
                  }
                }}
                disabled={feedbackExists} // Disable button if feedback exists
              >
                <Text className="text-xs font-extrabold text-white px-3">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 w-full">
        <View className="flex flex-row h-auto w-full items-center justify-between px-8">
          <Text className="font-bold text-3xl text-white mt-3 mb-2">
            Reports
          </Text>
          <TouchableOpacity onPress={() => router.push("/pages/notification")}>
            <MaterialCommunityIcons
              name="bell"
              size={RFPercentage(3.5)}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={reports}
          keyExtractor={(item, index) => `${item.id}-${index}}`}
          className="w-full h-auto flex p-4"
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Control refreshing state
              onRefresh={loadReports} // Trigger loadReports on refresh
            />
          }
          ListFooterComponent={
            <Text
              style={{ padding: 45, color: "white", textAlign: "center" }}
            ></Text>
          }
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
                    width: width * 0.9,
                    height: height * 0.55,
                    borderRadius: 10,
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={{
                    width: width * 0.9,
                    height: height * 0.55,
                    backgroundColor: "white",
                    borderRadius: 10,
                  }}
                >
                  {selectedReport && (
                    <MapView
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                      }}
                      initialRegion={{
                        latitude: selectedReport.latitude,
                        longitude: selectedReport.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={userLocation}
                        title={"You are here"}
                        pinColor="blue"
                      />
                      <Marker
                        coordinate={{
                          latitude: selectedReport.latitude,
                          longitude: selectedReport.longitude,
                        }}
                        title={selectedReport.type_of_report}
                      />
                    </MapView>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)} // Hide modal
          reportId={selectedReport?.id || ""} // Pass the selected report ID
          category={selectedReport?.category || ""} // Pass the report category
          userId={USER_ID || ""} // Pass the USER_ID (this should be the actual user's ID)
        />

        <ReportValidationModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onConfirmValidation={() => setIsModalVisible(false)}
          isSuccess={isSuccess}
          modalMessage={modalMessage}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
