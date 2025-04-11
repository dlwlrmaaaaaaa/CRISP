import React, { useState, useEffect, useRef } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

import { RiAttachment2 } from "react-icons/ri";
import { TiInfoLarge } from "react-icons/ti";
import { PiImages } from "react-icons/pi";

import ImageModal from "./ImageModal";
import Feedback from "./Feedback";
import DeleteReport from "./DeleteReport";
import Map from "../../Components/Modals/Map";
import Maps2 from "../../Components/Modals/Maps2";
import ReportPDF from "../../Components/Modals/reportPDF";

import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Add these imports for Firestore operations
import { app } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../AuthContext/AuthContext";
import { use } from "react";

const db = getFirestore(app);

const ReviewReport = ({
  isVisible,
  onClose,
  userName,
  location,
  reportType,
  description,
  date,
  reportStatus,
  assignedTo,
  attachment,
  workerFeedback,
  workerFeedbackDesc,
  upvote,
  downvote,
  feedback,
  proof,
  reportId,
  reportedType,
  reportValidated,
  openTime,
  lat,
  long,
  closedTime,
  respondTime,
  validationTime,
  workers,
  falseCount,
}) => {
  if (!isVisible) return null;

  const [showImageModal, setShowImageModal] = useState(false);
  const [showFeeedback, setShowFeeedback] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [workerList, setWorkerList] = useState("");
  const { user } = useAuth();
  const account_type = localStorage.getItem("accountType");

  const [mapImage, setMapImage] = useState(null);

  const handleMapCapture = (imageData) => {
    setMapImage(imageData);
  };

  const openPDFInNewTab = async () => {
    if (!mapImage) {
      // Handle case if map image is not available
      alert("Please wait until the map image is captured.");
      return;
    }

    // Generate the PDF Blob using @react-pdf/renderer
    const pdfBlob = await pdf(
      <ReportPDF
        userName={userName || "Unknown"}
        location={location || "Unknown Location"}
        reportType={reportType || "N/A"}
        description={description || "No Description"}
        date={date || "N/A"}
        reportStatus={reportStatus || "Pending"}
        assignedTo={deptName.name || "Unassigned"} // Extract the name
        attachment={attachment}
        upvote={upvote || 0}
        downvote={downvote || 0}
        feedback={feedback || "No feedback"}
        proof={proof || "No proof available"}
        reportId={reportId || "N/A"}
        reportedType={reportedType || "Unknown"}
        reportValidated={reportValidated || false}
        openTime={openTime || "N/A"}
        lat={lat || 0}
        long={long || 0}
        closedTime={closedTime || 0}
        respondTime={respondTime || 0}
        validationTime={validationTime || 0}
        workers={workerList || "No workers"}
        mapImage={mapImage}
        workerFeedbackDesc={workerFeedbackDesc || "No feedback"}
      />
    ).toBlob();

    // Create a Blob URL for the PDF
    const pdfURL = URL.createObjectURL(pdfBlob);

    // Open the PDF in a new tab
    const newTab = window.open(pdfURL, "_blank");

    // OPTIONAL: Trigger a download with a custom filename in the new tab
    if (newTab) {
      const link = document.createElement("a");
      link.href = pdfURL;
      link.download = "Report.pdf"; // Set the desired filename
      newTab.onload = () => {
        newTab.document.body.appendChild(link);
        link.click();
        link.remove();
      };
    }
  };

  useEffect(() => {
    setUsername(user.username);
  }, [user]);
  useEffect(() => {
    if (workers.length > 0) {
      const workerUsernames = workers.map((worker) => worker.username);
      setWorkerList(workerUsernames.join(", "));
    }
  }, [workers]);
  const departments = [
    {
      id: 1,
      name: "Fire Department",
    },
    {
      id: 2,
      name: "Medical Department",
    },
    {
      id: 3,
      name: "Police Department",
    },
    {
      id: 4,
      name: "Street Maintenance Department",
    },
    {
      id: 5,
      name: "Pothole Repair Department",
    },
    {
      id: 6,
      name: "General Department",
    },
    {
      id: 7,
      name: "Department of Public Works",
    },
  ];
  const deptName = departments.find((dept) => dept.id === assignedTo);

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleDeleteModal = () => {
    setShowDeleteModal(true);
  };

  function convertToDaysHoursMinutes(time) {
    // Split time into hours and minutes
    const [hours, minutes] = time.split(":").map(Number);

    // Convert total time into minutes
    const totalMinutes = hours * 60 + minutes;

    // Calculate days, hours, and minutes
    const days = Math.floor(totalMinutes / 1440); // 1440 minutes in a day
    const remainingMinutes = totalMinutes % 1440;
    const hoursLeft = Math.floor(remainingMinutes / 60);
    const minutesLeft = remainingMinutes % 60;

    // Build the result string with conditional formatting
    let result = "";

    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""}`;
    }

    if (hoursLeft > 0) {
      if (result) result += ", "; // Add separator if days were already added
      result += `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
    }

    if (minutesLeft > 0 || (days === 0 && hoursLeft === 0)) {
      if (result) result += ", "; // Add separator if days or hours were already added
      result += `${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}`;
    }

    return result;
  }

  const handleValidateClick = async () => {
    const localDate = new Date();
    const localOffset = localDate.getTimezoneOffset() * 60000;
    const localTimeAdjusted = new Date(localDate.getTime() - localOffset);
    const localDateISOString = localTimeAdjusted.toISOString().slice(0, -1);

    const reportRef = doc(
      db,
      `reports/${reportType.toLowerCase()}/reports/${reportId}`
    );

    try {
      // Fetch the report data to get the report_date
      const reportSnapshot = await getDoc(reportRef);

      if (reportSnapshot.exists()) {
        const reportData = reportSnapshot.data();

        // Ensure the report contains the 'report_date' field
        if (reportData && reportData.report_date) {
          const createdAt = new Date(reportData.report_date);

          // Calculate the time taken to validate the report
          const validationTime = new Date(localDateISOString);

          // Ensure that both dates are valid Date objects
          if (createdAt instanceof Date && validationTime instanceof Date) {
            const timeDiffInMilliseconds =
              validationTime.getTime() - createdAt.getTime();
            const timeDiffInMinutes = timeDiffInMilliseconds / (1000 * 60);

            // Calculate the hours and minutes
            const hours = Math.floor(timeDiffInMinutes / 60);
            const minutes = Math.floor(timeDiffInMinutes % 60);

            // Format time as hours:minutes (e.g., "2:51")
            const formattedTime = `${hours}:${minutes
              .toString()
              .padStart(2, "0")}`;

            // Proceed with the validation and updating the report
            await setDoc(
              reportRef,
              {
                is_validated: true,
                update_date: localDateISOString,
                validated_date: localDateISOString,
                validated_by: username,
                validation_time: formattedTime, // Add validation time
              },
              { merge: true }
            );
            alert("Report validated successfully!");
            onClose(); // Close the modal
          } else {
            console.error("Invalid date objects for validation calculation.");
          }
        } else {
          console.error("Missing or invalid 'report_date' in report data.");
        }
      } else {
        console.error("Report document does not exist.");
      }
    } catch (error) {
      console.error("Error validating report:", error);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-[100svh] items-center justify-center bg-black/50 flex z-30 font-figtree">
        <div
          className="w-full min-h-[100svh] max-h-[100svh] py-12 px-4 overflow-auto flex justify-center items-start"
          id="container"
          onClick={(e) => {
            if (e.target.id === "container") {
              onClose();
              //   setActiveDetails(false);
            }
          }}
        >
          <div
            // ref={printRef}
            className="relative w-full lg:w-3/4 bg-second flex flex-col items-center justify-center p-8 md:p-10 rounded-xl shadow-xl overflow-hidden"
          >
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
                Report Details
              </p>
            </div>
            <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-4 lg:gap-12 z-20">
              {/* Information Section */}
              <div className="w-full lg:w-1/2 flex flex-col mt-4">
                <div className="w-full flex flex-row gap-2 items-center justify-start py-2 px-1">
                  <div className="p-2 bg-main rounded-full text-white shadow-xl">
                    <TiInfoLarge className="text-sm" />
                  </div>
                  <p className="text-xs text-main font-bold">
                    Information Section
                  </p>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                    <p className="text-xs font-semibold">Report Type</p>
                  </div>
                  <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                    <p className="text-xs font-extrabold  text-main uppercase truncate">
                      {reportType}
                    </p>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                    <p className="text-xs font-semibold ">Reported by</p>
                  </div>
                  <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                    <p className="text-xs font-semibold text-gray-500 truncate">
                      {userName}
                    </p>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center py-2">
                  <div className="flex justify-start items-center w-full py-2">
                    <p className="text-xs font-semibold ">Description</p>
                  </div>
                  <div className="p-4 rounded-md bg-white w-full border text-gray-500 border-main">
                    <textarea
                      name=""
                      id=""
                      rows={4}
                      className="outline-none bg-white w-full resize-none text-xs font-normal"
                      placeholder="Actions or Remarks"
                      value={description}
                      readOnly={true}
                    ></textarea>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-4 items-center justify-center">
                  <div className="w-1/2 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold ">Date & Time</p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full bg-white resize-none outline-none text-xs font-normal">
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          {date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold ">Status</p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold uppercase truncate">
                          {reportStatus === "assigned" ? (
                            <span className="truncate text-[#a10b00]">
                              {reportStatus}
                            </span>
                          ) : reportStatus === "ongoing" ? (
                            <span className="font-bold text-[#007a3f]">
                              {reportStatus}
                            </span>
                          ) : (
                            <span className="font-bold text-[#363636]">
                              {reportStatus}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-row gap-4 items-center justify-center truncate">
                  <div className="w-1/2 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Assigned Department
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full bg-white resize-none outline-none text-xs font-normal">
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          {deptName ? deptName.name : "Not yet assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col items-center justify-center truncate">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Assigned Worker
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full bg-white resize-none outline-none text-xs font-normal">
                        <span className="text-xs font-semibold text-gray-500 truncate">
                          {/* {assignedTo} */}
                          {workerList ? workerList : "Not yet assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-4 items-center justify-center truncate">
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Validation Time
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full bg-white resize-none outline-none text-xs font-normal ">
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          {validationTime
                            ? convertToDaysHoursMinutes(validationTime)
                            : "Not yet validated"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold ">Likes</p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {upvote}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold ">Dislikes</p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {downvote}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold ">Mark as False</p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {Array.isArray(falseCount) && falseCount.length === 0
                            ? "0"
                            : falseCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-4 items-center justify-center truncate">
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Report Open For
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {closedTime
                            ? convertToDaysHoursMinutes(closedTime)
                            : openTime
                            ? openTime
                            : "Not yet opened"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center truncate">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Responding Time
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {respondTime
                            ? convertToDaysHoursMinutes(respondTime)
                            : "Not responded yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center truncate">
                    <div className="flex items-center justify-start w-full py-2 px-1">
                      <p className="text-xs font-semibold truncate">
                        Report Close Time
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-center p-4 bg-white rounded-md border border-main">
                      <div className="w-full flex bg-white resize-none outline-none text-xs items-center justify-center">
                        <p className="text-xs font-bold text-gray-500 truncate">
                          {closedTime
                            ? convertToDaysHoursMinutes(closedTime)
                            : "Report is still open"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* attachment and button section */}
              <div className="w-full lg:w-1/2 flex flex-col mt-4">
                <div className="w-full flex flex-row gap-2 items-center justify-start py-2 px-1">
                  <div className="p-2 bg-main rounded-full text-white shadow-xl">
                    <RiAttachment2 className="text-sm" />
                  </div>
                  <p className="text-xs text-main font-bold">
                    Attachment Section
                  </p>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                    <p className="text-xs font-semibold ">Location</p>
                  </div>
                  <div className="bg-white w-full flex flex-col items-start border border-main rounded-md">
                    <div className="w-full h-[225px] rounded-md overflow-hidden cursor-pointer mb-3">
                      <Maps2
                        lat={lat}
                        lon={long}
                        onMapCapture={handleMapCapture}
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 mx-3">
                      {location}
                    </p>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  {reportStatus === "done" ||
                  reportStatus === "Under Review" ? (
                    <>
                      <div className="w-full flex flex-row items-center justify-center mt-2 gap-3">
                        {attachment && attachment.length > 0 ? (
                          <div className="w-full flex flex-col">
                            <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                              <p className="text-xs font-semibold ">Before</p>
                            </div>
                            <div
                              className="w-full md:h-[200px] h-[100px] rounded-md overflow-hidden cursor-pointer border border-main mb-3"
                              onClick={handleImageClick}
                            >
                              <img
                                src={attachment}
                                className="w-full h-full object-cover object-center hover:scale-105 ease-in-out duration-500"
                                alt={`Image ${attachment}`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full md:h-[200px] h-[100px] bg-white rounded-md flex flex-col items-center justify-center border border-main">
                            <PiImages className="text-xl" />
                            <p className="text-xs font-normal">No media file</p>
                          </div>
                        )}

                        {attachment && attachment.length > 0 ? (
                          <div className="w-full flex flex-col">
                            <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                              <p className="text-xs font-semibold ">After</p>
                            </div>
                            <div
                              className="w-full md:h-[200px] h-[100px] rounded-md overflow-hidden cursor-pointer border border-main mb-3"
                              onClick={handleImageClick}
                            >
                              <img
                                src={workerFeedback}
                                className="w-full h-full object-cover object-center hover:scale-105 ease-in-out duration-500"
                                alt={`Image ${workerFeedback}`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full md:h-[200px] h-[100px] bg-white rounded-md flex flex-col items-center justify-center border border-main">
                            <PiImages className="text-xl" />
                            <p className="text-xs font-normal">No media file</p>
                          </div>
                        )}
                      </div>
                      <div className="w-full flex flex-col items-center justify-center">
                        <div className="flex justify-start items-center w-full py-2">
                          <p className="text-xs font-semibold ">
                            Worker Remarks
                          </p>
                        </div>
                        <div className="p-4 rounded-md bg-white w-full border text-gray-500 border-main">
                          <textarea
                            name=""
                            id=""
                            rows={2}
                            className="outline-none bg-white w-full resize-none text-xs font-normal"
                            placeholder="Actions or Remarks"
                            value={workerFeedbackDesc}
                            readOnly={true}
                          ></textarea>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                        <p className="text-xs font-semibold mt-3">Attachment</p>
                      </div>
                      {attachment && attachment.length > 0 ? (
                        <div
                          className="w-full md:h-[250px] h-[150px] rounded-md overflow-hidden cursor-pointer border border-main mb-3"
                          onClick={handleImageClick}
                        >
                          <img
                            src={attachment}
                            className="w-full h-full object-cover object-center hover:scale-105 ease-in-out duration-500"
                            alt={`Image ${attachment}`}
                          />
                        </div>
                      ) : (
                        <div className="w-full md:h-[250px] h-[150px] bg-white rounded-md flex flex-col items-center justify-center border border-main">
                          <PiImages className="text-xl" />
                          <p className="text-xs font-normal">No media file</p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="w-full flex flex-row gap-4 items-center justify-end mt-5">
                    <button
                      className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                      onClick={openPDFInNewTab}
                    >
                      DOWNLOAD
                    </button>

                    {!reportValidated &&
                      account_type !== "department_admin" && (
                        <button
                          className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                          onClick={handleValidateClick}
                        >
                          VALIDATE
                        </button>
                      )}

                    {/* <button className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate">
                      ASSIGN
                    </button> */}
                    <button
                      className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                      onClick={handleDeleteModal}
                    >
                      DELETE
                    </button>
                    <button
                      className="py-3 px-4 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                      onClick={() => {
                        onClose();
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ImageModal
        isVisible={showImageModal}
        onClose={() => setShowImageModal(false)}
        attachment={attachment}
      />
      <Feedback
        isVisible={showFeeedback}
        onClose={() => setShowFeeedback(false)}
        feedback={feedback}
        attachment={proof}
      />
      <DeleteReport
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        reportId={reportId}
        reportedType={reportedType}
      />
      {/* <Maps2 lat={lat} lon={long} onMapCapture={handleMapCapture} /> */}
    </>
  );
};

export default ReviewReport;
