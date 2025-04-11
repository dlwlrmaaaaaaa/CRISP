import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Button,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Dimensions } from "react-native";
import * as Location from "expo-location"; // Import expo-location

const { width, height } = Dimensions.get("window");

interface MapPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
  onClose: () => void; // Add onClose prop to handle closing the MapPicker
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [initialRegion, setInitialRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedLocation({ latitude, longitude }); // Set the initial marker location
      } catch (error) {
        console.error(error);
        // Handle error
      }
    };

    getCurrentLocation();
  }, []);

  const handlePress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Modal animationType="fade" transparent={true} onRequestClose={onClose}>
        <View className="flex-1 h-full py-24 justify-center items-center bg-black/50">
          <TouchableWithoutFeedback>
            <View className="w-[95%] h-[80%] bg-white rounded-lg overflow-hidden">
              {initialRegion && (
                <MapView
                  style={{ width: "100%", height: "90%" }}
                  onPress={handlePress}
                  initialRegion={initialRegion}
                >
                  {selectedLocation && <Marker coordinate={selectedLocation} />}
                </MapView>
              )}
              <Button title="Select Location" onPress={handleConfirm} />
              {selectedLocation && (
                <Text className="p-1">
                  Selected: {selectedLocation.latitude},{" "}
                  {selectedLocation.longitude}
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  );
};

export default MapPicker;
