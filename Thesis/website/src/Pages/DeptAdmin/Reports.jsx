import React, { useEffect, useState } from "react";

import Data from "../../JSON/reports.json";
import Navbar from "./Navigation/NavBar";
import NavText from "./Navigation/NavText";
import ReviewReport from "../../Components/Modals/ReviewReport";

import {
  FaAngleLeft,
  FaAngleRight,
  FaFire,
  FaWater,
  FaCar,
} from "react-icons/fa";
import { GiHole } from "react-icons/gi";
import { FaTrafficLight } from "react-icons/fa6";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useAuth } from "../../AuthContext/AuthContext";

const Reports = () => {
  const { reports } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState("");
  const [customType, setCustomType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [attachment, setAttachment] = useState(null); // Assuming attachment might be a file
  const [upvote, setUpvote] = useState(0);
  const [downvote, setDownvote] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isValidated, setIsValidated] = useState("");
  const [proof, setProof] = useState("");
  const [reportId, setReportId] = useState([]);
  const [reportValidated, setReportValidated] = useState(false);
  const [reportedType, setReportedType] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [closedTime, setClosedTime] = useState("");
  const [respondTime, setRespondTime] = useState("");
  const [validationTime, setValidationTime] = useState("");
  const [workerFeedback, setWorkerFeedback] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerFeedbackDesc, setWorkerFeedbackDesc] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of items per page
  const [filterOpen, setFilterOpen] = useState(false); // State for dropdown filter
  const [selectedReportType, setSelectedReportType] = useState(""); // Selected report type filter
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status filter
  const [newReports, setNewReports] = useState([]);
  const user_id = localStorage.getItem("user_id");

  // Filter data based on selected filters
  const filteredData = reports.filter((item) => {
    return (
      (selectedReportType === "" ||
        item.type_of_report === selectedReportType) &&
      (selectedStatus === "" || item.status === selectedStatus) &&
      item.assigned_to_id == user_id
    );
  });

  const sortedData = filteredData.sort(
    (a, b) => new Date(b.update_date) - new Date(a.update_date)
  );

  // Pagination logic
  const totalItems = sortedData.length; // Total items based on filtered data
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Create an array of page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Handle page navigation
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Get unique report types and statuses for dropdown options
  // const reportTypes = [...new Set(reports.map((item) => item.type_of_report))];
  const statuses = [...new Set(reports.map((item) => item.status))];

  // useEffect(() => {
  //   console.log("Reports from AuthContext:", feedback);
  // }, [feedback]);

  const timeElapsed = (reportDate) => {
    const now = new Date();
    const reportDateTime = new Date(reportDate);
    const timeDiff = now - reportDateTime;

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Calculate remaining time after extracting full days
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    let result = "";

    // Show days if any
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""}`;
    }

    // Show hours if any
    if (remainingHours > 0) {
      if (result) result += ", "; // Add a separator if we already have days
      result += `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
    }

    // Show minutes if any
    if (remainingMinutes > 0) {
      if (result) result += ", "; // Add a separator if we already have days or hours
      result += `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    }

    return result;
  };

  const getIcon = (type) => {
    switch (type) {
      case "fire":
        return <FaFire className="text-[#2f2f2f] text-xl" />;
      case "floods":
        return <FaWater className="text-[#2f2f2f] text-xl" />;
      case "road accident ":
        return <FaCar className="text-[#2f2f2f] text-xl" />;
      case "street lights":
        return <FaTrafficLight className="text-[#2f2f2f] text-xl" />;
      case "potholes":
        return <GiHole className="text-[#2f2f2f] text-xl" />;
      default:
        return <HiOutlineDocumentReport className="text-[#2f2f2f] text-xl" />;
    }
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

  return (
    <>
      <div className="relative bg-second h-[100vh] w-[100vw] overflow-hidden">
        {/* bg square */}
        <div className="absolute inset-0 z-10">
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
        </div>

        {/* content */}
        <div className="relative h-[100vh] w-[100vw] flex flex-col items-center z-30 overflow-auto">
          <Navbar />
          <NavText />
          <div className="flex pt-5 mb-[5vh] mt-[30vh] md:mt-[30vh] lg:mt-[20vh]">
            <div className="bg-white border-2 border-main flex flex-col rounded-lg antialiased min-h-[70vh] w-[90vw] mx-10">
              {/* header and filter button */}
              <div className="flex flex-row justify-between bg-main">
                <div className="flex justify-center items-center py-3 px-8">
                  <p className="text-white font-semibold text-sm">reports</p>
                </div>
                {/* filter */}
                <div>
                  <button
                    className={`font-bold text-sm py-3 px-6 border border-b-main rounded-t-lg hover:bg-main hover:text-accent ease-in-out duration-500 text-center cursor-pointer h-full ${
                      filterOpen ? "bg-main text-white" : "bg-white text-main"
                    }`}
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    FILTER
                  </button>
                  {filterOpen && (
                    <div className="absolute top-auto right-10 mt-2 bg-white border rounded-md shadow-lg w-48">
                      <div className="p-2 border-t">
                        <p className="font-bold text-main">Status</p>
                        <ul className="list-disc pl-4">
                          <div>
                            <button
                              onClick={() => {
                                setSelectedStatus("");
                                setFilterOpen(
                                  (prevFilterOpen) => !prevFilterOpen
                                );
                              }}
                              className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                selectedStatus === ""
                                  ? "font-bold text-main"
                                  : "text-textSecond"
                              }`}
                            >
                              All
                            </button>
                          </div>
                          {statuses.map((status, index) => (
                            <div key={index}>
                              <button
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setFilterOpen(
                                    (prevFilterOpen) => !prevFilterOpen
                                  );
                                }}
                                className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                  selectedStatus === status
                                    ? "font-bold text-main"
                                    : "text-textSecond"
                                }`}
                              >
                                {status}
                              </button>
                            </div>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* card report  */}
              <div className="w-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:justify-start justify-center items-center">
                {currentData.length === 0 ? (
                  <p className="text-center text-gray-500">No reports found</p>
                ) : (
                  currentData.map((data, index) => {
                    const reportDate = new Date(data.report_date);
                    const formattedDate = reportDate.toLocaleDateString(); // Format date
                    const formattedTime = reportDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const updateDate = new Date(data.update_date);
                    const formattedDate1 = updateDate.toLocaleDateString(); // Format date
                    const formattedTime1 = updateDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={index}
                        className="bg-[#FAF5FF] w-full h-full border border-main rounded-lg p-6 flex flex-col mt-2 overflow-hidden"
                      >
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <div className="flex gap-4">
                            <div className="flex items-center justify-center rounded-md">
                              <div className="bg-square p-4 rounded-lg">
                                {getIcon(data.type_of_report.toLowerCase())}
                              </div>
                            </div>
                            <div className="flex flex-col justify-between py-1 w-full">
                              <div className="grid gap-1 text-start">
                                <p className="text-xs font-bold text-[#2f2f2f] text-center uppercase truncate">
                                  {data.custom_type
                                    ? data.type_of_report +
                                      " , " +
                                      data.custom_type
                                    : data.type_of_report}
                                </p>
                                <p className="text-xs font-bold text-[#113e21] truncate">
                                  {data.username}
                                </p>
                                <p className="text-xs font-normal text-[#2f2f2f] capitalize overflow-hidden text-ellipsis line-clamp-2 ">
                                  {data.location}
                                </p>
                                <p
                                  className={`text-xs font-bold capitalize truncate ${
                                    data.is_validated
                                      ? "text-[#007a3f]"
                                      : "text-[#a10b00]"
                                  }`}
                                >
                                  {data.is_validated
                                    ? "VALIDATED"
                                    : "NOT VALIDATED"}
                                </p>
                                <p className="text-xs font-bold text-[#2f2f2f] capitalize truncate">
                                  {data.assigned_to
                                    ? data.assigned_to
                                    : "Not Assigned"}
                                </p>
                                {/* Date and Time */}
                                <p className="text-xs font-normal text-[#2f2f2f]">
                                  Report Date: {formattedDate} at{" "}
                                  {formattedTime}
                                </p>
                                {/* Date and Time */}
                                <p className="text-xs font-normal text-[#2f2f2f]">
                                  Last Update: {formattedDate1} at{" "}
                                  {formattedTime1}
                                </p>
                                <p className="text-xs capitalize">
                                  Status:{" "}
                                  {data.status === "Pending" ? (
                                    <span className="text-[#a10b00] font-bold">
                                      {data.status.toUpperCase()}
                                    </span>
                                  ) : data.status === "done" ? (
                                    <span className="text-[#007a3f] font-bold">
                                      {data.status.toUpperCase()}
                                    </span>
                                  ) : data.status === "reviewing" ? (
                                    <span className="text-[#6e4615] font-bold">
                                      {data.status.toUpperCase()}
                                    </span>
                                  ) : data.status === "ongoing" ? (
                                    <span className="text-[#FFA500] font-bold">
                                      {data.status.toUpperCase()}
                                    </span>
                                  ) : (
                                    <span className="text-[#363636] font-bold">
                                      {data.status.toUpperCase()}
                                    </span>
                                  )}
                                </p>
                                {data.validation_time && (
                                  <p className="text-xs font-normal text-[#2f2f2f] truncate">
                                    {`Validation Time: `}
                                    <strong>
                                      {convertToDaysHoursMinutes(
                                        data.validation_time
                                      )}
                                    </strong>
                                  </p>
                                )}
                                {data.review_elapsed_time && (
                                  <p className="text-xs font-normal text-[#2f2f2f] truncate">
                                    {`Responding Time: `}
                                    <strong>
                                      {convertToDaysHoursMinutes(
                                        data.review_elapsed_time
                                      )}
                                    </strong>
                                  </p>
                                )}
                                {data.report_closed_time && (
                                  <p className="text-xs font-normal text-[#2f2f2f] truncate">
                                    {`Report Close Time: `}
                                    <strong>
                                      {convertToDaysHoursMinutes(
                                        data.report_closed_time
                                      )}
                                    </strong>
                                  </p>
                                )}
                                {data.status !== "done" && (
                                  <p className="text-xs font-normal text-[#2f2f2f]">
                                    {`Report Open For: `}
                                    <strong>
                                      {timeElapsed(data.report_date)}
                                    </strong>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center items-center mt-4">
                          <button
                            className="bg-main text-white w-full py-2 px-4 font-semibold rounded-md hover:bg-textSecond hover:scale-105 ease-in-out duration-500 truncate"
                            onClick={() => {
                              setShowReport(true);
                              setName(data.username);
                              setLocation(data.location);
                              setReportType(
                                data.custom_type
                                  ? data.type_of_report +
                                      " , " +
                                      data.custom_type
                                  : data.type_of_report
                              );
                              setDescription(data.report_description);
                              setDate(`${formattedDate} ${formattedTime}`);
                              setStatus(data.status);
                              setAssignedTo(data.department_id);
                              setAttachment(data.image_path);
                              setUpvote(data.upvote);
                              setDownvote(data.downvote);
                              setFeedback(data.feedback);
                              setProof(data.proof);
                              setIsValidated(data.is_validated);
                              setReportId(data.id);
                              setWorkers(data.workers);
                              data.workerFeedback[0] &&
                                setWorkerFeedback(data.workerFeedback[0].proof);
                              data.workerFeedback[0] &&
                                setWorkerFeedbackDesc(
                                  data.workerFeedback[0].description
                                );
                              setReportedType(data.type_of_report);
                              setReportValidated(data.is_validated);
                              setOpenTime(timeElapsed(data.report_date));
                              setLat(data.latitude);
                              setLong(data.longitude);
                              setClosedTime(data.report_closed_time);
                              setRespondTime(data.review_elapsed_time);
                              setValidationTime(data.validation_time);
                            }}
                          >
                            {"REVIEW"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* pagination  */}
              {totalPages > 1 && (
                <div className="flex flex-row gap-1 items-center justify-end w-full px-12 py-6">
                  <button
                    className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                    }}
                    disabled={currentPage === 1}
                  >
                    <FaAngleLeft className="text-xs text-main" />
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`p-1 ease-in-out duration-500 font-semibold ${
                        pageNumber === currentPage
                          ? "text-md text-main font-bold"
                          : "text-xs text-textSecond font-semibold"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      nextPage();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <FaAngleRight className="text-xs text-main" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewReport
        isVisible={showReport}
        onClose={() => setShowReport(false)}
        userName={name}
        location={location}
        reportType={reportType}
        description={description}
        date={date}
        reportStatus={status}
        assignedTo={assignedTo}
        attachment={attachment}
        workerFeedback={workerFeedback}
        workerFeedbackDesc={workerFeedbackDesc}
        upvote={upvote}
        downvote={downvote}
        feedback={feedback}
        proof={proof}
        isValidated={isValidated}
        reportId={reportId}
        reportedType={reportedType}
        reportValidated={reportValidated}
        openTime={openTime}
        lat={lat}
        long={long}
        closedTime={closedTime}
        respondTime={respondTime}
        validationTime={validationTime}
        workers={workers}
      />
    </>
  );
};

export default Reports;
