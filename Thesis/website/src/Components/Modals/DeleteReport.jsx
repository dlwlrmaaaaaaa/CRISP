import React, { useState, useEffect } from "react";

import Data from "../../JSON/reasonDeleting.json";

import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { app } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../AuthContext/AuthContext";

const db = getFirestore(app);

const DeleteReport = ({ isVisible, onClose, reportId, reportedType }) => {
  const { user } = useAuth();
  if (!isVisible) return null;
  const [selectedValue, setSelectedValue] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(user.username); // Log user when it's available
  }, [user]);

  const handleDeleteReport = async () => {
    try {
      const reportRef = doc(
        db,
        `reports/${reportedType.toLowerCase()}/reports`,
        reportId
      );

      // Get the report data before deleting
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        console.error("Report does not exist!");
        return;
      }
      const reportData = reportSnap.data();

      // Delete the report from the sub-collections (e.g. validation, votes, reasons, feedback)
      await deleteCollectionDocuments(reportId, reportedType.toLowerCase());

      // Get the current time in ISO format
      const localDate = new Date();
      const localOffset = localDate.getTimezoneOffset() * 60000;
      const localTimeAdjusted = new Date(localDate.getTime() - localOffset);
      const localDateISOString = localTimeAdjusted.toISOString().slice(0, -1);

      // Move the report to deletedReports with the correct local time
      const deletedReportRef = doc(db, "deletedReports", reportId);
      await setDoc(deletedReportRef, {
        ...reportData,
        deleted_at: localDateISOString,
        deleted_by: username, // assuming `username` is already defined elsewhere
        reason_deleted: selectedValue,
      });

      // Delete the main report document
      await deleteDoc(reportRef);

      alert("Report deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // Function to delete all documents in a collection (sub-collections of the report)
  async function deleteCollectionDocuments(reportId, reportType) {
    try {
      // Define the paths to the sub-collections
      const validationPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/validation`;
      const votesPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/votes`;
      const reasonsPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/reported/`;
      const userFeedbackPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/userFeedback`;
      const workerFeedbackPath = `reports/${reportType.toLowerCase()}/reports/${reportId}/workerFeedback`;

      // Delete documents in validation, votes, reasons, userFeedback, and workerFeedback collections
      await Promise.all([
        deleteSubCollectionDocuments(validationPath),
        deleteSubCollectionDocuments(votesPath),
        deleteSubCollectionDocuments(reasonsPath),
        deleteSubCollectionDocuments(userFeedbackPath),
        deleteSubCollectionDocuments(workerFeedbackPath),
      ]);
    } catch (error) {
      console.error("Error deleting documents in sub-collections:", error);
    }
  }

  // Function to delete all documents in a given collection
  async function deleteSubCollectionDocuments(collectionPath) {
    try {
      const collectionRef = collection(db, collectionPath);
      const querySnapshot = await getDocs(collectionRef);

      // Use for...of to handle async operations properly
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
        // console.log(
        //   `Document with ID ${docSnapshot.id} deleted from ${collectionPath}`
        // );
      }
    } catch (error) {
      console.error(
        `Error deleting documents in collection ${collectionPath}:`,
        error
      );
    }
  }

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
          <div className="relative bg-second w-3/4 md:1/2 lg:w-[30vw] flex flex-col items-center justify-center p-8 md:p-10 rounded-xl shadow-xl overflow-hidden">
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
                Delete Report
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
                onClick={handleDeleteReport}
              >
                DELETE
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

export default DeleteReport;
