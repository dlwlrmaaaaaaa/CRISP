// PhoneCallScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av"; // Import expo-av
import uuid from "react-native-uuid";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { useAuth } from "@/AuthContext/AuthContext";
const db = getFirestore(app);
import {
  RTCPeerConnection,
  mediaDevices,
  MediaStream,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
} from "react-native-webrtc";

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

export default function Outgoing() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  // Sample data for the outgoing call UI
  const callerImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Use a placeholder image
  const { callId, username, receiverId, callerName } = useLocalSearchParams();
  const { USER_ID } = useAuth();
  const { mode } = useLocalSearchParams();
  const [ringSound, setRingSound] = useState<Audio.Sound | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cachedLocalPC, setCacheLocalPC] = useState<any>(null);
  const [isAnswered, setAnswered] = useState(false); 
  const [timerInterval, setTimerInterval] = useState<number>(0);
  const ringSoundRef = useRef<Audio.Sound | null>(null);

  let interval: number | NodeJS.Timer | undefined;

  // Load and play ringing sound
  const playRingingSound = async () => {
    if (ringSoundRef.current) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/ring.mp3")
      );
      ringSoundRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };
  

  const stopRingingSound = async () => {
    try {
      if (ringSoundRef.current) {
        await ringSoundRef.current.stopAsync();
        await ringSoundRef.current.unloadAsync();
        ringSoundRef.current = null;
      }
    } catch (error) {
      console.log("Error stopping sound:", error);
    }
  };

  useEffect(() => {
     if(mode === 'caller'){
        console.log("Playing sounds on outgoing call... with ID: ", USER_ID, " and mode: ", mode);
        playRingingSound(); 
     }
    return () => {
      stopRingingSound(); 
    };
  }, []);

  useEffect(() => {
    const callRef = doc(db, "calls", callId as string);
    let localPC: RTCPeerConnection | null = new RTCPeerConnection(iceServersConfig);
    const unsubscribe = onSnapshot(callRef, async (doc) => {
      const data = doc.data();
      if (data?.callStatus === "answered") {
        console.log("Call has been answered, stopping ringing sound...");
        stopRingingSound();       
        setAnswered(true);
        startTimer();
      } 
      if (data?.callStatus === "declined" || data?.callStatus === "ended") {
        console.log(`Call has been ${data.callStatus}`);
        // Clean up local peer connection
        if (localPC) {
          localPC.close();
          localPC = null;
        }
        if (cachedLocalPC) {
          cachedLocalPC.close();
          setCacheLocalPC(null);
        }
    
        // Reset streams and stop any active timers
        setLocalStream(null);
        setRemoteStream(null);
        resetTimer();
    
        // Navigate based on the call status
        if (data.callStatus === "declined") {
          stopRingingSound();
          router.push('/(tabs)_employee/reports');
        } else if (data.callStatus === "ended") {
          stopRingingSound();
          mode === "caller" ? router.back() : router.push('/(tabs)/home');
        }
        unsubscribe();
      }

    });
  
    return () => unsubscribe();
  }, [callId]);
  
  const startTimer = () => {
    if (!interval) {
      interval = setInterval(() => {
        setTimerInterval((prevTimer) => prevTimer + 1);
      }, 1000);
    }
  };

  // Stop the timer
  const stopTimer = () => {
    if (interval) {
      clearInterval(interval as number); // Cast to number for browser compatibility
      interval = undefined;
    }
  };

  // Reset the timer
  const resetTimer = () => {
    stopTimer();
    setTimerInterval(0);
  };
  useEffect(() => {
    return () => {
      if (interval) {
        clearInterval(interval as number);
      }
    };
  }, []);
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  
  const startLocalStream = async () => {
    const isFront = true;
    const constraints = {
      audio: true,
    };

    try {
      const newStream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(newStream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
      Alert.alert("Error", "Could not access camera or microphone");
    }
  };

  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream) {
      startCall();
    }
  }, [localStream]);

  const saveIceCandidate = async (callId: any, iceCandidate: any) => {
    try {
      const iceCandidateObject = iceCandidate.toJSON(); // Convert to plain object
      await addDoc(
        collection(db, "calls", callId, "callerCandidates"),
        iceCandidateObject
      );
      console.log("Ice candidate saved successfully");
    } catch (error) {
      console.error("Error saving Ice candidate: ", error);
    }
  };

  const startCall = async () => {
    // @ts-ignore
    const callRef = doc(db, "calls", callId);
    if (mode === "caller") {
      const localPC = new RTCPeerConnection(iceServersConfig);
      localStream?.getTracks().forEach((track) => {
        localPC.addTrack(track, localStream);
      });
      
     
      const callerCandidatesCollection = collection(
        callRef,
        "callerCandidates"
      );
      const calleeCandidatesCollection = collection(
        callRef,
        "calleeCandidates"
      );

      localPC.addEventListener("icecandidate", (e) => {
        if (!e.candidate) {
          console.log("Got final candidate!");
          return;
        }
        saveIceCandidate(callId, e.candidate);
      });
      // @ts-ignore
      localPC.ontrack = (e: any) => {
        const newStream = new MediaStream();
        e.streams[0].getTracks().forEach((track: any) => {
          console.log("Received track:", track); // Log received track
          newStream.addTrack(track);
        });
        setRemoteStream(e.streams[0]);
      };
      // @ts-ignore
      const offer = await localPC.createOffer();
      await localPC.setLocalDescription(offer);

      await updateDoc(callRef, { offer: offer, connected: false });

      onSnapshot(callRef, (doc) => {
        const data = doc.data();
        if (!localPC.remoteDescription && data?.answer) {
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          localPC.setRemoteDescription(rtcSessionDescription);
          
        } else {
          setRemoteStream(null);
        }
      });

      onSnapshot(calleeCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            localPC.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    
      setCacheLocalPC(localPC);
    } else {
      // @ts-ignore
      const callRef = doc(db, "calls", callId);
      const callSnapshot = await getDoc(callRef);
      if (callSnapshot.exists()) {
        console.log("Document exists!");
      } else {
        console.log("Document does not exist.");
      }

      const localPC = new RTCPeerConnection(iceServersConfig);
      localStream?.getTracks().forEach((track) => {
        localPC.addTrack(track, localStream);
      });

      const callerCandidatesCollection = collection(
        callRef,
        "callerCandidates"
      );
      const calleeCandidatesCollection = collection(
        callRef,
        "calleeCandidates"
      );

      localPC.addEventListener("icecandidate", (e) => {
        if (!e.candidate) {
          console.log("Got final candidate!");
          return;
        }
        addDoc(calleeCandidatesCollection, e.candidate.toJSON());
      });
      // @ts-ignore
      localPC.ontrack = (e) => {
        const newStream = new MediaStream();
        e.streams[0].getTracks().forEach((track: any) => {
          newStream.addTrack(track);
        });
        setRemoteStream(e.streams[0]);
      };
      // @ts-ignore
      localPC.oniceconnectionstatechange = () => {
        console.log("ICE Connection State Change:", localPC.iceConnectionState);
      };
      // @ts-ignore
      localPC.onconnectionstatechange = () => {
        console.log("Connection State Change:", localPC.connectionState);
      };
      // @ts-ignore
      const offer = await callSnapshot.data().offer;
      await localPC.setRemoteDescription(offer);

      const answer = await localPC.createAnswer();
      await localPC.setLocalDescription(answer);
      await updateDoc(callRef, { answer: answer, connected: true });

      onSnapshot(callerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            localPC.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      setCacheLocalPC(localPC);
    }
  };

  const handleEndCall = async () => {
    try {
      if (!callId) {
        throw new Error("callId is required but was not provided.");
      }
      const callRef = doc(db, "calls", callId as string);
      const userRef = mode === "caller"//@ts-ignore
        ? doc(db, "users", receiverId)//@ts-ignore
        : doc(db, "users", USER_ID);
      await Promise.all([
        setDoc(callRef, { callStatus: "ended", callLogs: timerInterval }, { merge: true }),
        updateDoc(userRef, { callStatus: "available" }),
      ]);

      if (cachedLocalPC) {
        cachedLocalPC.close();
        setCacheLocalPC(null);
      }
      console.log("Call Ended");
    } catch (error) {
      console.error("Error ending the call:", error);
    }
  };
  

  const handleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled; // Toggle the microphone
      });
      setIsMicOn(!isMicOn); // Flip the state between true and false
      console.log(isMicOn ? "Microphone Off" : "Microphone On");
    }
  };

  const handleSpeaker = () => {
    // Toggle the speaker state
    setIsSpeakerOn(!isSpeakerOn); // Flip the state between true and false
    console.log(isSpeakerOn ? "Speaker Volume Low" : "Speaker Volume High");
  };


  return (
    <View className="flex-1 bg-blue-900 justify-between px-12 py-20">
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
        <Text className="mt-4 text-3xl text-white font-bold">{username || callerName}</Text>
        <Text className="mt-2 text-lg text-gray-400">{isAnswered ? formatTimer(timerInterval) : "Calling..."}</Text>
      </View>

      {/* Buttons (Mute, End Call, Speaker) */}
      <View className="flex-row justify-between mt-8">
        {/* Mute Button */}
        <TouchableOpacity
          onPress={handleMute}
          className="w-24 h-24 bg-gray-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name={isMicOn ? "microphone-off" : "microphone"}
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="w-24 h-24 bg-red-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          onPress={handleSpeaker}
          className="w-24 h-24 bg-gray-600 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name={isSpeakerOn ? "volume-high" : "volume-low"} // Toggle between volume-high and volume-mute
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
