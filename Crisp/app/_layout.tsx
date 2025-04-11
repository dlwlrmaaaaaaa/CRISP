import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/AuthContext/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import api from "./api/axios";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const TOKEN_KEY = "my-jwt";
const REFRESH_KEY = "my-jwt-refresh";
const EXPIRATION = "accessTokenExpiration";
const PUSH_TOKEN = "pushToken";
const ACCOUNT_TYPE = "account_type";
const ROLE = "my-role";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
 const { setAuthState, SET_USER_ID, setIsLoggedIn } = useAuth();



  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const { data } = await api.post("api/token/refresh/", {
        refresh: refreshToken,
      });

      setAuthState({
        token: data.access,
        authenticated: true,
      });
      SET_USER_ID(data.user_id.toString());
      const expirationTime = Date.now() + 60 * 60 * 1000;
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      const storageItems = {
        [TOKEN_KEY]: data.access,
        [REFRESH_KEY]: data.refresh,
        [ROLE]: data.account_type,
        [EXPIRATION]: expirationTime.toString(),
        user_id: data.user_id.toString(),
        username: data.username,
        email: data.email,
        address: data.address,
        contact_number: data.contact_number,
        account_type: data.account_type,
        is_email_verified: data.is_email_verified,
        is_verified: data.is_verified,
      };

      await Promise.all(
        Object.entries(storageItems).map(([key, value]) =>
          SecureStore.setItemAsync(key, value.toString())
        )
      );

      return data;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return null;
    }
  };
  const checkToken = async () => {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      const expiration = await SecureStore.getItemAsync(EXPIRATION);
      const currentTime = Date.now();
      if (!accessToken || !refreshToken) {
        return;
      }
      if (!refreshToken) {
        throw new Error("Error on Refreshig a token!");
      }
      console.log("Checking token...");
      try {
        if (!accessToken || !expiration || currentTime > parseInt(expiration)) {
          if (refreshToken) {
            console.log("Refreshing token...");       
            const newAccessToken = await refreshAccessToken(refreshToken);         
            if (!newAccessToken) {
              console.log("Both tokens are invalid, prompting login...");
              return null;
            }
            console.log("Refresh Token Acquired");
            return newAccessToken;
          }
          // No tokens available
          return null;
        }
  
        return accessToken;
      } catch (error: any) {
        console.log(error.message);
      }
    };
  const handleAuthentication = async () => {
      await SecureStore.deleteItemAsync("isLoggedIn");
      const accessToken = await checkToken();
      if (accessToken) {
        const accountType = await SecureStore.getItemAsync(ACCOUNT_TYPE);
        setIsLoggedIn(true);
        await SecureStore.setItemAsync("isLoggedIn", "true");
        // Redirect based on account type
        if (accountType === "citizen") {
          router.push("/(tabs)/camera");
        } else if (accountType === "worker") {
          router.push("/(tabs)_employee/reports");
        } else {
          alert("Unexpected account type");
        }
      } else {
        // Redirect to login if the token is not valid
        router.push("/pages/login");
      }
    };
  
  useEffect(() => {
    if (loaded) { 
      handleAuthentication();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{}}>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="pages"
            options={{
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="(tabs)_employee"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="pages_employee"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="calls"
            options={{ headerShown: false, animation: "fade" }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
