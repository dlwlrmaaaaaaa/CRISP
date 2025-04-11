import React, { useState } from "react";

import Data from "../../JSON/readonDeny.json";
import axiosInstance from "../../axios-instance";
import { app } from "../../Firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
const db = getFirestore(app);
const DenyVerification = ({ isVisible, userId, onClose }) => {
  if (!isVisible) return null;
  const [selectedValue, setSelectedValue] = useState("");

  const handleDecline = async () => {
    try {
      // console.log("Declining user: ", userId);
      const declineRef = collection(db, "declinedVerification");
      const notificationRef = collection(db, "notifications");
      const verifyRef = collection(db, "verifyAccount");

      const res = await axiosInstance.put(`/api/deny-user/${userId}/`);

      if (res.status === 200 || res.status === 201 || res.status === 300) {
        const batch = writeBatch(db);
        const declineDocRef = doc(declineRef);
        const verifyQuery = query(verifyRef, where("user", "==", userId));
        const querySnapshot = await getDocs(verifyQuery);
        batch.set(declineDocRef, {
          userId: userId,
          reason: selectedValue,
          timestamp: serverTimestamp(),
        });

        const notificationDocRef = doc(notificationRef);
        batch.set(notificationDocRef, {
          userId: userId.toString(),
          title: `Verification Denied`,
          description: `Your verification was denied. Reason: ${selectedValue}`,
          screen: "/(tabs)/profile",
          createdAt: serverTimestamp(),
        });
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        alert("User denied success!");
        location.reload();
      }
    } catch (error) {
      console.error("Error denying user: ", error.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 w-full h-screen bg-black/75 flex items-center justify-center z-40">
        <div
          className="relative flex items-center justify-center rounded-lg w-screen h-screen"
          id="container"
          onClick={(e) => {
            if (e.target.id === "container") {
              onClose();
              //   setActiveDetails(false);
            }
          }}
        >
          <div className="relative bg-second w-auto flex flex-col items-center justify-center p-8 md:p-10 rounded-xl shadow-xl overflow-hidden">
            {/* bg squares */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
            </div>
            <div className="relative w-full flex items-center justify-center z-20">
              <p className="text-md text-main uppercase font-extrabold">
                Deny Verification
              </p>
            </div>
            <div className="w-full flex flex-col justify-center items-start gap-4 lg:gap-12 z-20">
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div className="p-3 w-full">
                  {Data.map((data, index) => (
                    <div
                      key={data.id}
                      className="flex items-center p-3 border-b border-textSecond"
                    >
                      <input
                        id={index.id}
                        type="radio"
                        name=""
                        value={data.type}
                        checked={selectedValue === data.type}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="form-radio h-4 w-4 text-main border-accent"
                      />
                      <div
                        value={data.id}
                        className={`ml-2 text-sm font-bold ${
                          selectedValue === data.type
                            ? "text-main"
                            : "text-textSecond"
                        }`}
                      >
                        {data.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row gap-4 items-center justify-end mt-4">
              <button
                className="py-2 px-3 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                onClick={(e) => {
                  e.preventDefault();
                  handleDecline();
                }}
              >
                DENY
              </button>
              <button
                className="py-2 px-3 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                onClick={() => {
                  onClose();
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DenyVerification;
