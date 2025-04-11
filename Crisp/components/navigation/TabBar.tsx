import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const TabBar = ({
  state,
  descriptors,
  navigation,
  isVerified,
}: {
  state: any;
  descriptors: any;
  navigation: any;
  isVerified: boolean;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleClose = () => {
    setModalVisible(false);
  };

  const onPress = (route: any) => {
    // Check if the route is one of the restricted ones
    if (["manage", "camera"].includes(route.name) && !isVerified) {
      setModalVisible(true); // Show the modal instead of alert
      return; // Do not navigate if not verified
    }

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <>
      <View className="absolute bottom-[2%] w-auto flex-row justify-center items-center bg-white mx-[2%] py-[1%] rounded-3xl shadow-xl border-[#0C3B2D] border-2">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const renderIcon = options.tabBarIcon
            ? options.tabBarIcon({
                color: isFocused ? "#0C3B2D" : "#000000",
                focused: isFocused,
              })
            : null;

          return (
            <TouchableOpacity
              key={route.key}
              className="flex-1 items-center justify-center my-3"
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => onPress(route)}
            >
              {renderIcon}
              {false && (
                <Text
                  style={[
                    styles.tabBarText,
                    { color: isFocused ? "#0C3B2D" : "#000000" },
                  ]}
                >
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal for verification */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 py-5 px-3  bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
            <Text className="text-2xl font-extrabold text-[#0C3B2D] mb-5 px-3">
              Verification Required
            </Text>
            <Text className="text-md font-normal text-[#0C3B2D] mb-10 px-3">
              Please verify your account first!
            </Text>
            <View className="flex flex-row justify-end w-full">
              <TouchableOpacity
                className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                onPress={handleClose}
              >
                <Text className="text-md font-semibold text-white px-4">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarText: {
    fontSize: RFPercentage(2),
  },
});

export default TabBar;
