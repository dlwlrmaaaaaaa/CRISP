import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

// Haversine formula to calculate the distance between two points (latitude and longitude)
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

interface Report {
  latitude: number;
  longitude: number;
  type_of_report: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface ReportLocationModalProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedReport: Report | null;
}

const ReportLocationModal: React.FC<ReportLocationModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedReport,
}) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [region, setRegion] = useState<any>(null); // For setting the map region dynamically
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);

  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log("Location permission denied");
        setLocationPermissionGranted(false);
        setRegion(initialRegion); // Default region when permission is denied
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
  }, [modalVisible]);

  const calculateDistance = (): string => {
    if (userLocation && selectedReport) {
      const distance = haversineDistance(userLocation, selectedReport);
      return distance > 1000
        ? `${(distance / 1000).toFixed(2)} km` // Convert to kilometers
        : `${distance.toFixed(2)} m`; // Keep in meters
    }
    return "Calculating..."; // Return a default value while the distance is being calculated
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      {/* Modal Background (TouchableWithoutFeedback) */}
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
          {/* Modal Content */}
          <View
            style={{
              width: width * 0.9,
              height: height * 0.55,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            {selectedReport && (
              <>
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
                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      coordinate={userLocation}
                      title="You are here"
                      pinColor="blue"
                    />
                  )}

                  {/* Report Location Marker */}
                  <Marker
                    coordinate={{
                      latitude: selectedReport.latitude,
                      longitude: selectedReport.longitude,
                    }}
                    title={selectedReport.type_of_report}
                  />
                </MapView>

                {/* Display Distance */}
                <Text style={{ padding: 10, color: "white" }}>
                  Distance from the Report: {calculateDistance()}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReportLocationModal;
