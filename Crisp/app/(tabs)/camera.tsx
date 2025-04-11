import React, { useEffect, useState } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import axios from "axios";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import SosPage from "@/components/sosPage";
import { getAddressFromCoordinates } from "../utils/convertCoordinatesToAddress";

// Get screen dimensions
const { height, width } = Dimensions.get("window");

interface Prediction {
  class: string;
  class_id: number;
  confidence: number;
}

export default function CameraComp() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [emergencyCall, setEmergencyCall] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);
  const { isDone, setIsDone } = useAuth();
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  useEffect(() => {
    const permissionCheck = async () => {
      const is_verified = await SecureStore.getItemAsync("is_verified");
      if (is_verified === "false") {
        router.push("/(tabs)/home");
      }
    };
    permissionCheck();
  }, []);

  // Inside your component
  useEffect(() => {
    console.log("Checking location permission...");
    const fetchLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
    };

    fetchLocationPermission();
  }, []);
  useEffect(() => {
    const reset = async () => {
      await Promise.all([
        SecureStore.getItemAsync("imageUri"),
        SecureStore.getItemAsync("currentLocation"),
        SecureStore.getItemAsync("coordinates"),
        SecureStore.getItemAsync("report_type"),
        SecureStore.getItemAsync("isEmergency"),
      ]);
    };
    reset();
  }, []);
  useEffect(() => {
    // console.log("Location permission granted:", locationPermissionGranted);
    const getCurrentLocation = async () => {
      if (!locationPermissionGranted) return;

      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // console.log(`Current location: ${latitude}, ${longitude}`);

        // Await the address fetching
        const address = await getAddressFromCoordinates(latitude, longitude);
        // console.log("Fetched address:", address);
        // console.log("Fetched lat and long:", latitude, longitude);

        // Store the current location as a string
        await SecureStore.setItemAsync("currentLocation", `${address}`);
        if (!latitude || !longitude) {
          return;
        }
        await SecureStore.setItemAsync(
          "coordinates",
          `${latitude}, ${longitude}`
        );
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getCurrentLocation();
  }, [locationPermissionGranted]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <Text className="items-center justify-center text-2xl font-bold">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    const totalStartTime = Date.now();

    try {
      const startCapt = Date.now();
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: true,
      });
      const endCapt = Date.now();
      console.log(`Photo capture took ${endCapt - startCapt} ms`);

      if (!photo?.uri) {
        console.error("Photo capturing failed: photo is undefined.");
        Alert.alert("Error capturing photo. Please try again.");
        return;
      }

      const startResize = Date.now();
      const optimizedUri = await resizeImage(photo.uri);
      const endResize = Date.now();
      console.log(`Image resizing took ${endResize - startResize} ms`);

      const classificationResult = await classifyImage(optimizedUri);

      await storeClassificationResults(photo.uri, classificationResult);
      router.push("/pages/pictureForm");

      setIsDone(true);
    } catch (error: any) {
      console.error("Error capturing photo:", error.message);
      Alert.alert(error.message);
    } finally {
      setLoading(false);
      const totalEndTime = Date.now();
      console.log(
        `capturePhoto completed in ${totalEndTime - totalStartTime} ms`
      );
    }
  };

  const resizeImage = async (uri: string): Promise<string> => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 224, height: 224 } }],
        {
          compress: 0.6,
          format: SaveFormat.WEBP,
        }
      );
      return result.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri; // Return original URI as a fallback
    }
  };

  const classifyImage = async (
    uri: string
  ): Promise<{ class: string; isEmergency: string }> => {
    try {
      const file = {
        uri: uri,
        name: `img_${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      const formData = new FormData();
      formData.append("image", file as any);

      const apiStart = Date.now();
      const { data } = await axios.post(
        Constants.expoConfig?.extra?.ROBOFLOW_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
      console.log(data);
      const apiEnd = Date.now();
      console.log(`API call took ${apiEnd - apiStart} ms`);

      if (data.class === "Nudity") {
        Alert.alert("Warning", "Nudity detected. Operation cannot proceed.");
        throw new Error("Nudity detected, stopping process.");
        
      }

      const isEmergency = (() => {
        return [
          "Fire Accident",
          "Flood",
          "Road Accident",
          "Graphic Violence",
          "Fallen Tree",
        ].includes(data.class)
          ? "Yes"
          : "No";
      })();

      const classification = { class: data.class, isEmergency };
      console.log("Classification:", classification);
      return classification;
    } catch (error: any){
        throw error
    }
  };

  const storeClassificationResults = async (
    imageUri: string,
    classificationResult: any
  ) => {
    try {
      await SecureStore.setItemAsync(
        "isEmergency",
        classificationResult.isEmergency
      );
      await SecureStore.setItemAsync("imageUri", imageUri);
      await SecureStore.setItemAsync("report_type", classificationResult.class);
    } catch (error) {
      console.error("Error storing classification results:", error);
      Alert.alert("Error storing results. Please try again.");
    }
  };

  return (
    <View className="w-full h-full flex justify-center items-center">
      <CameraView
        className="w-full h-full flex justify-center items-center"
        facing={facing}
        autofocus="off"
        ref={cameraRef}
        // ratio="16:9"
        videoQuality="480p"
      >
        <View className="absolute top-[5%] w-full flex-row justify-between">
          <TouchableOpacity className="m-5 ml-8" onPress={toggleCameraFacing}>
            <MaterialCommunityIcons
              name="camera-switch"
              size={width * 0.1}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="m-5 mr-8 mt-6"
            onPress={() => {
              setEmergencyCall(true); // Then open the report modal
            }}
          >
            <MaterialCommunityIcons
              name="phone-plus"
              size={width * 0.1}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-[13%] w-full flex-row justify-center">
          <TouchableOpacity
            className="w-auto h-full rounded-full bg-white justify-center items-center p-2 mx-[10%] border-2 border-[#0C3B2D]"
            onPress={capturePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={width * 0.15} color="#0C3B2D" />
            ) : (
              <MaterialCommunityIcons
                name="camera-iris"
                size={width * 0.15}
                color="#0C3B2D"
              />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>

      {emergencyCall && (
        <SosPage
          visible={emergencyCall}
          onClose={() => setEmergencyCall(false)} // Close SosPage when the user dismisses it
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraView: { width: "100%", height: "100%" },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { fontSize: 20, fontWeight: "bold" },
  cameraControls: {
    position: "absolute",
    top: "5%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: { margin: 5 },
  captureButtonContainer: {
    position: "absolute",
    bottom: "13%",
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0C3B2D",
  },
});
