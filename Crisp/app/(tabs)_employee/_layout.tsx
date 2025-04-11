import React from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import TabBar_employee from "@/components/navigation/TabBar_employee";
import { RFPercentage } from "react-native-responsive-fontsize";

export default function NavLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
      tabBar={(props) => <TabBar_employee {...props} />}
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
}
