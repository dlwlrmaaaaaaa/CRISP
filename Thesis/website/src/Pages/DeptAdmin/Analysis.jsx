import React, { useState, useEffect } from "react";
import {
  onSnapshot,
  collection,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "../../Firebase/firebaseConfig";
const db = getFirestore(app);
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import html2canvas from "html2canvas";

import logo from "../../assets/android-icon-square.png";
import Navbar from "./Navigation/NavBar";
import NavText from "./Navigation/NavText";
import ReportTrends from "../../Chart/ReportTrendsDept";
import ReportTimeTrends from "../../Chart/ReportTimeTrendsDept";
import axiosInstance from "../../axios-instance";
import Validation from "../../Chart/ValidationDept";
import Status from "../../Chart/StatusDept";

const Analysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedFilter, setSelectedFilter] = useState("month"); // Time filter state
  const [reports, setReports] = useState([]);
  const userId = localStorage.getItem("user_id");

  // Helper function to get the start of a day, week, month, or year
  const getStartOfPeriod = (filter) => {
    const now = new Date();
    switch (filter) {
      case "today":
        now.setHours(0, 0, 0, 0);
        return now;
      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
      case "month":
        now.setDate(1); // Set to the first day of the current month
        now.setHours(0, 0, 0, 0);
        return now;
      case "year":
        now.setMonth(0, 1); // Set to the first day of the current year
        now.setHours(0, 0, 0, 0);
        return now;
        return now;
      case "3 months":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3); // Subtract 3 months
        threeMonthsAgo.setDate(1); // Set to the first day of that month
        threeMonthsAgo.setHours(0, 0, 0, 0); // Set time to midnight
        return threeMonthsAgo;

      case "6 months":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6); // Subtract 6 months
        sixMonthsAgo.setDate(1); // Set to the first day of that month
        sixMonthsAgo.setHours(0, 0, 0, 0); // Set time to midnight
        return sixMonthsAgo;
      default:
        return null; // All-time (no filter)
    }
  };

  // Fetch reports from Firestore with date filtering
  const fetchDocuments = async (filter) => {
    const categories = [
      "fire accident",
      "street light",
      "potholes",
      "flood",
      "others",
      "fallen tree",
      "road accident",
    ];

    // Clear previous reports to avoid duplication
    setReports([]);

    const unsubscribeFunctions = categories.map((category) => {
      let q = collection(db, `reports/${category}/reports`);

      if (filter !== "all") {
        const startOfPeriod = getStartOfPeriod(filter);
        if (startOfPeriod) {
          // If filter is applied, fetch reports after the specified date
          q = query(q, where("report_date", ">=", startOfPeriod.toISOString()));
        }
      }

      return onSnapshot(q, (snapshot) => {
        const updateReports = snapshot.docs
          .map((doc) => ({
            ...doc.data(),
            category,
            id: doc.id, // Track unique document ID
          }))
          .filter((report) => report.assigned_to_id == userId);

        // Sort reports in descending order by report_date
        updateReports.sort(
          (a, b) => new Date(b.report_date) - new Date(a.report_date)
        );

        setReports((prevReports) => {
          // Avoid duplicate reports by using the document ID
          const newReports = updateReports.filter(
            (newReport) =>
              !prevReports.some((report) => report.id === newReport.id)
          );
          return [...prevReports, ...newReports]; // Add only new reports
        });

        // Log the reports fetched from Firestore (for debugging)
        // console.log("Fetched Reports for category:", category);
        // console.log(updateReports);
      });
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    fetchDocuments(selectedFilter);
  }, [selectedFilter]);

  const handleGenerateReportPDF = () => {
    setIsLoading(true);
    const doc = new jsPDF();

    // Add Title and Header on the first page
    doc.addImage(logo, "PNG", 90, 5, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COMMUNITY REPORTING INTERFACE FOR SAFETY AND PREVENTION", 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Community Report for this " + selectedFilter, 10, 40);
    doc.setFontSize(8);
    doc.text(
      "Generated on: " +
        new Date().toLocaleDateString() +
        " at " +
        new Date().toLocaleTimeString(),
      10,
      45
    );

    // Move directly to the table section (on the first page)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REPORTS SUMMARY:", 10, 52);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    // Table Header
    const headers = [
      "Reported By",
      "Category",
      "Report Date",
      "Location",
      "Status",
      "Latest Update",
    ];
    const tableStartY = 60;
    const rowHeight = 7;

    // Column positions (adjusted to fix header widths)
    const colWidths = [20, 13, 25, 35, 10, 25]; // Set appropriate column widths

    // Draw Table Header
    let xPosition = 10; // Starting position for the first column
    headers.forEach((header, index) => {
      doc.text(header, xPosition, tableStartY);
      xPosition += colWidths[index] + 10; // Move the xPosition for the next header based on width and some padding
    });

    // Draw horizontal line below the header
    doc.line(10, tableStartY + 2, xPosition, tableStartY + 2); // Adjust the y position as needed

    doc.setFont("helvetica", "normal");

    let currentYPosition = tableStartY + rowHeight + 2; // Position for first row after header
    const pageHeight = doc.internal.pageSize.height;

    // Draw Table Rows for each report
    reports.forEach((report, index) => {
      // Check if the row will fit on the current page
      if (currentYPosition + rowHeight > pageHeight) {
        // If not, add a new page and reset Y position
        doc.addPage();
        currentYPosition = 20; // Reset to start near the top of the new page
        doc.setFontSize(8);
        doc.text("REPORTS SUMMARY:", 10, currentYPosition);
        currentYPosition += rowHeight + 2; // Add some space after the title
        // Redraw the header on the new page
        xPosition = 10;
        headers.forEach((header, index) => {
          doc.text(header, xPosition, currentYPosition);
          xPosition += colWidths[index] + 10;
        });
        doc.line(10, currentYPosition + 2, xPosition, currentYPosition + 2); // Horizontal line after header
        currentYPosition += rowHeight + 2; // Space for first row after header on the new page
      }

      const reportFields = [
        report.username,
        report.category,
        `${new Date(report.report_date).toLocaleDateString()} at ${new Date(
          report.report_date
        ).toLocaleTimeString()}`,
        report.location.slice(0, 30), // Take the first 25 characters of the location
        report.status.toUpperCase(),
        `${new Date(report.update_date).toLocaleDateString()} at ${new Date(
          report.update_date
        ).toLocaleTimeString()}`,
      ];

      let rowXPosition = 10; // Starting position for the first column in each row
      reportFields.forEach((field, colIndex) => {
        doc.text(field, rowXPosition, currentYPosition);
        rowXPosition += colWidths[colIndex] + 10; // Move the xPosition for the next column based on width and some padding
      });

      // Draw horizontal line after each row
      doc.line(10, currentYPosition + 2, rowXPosition, currentYPosition + 2); // Line after row

      currentYPosition += rowHeight + 2; // Increment Y position for the next row
    });

    // Add a new page for the charts
    doc.addPage();
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Report Date Trends", 10, 12);
    doc.text("Report Trends Based on Time of the Dayn", 110, 12);
    doc.text("Distribution of Validated Reports", 10, 82);
    doc.text("Distribution of Report Status", 110, 82);

    // Function to capture a chart as an image and add it to the PDF
    const captureChart = (chartId, xPos, yPos, width, height) => {
      const chartElement = document.getElementById(chartId);

      if (chartElement) {
        return html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", xPos, yPos, width, height);
          return yPos + height + 10; // Return new y-position after adding the image
        });
      } else {
        return Promise.reject(new Error(`${chartId} not found`));
      }
    };

    // Define the charts and their positions on the second page
    const chartPromises = [
      captureChart("report-trends", 20, 15, 70, 60),
      captureChart("report-time-trends-chart", 110, 15, 90, 60),
      captureChart("pie-chart-validation", 10, 85, 90, 90),
      captureChart("pie-chart-status", 110, 85, 90, 90),
    ];

    // Wait for all charts to be captured before generating the PDF
    Promise.all(chartPromises)
      .then(() => {
        // Generate the PDF as a Blob
        const pdfBlob = doc.output("blob");

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

        setIsLoading(false);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.error("Error capturing charts:", err);
        setIsLoading(false);
      });
  };

  const handleGenerateReportExcel = async () => {
    setIsLoading1(true);
    try {
      const res = await axiosInstance.get("api/export-all-reports/", {
        responseType: "blob",
      });
      if (!res) {
        console.log("Error in generating report");
        return;
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.csv");
      document.body.appendChild(link);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in generating report", error);
    } finally {
      setIsLoading1(false);
    }
  };

  return (
    <>
      <div className="relative bg-second h-[100vh] w-[100vw] overflow-hidden">
        <div className="absolute inset-0 z-10">
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24 z-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0 z-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3 z-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10 z-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3 z-10"></div>
        </div>
        <div className="relative h-[100vh] w-[100vw] flex flex-col items-center z-30 overflow-auto overflow-x-hidden ">
          <Navbar />
          <NavText />
          <div className="grid grid-cols-1 lg:grid-cols-2 col-span-4 gap-16 justify-center items-center pt-5 mt-[30vh] md:mt-[30vh] lg:mt-[15vh] mb-[15vh]">
            {/* <PieChart
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            /> */}
            {/* <ReportByAreas
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            /> */}
            <ReportTrends
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            />
            <ReportTimeTrends
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            />
            <Validation
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            />
            <Status
              dateFilter={selectedFilter}
              setDateFilter={setSelectedFilter}
            />
          </div>
          {/* <ClusterBar
            dateFilter={selectedFilter}
            setDateFilter={setSelectedFilter}
          /> */}
          <button
            className="mt-10 px-4 py-2 bg-main text-white rounded"
            onClick={() => setIsModalOpen(true)} // Open the modal on button click
          >
            Generate Report
          </button>

          <div className="mb-[15vh]"></div>

          {/* Modal for selecting the time range */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-md shadow-lg">
                <h3 className="text-lg text-main font-bold mb-4">
                  Select Report Time Range
                </h3>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Past Month</option>
                  <option value="3 months">This Past 3 Months</option>
                  <option value="6 months">This Past 6 Months</option>
                  <option value="year">This Past Year</option>
                  <option value="all">All Time</option>
                </select>
                <div className="mt-4">
                  <button
                    className="mt-10 px-4 py-2 bg-main text-white rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenerateReportPDF();
                    }}
                  >
                    {isLoading ? (
                      <div role="status">
                        <svg
                          className="animate-spin h-8 w-5 text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 50 50"
                          stroke="currentColor"
                        >
                          <circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="125"
                            strokeDashoffset="50"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      "Generate PDF Report"
                    )}
                  </button>
                  {/* <button
                    className="mt-10 ml-4 px-4 py-2 bg-main text-white rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenerateReportExcel();
                    }}
                  >
                    {isLoading1 ? (
                      <div role="status">
                        <svg
                          className="animate-spin h-8 w-5 text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 50 50"
                          stroke="currentColor"
                        >
                          <circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="125"
                            strokeDashoffset="50"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      "Generate Excel Report"
                    )}
                  </button> */}
                  <button
                    className="py-3 px-4 ml-4 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Analysis;
