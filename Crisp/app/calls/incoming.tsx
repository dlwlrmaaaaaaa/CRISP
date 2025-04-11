import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";
import { doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { Audio } from "expo-av";

const db = getFirestore(app);
const iceServersConfig = {
  iceServers: [
    {
      urls: ["stun:ss-turn2.xirsys.com"],
    },
    {
      username:
        "3g_qAMgcCEEbTDNAgtWOl3c7xB3NJ8DCD2KiSYzt74bmyGNbCD9HN2DZeW54rvRqAAAAAGdVY41jcmlzcA==",
      credential: "e2d702da-b544-11ef-a0f7-0242ac140004",
      urls: [
        "turn:ss-turn2.xirsys.com:80?transport=udp",
        "turn:ss-turn2.xirsys.com:3478?transport=udp",
        "turn:ss-turn2.xirsys.com:80?transport=tcp",
        "turn:ss-turn2.xirsys.com:3478?transport=tcp",
        "turns:ss-turn2.xirsys.com:443?transport=tcp",
        "turns:ss-turn2.xirsys.com:5349?transport=tcp",
      ],
    },
  ],
};
export default function Incoming() {
  const { incomingCall, USER_ID, setIncomingCall } = useAuth();
  const { callerName } = useLocalSearchParams()
  const callerImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Use a placeholder image
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  useEffect(() => {
    if (incomingCall) {
      playRingingSound();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [incomingCall]);

  const playRingingSound = async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/ring.mp3")
      );
      soundRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      if(!USER_ID){
        console.log("USER ID NOT FOUND ! AT INCOMING .TSX")
        return;
      }
      console.log("Incoming Call Sound: ", sound);
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const callRef = doc(db, "calls", incomingCall.callId);
      const userRef = doc(db, "users", USER_ID);
      await setDoc(
        callRef,
        { callStatus: "declined", offer: null },
        { merge: true }
      );
      await updateDoc(userRef, {
        callStatus: "ended"
      })
      
      router.push("/(tabs)/home")
    } catch (error) {
      console.error("Incoming call handle end call: ", error);
    }
  };

 const handleAnswerCall = async () => {
    try {
      if (incomingCall) {
        if(!USER_ID){
          console.log("USER ID NOT FOUND ! AT INCOMING .TSX")
          return;
        }

        await updateDoc(doc(db, "calls", incomingCall.callId), {
          callStatus: "answered",
        });
        await updateDoc(doc(db, "users", USER_ID), {
          callStatus: "in-call"
        })
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setIncomingCall(null);
        router.replace({
          pathname: "/calls/outgoing",
          params: {
            callId: incomingCall.callId,
            callerName: incomingCall.caller_name,
            mode: "callee",
          },
        });
      }
    } catch (error) {
      console.error("Error answering the call", error);
      Alert.alert("Error", "Could not answer the call.");
    }
  };

  return (
    <View className="flex-1 bg-[#1A1A1A] justify-between px-12 py-20">
      <StatusBar style="light" />

      {/* Caller Information */}
      <View className="items-center mt-5">
        <MaterialCommunityIcons
          name="account-circle"
          size={RFPercentage(16)}
          style={{ padding: 5, color: "#fff" }}
        />
        {/* <Image
          source={{ uri: callerImage }}
          className="w-32 h-32 rounded-full border-4 border-white"
        /> */}
        <Text className="mt-4 text-3xl text-white font-bold">{callerName}</Text>
        <Text className="mt-2 text-lg text-gray-400">Incoming Call</Text>
      </View>

      {/* Buttons (Answer/Decline) */}
      <View className="flex-row justify-between mt-8">
        {/* Decline Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="w-24 h-24 bg-red-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          onPress={handleAnswerCall}
          className="w-24 h-24 bg-green-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
