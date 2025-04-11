import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import TabBar from "@/components/navigation/TabBar";
import { RFPercentage } from "react-native-responsive-fontsize";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/AuthContext/AuthContext";
const ScreenTabs = () => {
  const colorScheme = useColorScheme();
  const { getUserInfo } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await (getUserInfo
        ? getUserInfo()
        : Promise.resolve({}));
      setIsVerified(userInfo?.is_verified || "");
    };

    loadUserInfo();
  }, [getUserInfo]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
      tabBar={(props) => (
        <TabBar {...props} isVerified={!isVerified === false} />
      )}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
                size={RFPercentage(3)}
              />
              <Text
                style={{ color, fontWeight: focused ? "600" : "400" }}
                className="mt-2 text-xs font-semiboldbold"
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabBarIcon
                name={focused ? "document-text" : "document-text-outline"}
                color={color}
                size={RFPercentage(3)}
              />
              <Text
                style={{ color, fontWeight: focused ? "600" : "400" }}
                className="mt-2 text-xs"
              >
                Reports
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabBarIcon
                name={focused ? "camera" : "camera-outline"}
                color={color}
                size={RFPercentage(3)}
              />
              <Text
                style={{ color, fontWeight: focused ? "600" : "400" }}
                className="mt-2 text-xs"
              >
                Report
              </Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={isVerified ? props.onPress : () => {}}
              style={{ opacity: isVerified ? 1 : 0.5 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "Manage",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabBarIcon
                name={focused ? "file-tray-full" : "file-tray-full-outline"}
                color={color}
                size={RFPercentage(3)}
              />
              <Text
                style={{ color, fontWeight: focused ? "600" : "400" }}
                className="mt-2 text-xs"
              >
                Manage
              </Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={isVerified ? props.onPress : undefined}
              style={{ opacity: isVerified ? 1 : 0.5 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabBarIcon
                name={focused ? "person" : "person-outline"}
                color={color}
                size={RFPercentage(3)}
              />
              <Text
                style={{ color, fontWeight: focused ? "600" : "400" }}
                className="mt-2 text-xs"
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
};
export default function NavLayout() {
  return (
      <ScreenTabs />
  );
}
