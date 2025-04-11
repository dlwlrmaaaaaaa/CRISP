import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useState, createContext, useEffect, useContext } from "react";
import { app } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";

const db = getFirestore(app);

const CallContext = createContext<AuthProps>({});

export const useCall = () => {
  return useContext(CallContext);
};

interface AuthProps {
  USER_ID?: any;
}

export const CallProvider = ({ children }: any) => {
  const { USER_ID } = useCall(); // Call the custom hook to get USER_ID from context
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const router = useRouter();

 

  const value = {
    USER_ID,
    incomingCall, // Provide incomingCall as part of the context
    setIncomingCall, // Allow other components to modify incomingCall state
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
