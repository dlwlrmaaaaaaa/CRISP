import axios from "axios";
import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api from "@/app/api/axios";
import * as FileSystem from "expo-file-system";
import { app } from "@/firebase/firebaseConfig";
import { addDoc, doc, getDocs, getFirestore } from "firebase/firestore";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
const db = getFirestore(app);

interface AuthProps {
  USER_ID?: string;
  peerConnection?: any;
  setPeerConnection?: any;
  incomingCall?: any;
  hasNewNotification?: boolean;
  isPending?: boolean;
  setIncomingCall?: any;
  authState?: { token: string | null; authenticated: boolean | null };
  USERNAME?: string;
  setIsLoggedIn?: any;
  setAuthState?: any;
  SET_USER_ID?: any;
  setIsDone?: any;
  isDone?: any;
  near_by_reports?: any;
  set_near_by_reports?: any;
  onRegister?: (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    coordinates: string,
    contact_no: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onVerifyEmail?: (email: string, otp: string) => Promise<any>;
  createReport?: (
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    is_emergency: string,
    image_path: string,
    custom_type: string,
    floor_number: string,
    location: string
  ) => Promise<any>;
  onLogout?: () => Promise<any>;
  getUserInfo?: () => Promise<any>;
  updateProfile?: (
    username: string,
    address: string,
    contact_no: string,
    coordinates: string
  ) => Promise<any>;
  verifyCurrentPassword?: (currentPassword: string) => Promise<any>;
  changePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<any>;
  verifyAccount?: (
    firstName: string,
    middleName: string,
    lastName: string,
    address: string,
    // birthday: string,
    idNumber: string,
    selfie: string,
    photo: string,
    idPicture: string
  ) => Promise<any>;
}
interface CallerInfo {
  callId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  callStatus: string;
}
import * as Network from "expo-network";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { scheduleNotification } from "@/app/utils/notifications";
import { Alert } from "react-native";
import { callNotification } from "@/app/utils/callingNotification";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { Report } from "@/app/utils/reports";
const TOKEN_KEY = "my-jwt";
const REFRESH_KEY = "my-jwt-refresh";
const EXPIRATION = "accessTokenExpiration";
const ROLE = "my-role";
// export const API_URL = "http://192.168.1.191:8000"; //change this based on your url
const AuthContext = createContext<AuthProps>({});
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });
  const [incomingCall, setIncomingCall] = useState<CallerInfo | any>(null); // Store incoming call details
  const [USER_ID, SET_USER_ID] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [reports, setReports] = useState<any>([]);
  const [isDone, setIsDone] = useState(false);
  const [near_by_reports, set_near_by_reports] = useState<any>([]);
  // const lastNotifiedReportRef = useRef(null);
  const notifiedReportsRef = useRef<any>({});
  // Use a ref to keep track of notified reports

  useEffect(() => {
    let subscription: any;

    const startLocationMonitoring = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted!");
        return;
      }
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationUpdate) => {
          setLocation(locationUpdate.coords);
        }
      );
    };

    const fetchAllReports = async () => {
      try {
        const reportsData = await Report.fetchAllReports();
        const notDoneReports = reportsData.filter(
          (report) =>
            report.status !== "done" && report.user_id !== parseInt(USER_ID)
        );
        setReports(notDoneReports);
      } catch (error: any) {
        console.error("Error fetching reports:", error.message);
      }
    };

    fetchAllReports();
    startLocationMonitoring();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      nearbyReports();
    }
  }, [location, reports, authState.authenticated]);

  const nearbyReports = async () => {
    try {
      if (!location) {
        console.log("Location not found");
        return;
      }
      for (const report of reports) {
        const distance = getDistance(
          { latitude: report.latitude, longitude: report.longitude },
          { latitude: location.latitude, longitude: location.longitude }
        );

        // Reset the notification flag if the user is far enough away (e.g., >1000m)
        if (distance > 1000 && notifiedReportsRef.current[report.id]) {
          notifiedReportsRef.current[report.id] = false;
        }

        // If the user is within the notification radius (e.g., <=200m or change to 150m as needed)
        // and has not been notified for this report, trigger a notification.
        if (distance <= 200 && !notifiedReportsRef.current[report.id]) {
          scheduleNotification(
            "Nearby Report",
            `A ${report.type_of_report} report is nearby. Tap to view details.`,
            1,
            "/(tabs)/reports"
          );
          set_near_by_reports((prev: any) => [...prev, report]);
          notifiedReportsRef.current[report.id] = true;
        }
      }
    } catch (error: any) {
      console.error("Error fetching nearby reports:", error.message);
    }
  };

  const fetchNotifications = () => {
    try {
      const notificationsRef = collection(db, "globalNotification");
      // Setting up the real-time listener
      const unsubscribe = onSnapshot(
        notificationsRef,
        async (querySnapshot) => {
          if (querySnapshot.empty) {
            console.log("No notifications found.");
            return;
          }
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
          }));
          const latestNotification = getLatestNotification(data);
          const lastNotifiedReportId = await SecureStore.getItemAsync(
            "lastNotifiedReportId"
          );
          console.log("Last notified report ID:", lastNotifiedReportId);
          if (
            latestNotification &&
            lastNotifiedReportId !== latestNotification.id
          ) {
            console.log("Latest notification:", latestNotification);
            scheduleNotification(
              latestNotification.title,
              latestNotification.description,
              3,
              "/(tabs)/home"
            );
            // setHasNewNotification(true);
            await SecureStore.setItemAsync(
              "lastNotifiedReportId",
              latestNotification.id
            );
          }
        },
        (error) => {
          console.error("Error in onSnapshot listener:", error.message);
        }
      );
      return unsubscribe; // Return the unsubscribe function
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
    }
  };
  const getLatestNotification = (notifications: any) => {
    if (notifications.length === 0) return null;
    const sortedNotifications = notifications.sort(
      (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return sortedNotifications[0];
  };

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const unsubscribe = await fetchNotifications();
      return unsubscribe;
    };
    const unsubscribePromise = fetchAndSubscribe();
    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  useEffect(() => {
    if (USER_ID) {
      const userRef = doc(db, "users", USER_ID);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        const data = doc.data();

        if (data) {
          console.log(data);
          if (data.callStatus === "calling") {
            callNotification(
              `${data.caller_name} - CRISP`,
              "Calling...",
              "/calls/incoming"
            );
            router.push({
              pathname: "/calls/incoming",
              params: {
                caller_id: data.caller_id,
                callId: data.callId,
                callerName: data.caller_name,
              },
            });
            setIncomingCall(data);
          }
          if (data.callStatus === "answered") {
            setIncomingCall(null);
          }
          if (data.callStatus === "declined") {
            setIncomingCall(null);
          }
          if (data.callStatus === "ended") {
            setIncomingCall(null);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [USER_ID]);

  useEffect(() => {
    const getUsername = async () => {
      const username = await SecureStore.getItemAsync("username");
      if (username) {
        setUsername(username);
      }
    };
    getUsername();
  }, [username]);
  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      console.log("stored: ", token);
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({
          token: token,
          authenticated: true,
        });
      }
    };
    const loadId = async () => {
      const user_id = await SecureStore.getItemAsync("user_id");
      if (user_id) {
        SET_USER_ID(user_id);
      }
    };
    loadId();
    loadToken();
  }, []);

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CRISP/1.0.9 crisp.uccbscs@gmail.com", // Replace with your app name and contact email
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching address:", errorText);
        return null;
      }

      const data = await response.json();

      if (data && data.address) {
        console.log(data);
        const { residential, town, state, country } = data.address;
        const addressParts = [residential, town, state, country].filter(
          Boolean
        );
        const address = addressParts.join(", "); // Join non-empty parts
        return addressParts || "Address not found";
      } else {
        console.error("Nominatim API error:", data);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  //register function
  const register = async (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    coordinates: string,
    contact_no: string
  ) => {
    const ipv = await Network.getIpAddressAsync();
    try {
      const res = await api.post("api/citizen/registration/", {
        username,
        email,
        password,
        password_confirm,
        address,
        coordinates,
        contact_number: contact_no,
        ipv,
      });

      await SecureStore.setItemAsync("email", email.toString());

      return res; // Return successful response
    } catch (error: any) {
      console.error("Error during registration:", error);

      // Handle server error responses
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;

        // Aggregate all possible error fields into a readable message
        const errorMessage = [
          serverErrors.username?.join(" ") || "",
          serverErrors.email?.join(" ") || "",
          serverErrors.contact_number?.join(" ") || "",
          serverErrors.ipv?.join(" ") || "",
        ]
          .filter((msg) => msg.trim()) // Remove empty fields
          .join(" ");

        return {
          error: true,
          msg: errorMessage || "Unknown error occurred from the server.",
        };
      }

      // Handle network or unexpected errors
      return {
        error: true,
        msg: "A network or unexpected error occurred during registration.",
      };
    }
  };

  //Login function
  const login = async (username: string, password: string) => {
    try {
      console.log("Starting login process for username:", username); // Log the username
      // Implement login functionality here
      const { data } = await api.post(`api/token/`, {
        username,
        password,
      });

      if (!data.is_email_verified) {
        router.push("/pages/verifyEmail");
        return;
      }

      if (!data.access || !data.refresh) {
        throw new Error(
          "Authentication failed. No access or refresh token received."
        );
      }

      setAuthState({
        token: data.access,
        authenticated: true,
      });
      SET_USER_ID(data.user_id.toString());
      const expirationTime = Date.now() + 60 * 60 * 1000;
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      const storageItems: any = {
        [TOKEN_KEY]: data.access,
        [REFRESH_KEY]: data.refresh,
        [ROLE]: data.account_type,
        [EXPIRATION]: expirationTime,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        address: data.address || "",
        contact_number: data.contact_number,
        account_type: data.account_type,
        is_email_verified: data.is_email_verified,
        is_verified: data.is_verified,
        score: data.score,
        violation: data.violation,
        firebase_token: data.firebase_token,
      };

      if (data.account_type === "worker") {
        console.log("SUpervisor id: ", data.supervisor);
        storageItems.supervisor_id = data.supervisor;
        storageItems.station_address = data.station_address;
      }

      await Promise.all(
        Object.entries(storageItems).map(async ([key, value]) => {
          if (value !== null && value !== undefined) {
            try {
              await SecureStore.setItemAsync(key, value.toString());
            } catch (err) {
              console.error(`Failed to save key ${key} to SecureStore:`, err);
            }
          } else {
            console.warn(`Skipping key ${key} due to null or undefined value`);
          }
        })
      );
      await SecureStore.setItemAsync("isLoggedIn", "true");
      setIsLoggedIn(true);
      return data;
    } catch (error: any) {
      // console.error("Login error occurred:", error);
      console.log("Error: ", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        if (error.response.status === 401) {
          throw new Error("Invalid username or password!");
        } else {
          throw new Error("An unexpected error occurred");
        }
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const logout = async () => {
    const storageItems = [
      TOKEN_KEY,
      REFRESH_KEY,
      ROLE,
      EXPIRATION,
      "user_id",
      "username",
      "email",
      "address",
      "contact_number",
      "account_type",
      "is_email_verified",
      "is_verified",
      "supervisor_id",
      "isLoggedIn",
    ];

    await Promise.all(
      storageItems.map(async (key) => {
        await SecureStore.deleteItemAsync(key);
      })
    );
    setAuthState({
      token: null,
      authenticated: null,
    });
    console.log("Logging out...");
    router.replace("/pages/login");
  };

  const onVerifyEmail = async (email: string, otp: string) => {
    try {
      const res = await api.post(`api/otp/verify/`, {
        email,
        otp,
      });
      if (res.status === 200 || res.status === 201) {
        await scheduleNotification(
          "Registration Successfully!!",
          "Welcome to the community! Start exploring the app now. Please kindly login your details.",
          1,
          ""
        );
        router.push("/pages/login");
        return;
      }
      throw new Error(res.status.toString() + " status code!");
    } catch (error: any) {
      if (error.response) {
        console.log("Error response data:", error.response.data);
        if (error.response.status === 401) {
          throw new Error("Invalid email or Otp");
        } else {
          throw new Error("An unexpected error occurred");
        }
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };
  const createReport = async (
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    is_emergency: string,
    image_path: string,
    custom_type: string,
    floor_number: string,
    location: string
  ) => {
    const formData = new FormData();
    formData.append("type_of_report", type_of_report);
    formData.append("report_description", report_description);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("is_emergency", is_emergency);

    // Convert image to base64
    const imageBase64 = await FileSystem.readAsStringAsync(image_path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    formData.append("image_path", `data:image/jpeg;base64,${imageBase64}`);
    formData.append("custom_type", custom_type);
    formData.append("floor_number", floor_number);
    formData.append("location", location);

    try {
      const res = await api.post("api/create-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      // Check for success status codes
      if (res.status === 201 || res.status === 200) {
        return res; // Report created successfully
      }

      throw new Error("Failed to create report.");
    } catch (error: any) {
      console.error("Error details:", error);
      throw error;
    }
  };

  const getUserInfo = async () => {
    try {
      const username = await SecureStore.getItemAsync("username");
      const email = await SecureStore.getItemAsync("email");
      const address = await SecureStore.getItemAsync("address");
      const contact_number = await SecureStore.getItemAsync("contact_number");
      const is_verified = await SecureStore.getItemAsync("is_verified");
      // console.log("is_verified: ", is_verified);

      return {
        username,
        email,
        address,
        contact_number,
        is_verified: is_verified === "true",
      };
    } catch (error) {
      console.error("Error retrieving user information:", error);
      return null;
    }
  };

  const updateProfile = async (
    username: string,
    address: string,
    contact_no: string,
    coordinates: string
  ) => {
    try {
      // const ipv = await Network.getIpAddressAsync(); // Get the current IP address if required
      const res = await api.put(
        `api/user/profile/`,
        {
          username,
          address,
          contact_number: contact_no,
          coordinates,
          // ipv, // Include the IP address if it's required for the update
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      // Update the SecureStore with the new information
      await SecureStore.setItemAsync("username", username);
      await SecureStore.setItemAsync("address", address);
      await SecureStore.setItemAsync("contact_number", contact_no);
      await SecureStore.setItemAsync("coordinates", coordinates);

      return res.data; // Return the updated user data
    } catch (error: any) {
      console.error("Update profile error:", error);

      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const verifyCurrentPassword = async (currentPassword: string) => {
    try {
      const response = await api.post(
        "api/verify-password/",
        {
          password: currentPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      return response.data.valid; // Assume the API returns { valid: true/false }
    } catch (error) {
      // console.error("Error verifying password:", error);
      throw new Error("Could not verify current password.");
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await api.put(
        "api/change-password/",
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: newPassword, // Include this field
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      return response.data; // Return the response from the server
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Could not change password.");
    }
  };

  const verifyAccount = async (
    firstName: string,
    middleName: string,
    lastName: string,
    address: string,
    // birthday: string,
    idNumber: string,
    selfie: string,
    photo: string,
    idPicture: string
  ) => {
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("middle_name", middleName);
    formData.append("last_name", lastName);
    formData.append("text_address", address);
    // formData.append("birthday", birthday);
    formData.append("id_number", idNumber);

    const selfieBase64 = await FileSystem.readAsStringAsync(selfie, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const photoBase64 = await FileSystem.readAsStringAsync(photo, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const idPictureBase64 = await FileSystem.readAsStringAsync(idPicture, {
      encoding: FileSystem.EncodingType.Base64,
    });

    formData.append(
      "id_selfie_image_path",
      `data:image/jpeg;base64,${selfieBase64}`
    );
    formData.append(
      "photo_image_path",
      `data:image/jpeg;base64,${photoBase64}`
    );
    formData.append(
      "id_picture_image_path",
      `data:image/jpeg;base64,${idPictureBase64}`
    );

    try {
      const res = await api.post("api/verify-account/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState.token}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        // alert("Verification request has been sent!");
        const notifCollectionRef = collection(db, "notifications");
        await addDoc(notifCollectionRef, {
          title: "Verification Request Submitted",
          description:
            "A citizen has submitted verification information for review. Please take action.",
          for_superadmin: true,
          createdAt: new Date(),
          user_id: USER_ID,
        });
      }
      return res;
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || error.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    let unsubscribe: any;

    const subscribeToVerificationStatus = async () => {
      const userId = await SecureStore.getItemAsync("user_id");
      if (!userId) return;
      const userIdString = userId.toString();
      const verifyAccountRef = collection(db, "verifyAccount");
      const q = query(
        verifyAccountRef,
        where("user", "==", parseInt(userIdString))
      );

      unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            if (!data.is_account_verified) {
              setIsPending(true);
              await SecureStore.setItemAsync("is_verified", "false");
            } else {
              await SecureStore.setItemAsync("is_verified", "true");
              setIsPending(false);
            }
            console.log("Verification info exists:", data);
          } else {
            console.log("No verification info found for this user");
          }
        },
        (error) => {
          console.error("Error fetching verification info:", error);
        }
      );
    };

    subscribeToVerificationStatus();

    // Clean up the subscription when the component unmounts.
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    onVerifyEmail: onVerifyEmail,
    authState,
    setAuthState,
    SET_USER_ID,
    USER_ID,
    USERNAME: username,
    createReport: createReport,
    getUserInfo,
    updateProfile,
    verifyCurrentPassword,
    changePassword,
    verifyAccount,
    getAddressFromCoordinates,
    hasNewNotification,
    incomingCall,
    setIncomingCall,
    peerConnection,
    setPeerConnection,
    isPending,
    setIsDone,
    isDone,
    setIsLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
