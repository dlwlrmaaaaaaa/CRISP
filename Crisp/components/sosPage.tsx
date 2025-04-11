import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  BackHandler,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";

interface SosPageProps {
  visible: boolean;
  onClose: () => void;
}

// Get screen dimensions
const { width, height } = Dimensions.get("window");
type ButtonType =
  | "fire"
  | "flood"
  | "carAccident"
  | "civilDisturbance"
  | "medical"
  | "close";

const SosPage: React.FC<SosPageProps> = ({ visible, onClose }) => {
  const [expandedButton, setExpandedButton] = useState<ButtonType | null>(null);
  const [confirmCall, setConfirmCall] = useState(false);
  const containerRef = useRef(null);

  const toggleExpand = (button: ButtonType) => {
    if (button === "close") {
      BackHandler.exitApp(); // Close the app tho ayaw pa HASAHSASHA
    } else if (expandedButton === button && confirmCall) {
      makeCall(button); // Make the call if already confirmed
      resetState(); // Reset state after calling
    } else if (expandedButton === button) {
      resetState(); // Reset if already selected
    } else {
      setExpandedButton(button); // Expand the new button
      setConfirmCall(true); // Set confirm call state
    }
  };

  const resetState = () => {
    setExpandedButton(null);
    setConfirmCall(false);
  };

  const makeCall = (button: ButtonType) => {
    let phoneNumber = "";

    switch (button) {
      case "fire":
        phoneNumber = "tel:911"; // Example for fire emergency
        break;
      case "flood":
        phoneNumber = "tel:911"; // Example for flood emergency
        break;
      case "carAccident":
        phoneNumber = "tel:911"; // Example for car accident
        break;
      case "civilDisturbance":
        phoneNumber = "tel:123"; // Example for civil disturbance
        break;
      case "medical":
        phoneNumber = "tel:911"; // Example for medical emergencies
        break;
      default:
        return;
    }

    Linking.openURL(phoneNumber).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  const handleOutsidePress = () => {
    resetState(); // Reset state on outside press
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView className="w-full h-full flex-1 justify-start items-center absolute bg-slate-800 z-10">
        <View className="flex flex-row w-full items-center justify-center px-6 ">
          <Text className="font-extrabold text-3xl text-white my-8">
            CRISP SOS
          </Text>
        </View>
        <View
          className="w-full flex flex-col justify-center items-center mt-2"
          ref={containerRef}
        >
          <View className="flex flex-row w-full items-center justify-between px-16 py-4">
            <View className="flex flex-col items-center justify-center">
              <TouchableOpacity
                className={`mt-5 w-auto rounded-xl p-6 shadow-lg border-2 justify-center items-center ${
                  expandedButton === "fire"
                    ? "bg-[#fc0303] border-red-400"
                    : "bg-white border-slate-400"
                }`}
                onPress={() => toggleExpand("fire")}
                style={{
                  transform: [{ scale: expandedButton === "fire" ? 1.2 : 1 }],
                }}
              >
                <MaterialCommunityIcons
                  name="fire"
                  size={RFPercentage(4.5)}
                  color={expandedButton === "fire" ? "#ffffff" : "#fc0303"}
                />
              </TouchableOpacity>
              <Text className="text-xs py-2 font-extrabold text-white">
                FIRE
              </Text>
            </View>

            <View className="flex flex-col items-center justify-center">
              <TouchableOpacity
                className={`mt-5 w-auto rounded-xl p-6 shadow-lg border-2 justify-center items-center ${
                  expandedButton === "flood"
                    ? "bg-[#034afc] border-blue-500"
                    : "bg-white border-slate-400"
                }`}
                onPress={() => toggleExpand("flood")}
                style={{
                  transform: [{ scale: expandedButton === "flood" ? 1.2 : 1 }],
                }}
              >
                <MaterialCommunityIcons
                  name="home-flood"
                  size={RFPercentage(4.5)}
                  color={expandedButton === "flood" ? "#ffffff" : "#034afc"}
                />
              </TouchableOpacity>
              <Text className="text-xs py-2 font-extrabold text-white">
                FLOOD
              </Text>
            </View>
          </View>

          <View className="flex flex-row w-full items-center justify-between px-16 py-4">
            <View className="flex flex-col items-center justify-center">
              <TouchableOpacity
                className={`mt-3 w-auto rounded-xl p-6 shadow-lg border-2 justify-center items-center ${
                  expandedButton === "carAccident"
                    ? "bg-[#017501] border-green-500"
                    : "bg-white border-slate-400"
                }`}
                onPress={() => toggleExpand("carAccident")}
                style={{
                  transform: [
                    { scale: expandedButton === "carAccident" ? 1.2 : 1 },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="car-emergency"
                  size={RFPercentage(4.5)}
                  color={
                    expandedButton === "carAccident" ? "#ffffff" : "#017501"
                  }
                />
              </TouchableOpacity>
              <Text className="text-xs py-2 font-extrabold text-white">
                CAR ACCIDENT
              </Text>
            </View>

            <View className="flex flex-col items-center justify-center">
              <TouchableOpacity
                className={`mt-3 w-auto rounded-xl p-6 shadow-lg border-2 justify-center items-center ${
                  expandedButton === "civilDisturbance"
                    ? "bg-[#000000] border-slate-500"
                    : "bg-white border-slate-400"
                }`}
                onPress={() => toggleExpand("civilDisturbance")}
                style={{
                  transform: [
                    { scale: expandedButton === "civilDisturbance" ? 1.2 : 1 },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="police-station"
                  size={RFPercentage(4.5)}
                  color={
                    expandedButton === "civilDisturbance"
                      ? "#ffffff"
                      : "#0C3B2D"
                  }
                />
              </TouchableOpacity>
              <Text className="text-xs py-2 font-extrabold text-white text-center">
                CIVIL{"\n"}DISTURBANCE
              </Text>
            </View>
          </View>
          <View className="py-4 items-center justify-center w-full">
            <TouchableOpacity
              className={`mt-3 w-auto rounded-xl p-4 shadow-lg border-2 justify-center items-center ${
                expandedButton === "medical"
                  ? "bg-[#fc0303] border-red-400"
                  : "bg-white border-slate-400"
              }`}
              onPress={() => toggleExpand("medical")}
              style={{
                transform: [{ scale: expandedButton === "medical" ? 1.2 : 1 }],
              }}
            >
              <MaterialCommunityIcons
                name="hospital"
                size={RFPercentage(6)}
                color={expandedButton === "medical" ? "#ffffff" : "#fc0303"}
              />
            </TouchableOpacity>
            <Text className="text-xs py-2 font-extrabold text-white">
              MEDICAL
            </Text>
          </View>

          <View className="py-2 items-center justify-center w-full">
            <TouchableOpacity
              className={`mt-5 w-auto rounded-full p-6 shadow-lg border-2 justify-center items-center ${
                expandedButton === "close"
                  ? "bg-black border-slate-700"
                  : "bg-white border-slate-400"
              }`}
              onPress={onClose}
            >
              <MaterialCommunityIcons
                name="close"
                size={RFPercentage(3.5)}
                color={expandedButton === "close" ? "#ffffff" : "#000000"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SosPage;
