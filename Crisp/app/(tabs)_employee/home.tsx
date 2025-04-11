import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import {
  View,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { RFPercentage } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useQuery } from "@tanstack/react-query";
import { app } from "@/firebase/firebaseConfig";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");
const db = getFirestore(app);
const storage = getStorage();

interface Report {
  id: string;
  username: string;
  type_of_report: string;
  longitude: number;
  latitude: number;
  category: string;
  report_description: string;
  image_path: string;
  report_date: string;
  custom_type: string;
  floor_number: string;
  is_validated: boolean;
  assigned_to_id: number;
}
interface Location {
  latitude: number;
  longitude: number;
}
interface deptAdmin {
  id: string;
  department: string;
  station: string;
  longitude: number;
  latitude: number;
}

const fetchDocuments = async () => {
  const querySnapshot = await getDocs(collection(db, "reports"));
  const reports = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Report, "id">),
  }));
  // console.log("Fetched reports:", reports); // Log the fetched reports
  return reports;
};

export default function Home() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [altitude, setAltitude] = useState<any | null>(null);
  const [estimatedFloor, setEstimatedFloor] = useState<any | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null); // Add a ref to the MapView
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [deptAdmins, setDeptAdmins] = useState<deptAdmin[]>([]);

  const fetchAllDocuments = async () => {
    const categories = [
      "fire accident",
      "street light",
      "pothole",
      "flood",
      "others",
      "fallen trees",
      "road incident",
    ];
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
                id: doc.id, // Include the document ID this is an UUID
                username: data.username || "", // Default to empty string if missing
                type_of_report: data.type_of_report || "",
                report_description: data.report_description || "",
                longitude: data.longitude || 0, // Default to 0 if missing
                latitude: data.latitude || 0, // Default to 0 if missing
                category: category, // Set the category based on the current loop
                image_path: data.image_path || "", // Default to empty string if missing
                report_date: data.report_date || "", // Default to empty string if missing
                custom_type: data.custom_type || "",
                floor_number: data.floor_number || "",
                is_validated: data.is_validated,
              };
            })
            .filter((report) => report !== null) as Report[];

          const sortedReports = reports.sort((a, b) => {
            const dateA = new Date(a.report_date).getTime();
            const dateB = new Date(b.report_date).getTime();
            return dateB - dateA;
          });
          // console.log(`Fetched Reports from ${category}:`, sortedReports);
          // Update the reports state with new reports from this category
          setReports((prevReports) => {
            const existingReports = prevReports.filter(
              (report) => report.category !== category
            );
            return [...existingReports, ...sortedReports]; // Replace old reports of this category and add the sorted new ones
          });
        },
        (error) => {
          console.error(`Error fetching reports from ${category}:`, error);
        }
      );
    });
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

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      // console.log("Location permission status:", status);

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
        // Request location and altitude
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude, altitude } = location.coords; // Destructure latitude, longitude, and altitude

        // Set the user location with latitude and longitude
        setUserLocation({ latitude, longitude });

        // Set the map region
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Fetch weather data based on the location
        fetchCurrentWeather(latitude, longitude);

        // Check if altitude is available (not null)
        const floorHeight = 3; // average height per floor in meters
        const estimatedFloor =
          altitude !== null ? Math.round(altitude / floorHeight) : null; // If altitude is null, estimatedFloor is also null

        // console.log(`Estimated Floor: ${estimatedFloor}`); // Log the estimated floor

        // Optionally update state with altitude and estimated floor
        setAltitude(altitude); // Set altitude state if needed
        setEstimatedFloor(estimatedFloor); // Assuming you have a state for the estimated floor
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    const fetchCurrentWeather = async (lat: number, lon: number) => {
      const params = {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        timezone: "Asia/Manila",
      };

      const url = "https://api.open-meteo.com/v1/forecast";

      try {
        const response = await axios.get(url, { params });
        const currentWeather = response.data.current_weather;

        setCurrentWeather(currentWeather);
      } catch (error) {
        console.error("Error fetching current weather data:", error);
      }
    };

    requestLocationPermission();
  }, []);

  const fetchDeptAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "deptAdmin")); // Adjust the collection name if necessary
      const admins: deptAdmin[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<deptAdmin, "id">),
      }));
      setDeptAdmins(admins);
      // console.log("Fetched department admins:", admins); // Log the fetched admins
    } catch (error) {
      console.error("Error fetching department admins:", error);
    }
  };

  useEffect(() => {
    fetchDeptAdmins();
  }, []);

  const haversineDistance = (
    userLocation: Location,
    selectedReport: Report
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const lat1 = toRad(userLocation.latitude);
    const lon1 = toRad(userLocation.longitude);
    const lat2 = toRad(selectedReport.latitude);
    const lon2 = toRad(selectedReport.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371000; // Earth's radius in meters
    return radius * c; // Distance in meters
  };

  const getWeatherDescription = (code: number) => {
    const weatherConditions: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Drizzle: Light",
      53: "Drizzle: Moderate",
      61: "Rain: Slight",
      63: "Rain: Moderate",
      65: "Rain: Heavy intensity",
      80: "Rain showers: Slight",
      81: "Rain showers: Moderate",
      95: "Thunderstorm",
    };

    return weatherConditions[code] || "Unknown weather condition";
  };

  const getWeatherImage = (code: number) => {
    const weatherConditions: { [key: number]: { image: any } } = {
      0: { image: require("../../assets/images/weather/clear-sky.jpg") },
      1: { image: require("../../assets/images/weather/clear-sky.jpg") },
      2: { image: require("../../assets/images/weather/partly-cloudy.jpg") },
      3: { image: require("../../assets/images/weather/overcast.jpg") },
      45: { image: require("../../assets/images/weather/fog.jpg") },
      48: {
        image: require("../../assets/images/weather/depositing-rime-fog.jpg"),
      },
      51: { image: require("../../assets/images/weather/drizzle-light.jpg") },
      53: {
        image: require("../../assets/images/weather/drizzle-moderate.jpg"),
      },
      61: {
        image: require("../../assets/images/weather/rain-slight.jpg"),
      },
      63: { image: require("../../assets/images/weather/rain-moderate.jpg") },
      65: { image: require("../../assets/images/weather/rain-heavy.jpg") },
      80: { image: require("../../assets/images/weather/rain-slight.jpg") },
      81: { image: require("../../assets/images/weather/rain-moderate.jpg") },
      95: { image: require("../../assets/images/weather/thunderstorm.jpg") },
    };

    return weatherConditions[code] && weatherConditions[code].image;
  };

  const getLocalDay = () => {
    const optionsDay: Intl.DateTimeFormatOptions = { weekday: "long" }; // Correct type
    return new Date().toLocaleDateString("en-PH", optionsDay);
  };

  const getLocalMonthAndDay = () => {
    const optionsMonthDay: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
    }; // Correct type
    return new Date().toLocaleDateString("en-PH", optionsMonthDay);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: region?.latitudeDelta || 0.01,
        longitudeDelta: region?.longitudeDelta || 0.01,
      };

      // console.log("Centering on user location:", newRegion); // Debugging ayaw magitna nung location
      mapRef.current?.animateToRegion(newRegion, 1000); // Animate to the new region
    } else {
      console.error("User location is not available"); // Debugging line ulet
    }
  };
  return (
    <View className="h-full w-full flex-1 absolute">
      {!locationPermissionGranted || region === null ? (
        <View className="flex-1 justify-center items-center absolute">
          <Text className="text-4xl font-semibold">
            Turn your location services on to see the map.
          </Text>
        </View>
      ) : (
        <View className="w-full h-full flex-1 absolute">
          <MapView ref={mapRef} className="flex-1" region={region}>
            <Marker
              coordinate={region}
              title={"You are here"}
              pinColor="blue"
            />

            {reports.map((item, index) => (
              <Marker
                key={`${item.id}-${index}`}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                pinColor={item.is_validated ? "green" : "red"}
              >
                <Callout
                  onPress={() => {
                    setSelectedReport(item);
                    setModalVisible(true);
                  }}
                >
                  <View className="w-auto justify-center items-center">
                    <Text className="font-bold text-sm">
                      {" " + item.type_of_report}
                      {item.custom_type && item.custom_type.length > 0 && (
                        <Text>{", " + item.custom_type}</Text>
                      )}
                    </Text>

                    <Text className="text-xs text-slate-600 mt-1">
                      Distance:{" "}
                      {userLocation
                        ? (() => {
                            const distance = haversineDistance(
                              userLocation,
                              item
                            );
                            return distance > 1000
                              ? `${(distance / 1000).toFixed(2)} km` // Convert to kilometers
                              : `${distance.toFixed(2)} m`; // Keep in meters
                          })()
                        : "Calculating..."}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-1">
                      More Info
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}

            {deptAdmins.map((item, index) => (
              <Marker
                key={`${item.id}-${index}`}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                pinColor={"blue"}
              >
                <Callout>
                  <View className="w-auto justify-center items-center">
                    <Text className="font-extrabold text-sm">
                      {" " + item.department}
                    </Text>
                    <Text className="font-bold text-xs">
                      {" " + item.station}
                    </Text>

                    <Text className="text-xs text-slate-600 mt-1">
                      Distance:{" "}
                      {userLocation
                        ? (() => {
                            const distance = haversineDistance(
                              userLocation,
                              item
                            );
                            return distance > 1000
                              ? `${(distance / 1000).toFixed(2)} km` // Convert to kilometers
                              : `${distance.toFixed(2)} m`; // Keep in meters
                          })()
                        : "Calculating..."}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <TouchableOpacity
            className="absolute bottom-28 right-5 bg-[#0C3B2D] rounded-full p-2 shadow-lg"
            onPress={centerOnUserLocation}
          >
            <Icon
              name="crosshairs-gps"
              size={RFPercentage(4)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      )}
      {currentWeather && (
        <SafeAreaView className="bg-white w-full absolute p-0 flex-row rounded-b-3xl border-[#0C3B2D] border-4 border-t-0">
          <View className="flex-1 items-start justify-center p-5 ml-4">
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-extrabold text-2xl">
                {getLocalDay()}
              </Text>
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-semibold text-lg mb-2">
                {getLocalMonthAndDay()}
              </Text>
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-extrabold text-4xl">
                {`${currentWeather.temperature}°C`}
              </Text>
            </View>
          </View>
          <View className="flex-1 items-center justify-center p-3 ">
            <View className="items-start justify-start">
              <Image
                source={getWeatherImage(currentWeather.weathercode)}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-semibold text-lg">
                {getWeatherDescription(currentWeather.weathercode)}
              </Text>
            </View>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View className="flex-1 justify-center items-center bg-black/50">
                {selectedReport && (
                  <>
                    <View className="w-4/5 p-5 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
                      <View className="w-full flex flex-row">
                        <View className="flex flex-col items-start">
                          <Text className="text-xl font-bold">
                            {selectedReport.username}
                          </Text>

                          {/* Format and display the date and time */}
                          {selectedReport.report_date && (
                            <View className="flex flex-row">
                              <Text className="text-md font-bold text-slate-500">
                                {selectedReport.report_date
                                  .split("T")[0]
                                  .replace(/-/g, "/")}
                              </Text>
                              <Text className="ml-2 text-md font-bold text-slate-500">
                                {
                                  selectedReport.report_date
                                    .split("T")[1]
                                    .split(".")[0]
                                }
                              </Text>
                            </View>
                          )}
                          <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                            Type of Report:
                            <Text className="text-lg font-normal text-black ml-2">
                              {" " + selectedReport.type_of_report}
                              {selectedReport.custom_type &&
                                selectedReport.custom_type.length > 0 && (
                                  <Text className="text-lg font-normal text-black ml-2">
                                    {", " + selectedReport.custom_type}
                                  </Text>
                                )}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {selectedReport.floor_number ? (
                        <View className="w-full flex flex-row">
                          <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                            Floor Number:
                            <Text className="text-lg font-normal text-black ml-2">
                              {" " + selectedReport.floor_number}
                            </Text>
                          </Text>
                        </View>
                      ) : null}
                      <View className="w-full flex flex-row mb-3">
                        <Text className="text-lg text-left pr-2 font-semibold text-slate-500">
                          Description:
                          <Text className="text-lg font-normal text-black ml-2">
                            {" " + selectedReport.report_description}
                          </Text>
                        </Text>
                      </View>
                      {selectedReport.image_path && (
                        <Image
                          source={{ uri: selectedReport.image_path }}
                          className="w-full h-72 rounded-lg my-1 border-2 border-[#0C3B2D]"
                        />
                      )}
                    </View>
                    <Text style={{ padding: 10, color: "white" }}>
                      Report has{" "}
                      {selectedReport.is_validated
                        ? "been Validated"
                        : "Not yet been Validated"}
                    </Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      )}
    </View>
  );
}
