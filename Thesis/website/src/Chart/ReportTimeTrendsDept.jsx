import React, { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { app } from "../Firebase/firebaseConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

const db = getFirestore(app);

// Register the necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportTimeTrends = ({ dateFilter, setDateFilter }) => {
  const [reports, setReports] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [], // Hour labels (e.g., "0:00", "1:00", ..., "23:00")
    datasets: [], // Dataset for the number of reports created at each hour
  });

  const userId = localStorage.getItem("user_id"); // Get the current user ID from localStorage

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
      "pothole",
      "flood",
      "others",
      "fallen tree",
      "road accident",
    ];

    setReports([]); // Clear previous reports when filtering

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
            id: doc.id, // Track unique document ID
          }))
          .filter((report) => report.assigned_to_id == userId); // Filter reports by assigned_to_id

        setReports((prevReports) => {
          // Avoid duplicate reports by using the document ID
          const newReports = updateReports.filter(
            (newReport) =>
              !prevReports.some((report) => report.id === newReport.id)
          );
          return [...prevReports, ...newReports]; // Add only new reports
        });
      });
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    fetchDocuments(dateFilter);
  }, [dateFilter]); // Fetch data whenever the date filter changes

  useEffect(() => {
    if (reports.length > 0) {
      const reportCounts = Array(24).fill(0); // Initialize an array with 24 slots (for each hour)

      // Count the number of reports for each hour of the day
      reports.forEach((report) => {
        // Assuming report_date is an ISO string, parse it correctly
        const timestamp = new Date(report.report_date); // The timestamp from Firestore
        const hour = timestamp.getUTCHours(); // Use getUTCHours() to avoid time zone discrepancies

        reportCounts[hour] += 1; // Increment the count for that hour
      });

      // Prepare data for the chart
      const labels = Array.from({ length: 24 }, (_, index) => `${index}:00`); // ["0:00", "1:00", ..., "23:00"]

      setChartData({
        labels: labels, // Hour labels for x-axis
        datasets: [
          {
            label: "Number of Reports",
            data: reportCounts, // Number of reports for each hour
            fill: false,
            backgroundColor: "rgba(75, 192, 192, 0.4)", // Light green color
            borderColor: "rgba(75, 192, 192, 1)", // Dark green color
            tension: 0.1, // Smooth lines
          },
        ],
      });
    } else {
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  }, [reports]);

  return (
    <div className="w-4/5 flex-grow h-[400px] mt-8 ml-8">
      <div className="font-bold text-md text-main">
        Report Trends Based on Time of the Day
      </div>

      {/* Dropdown for Date Filter */}
      <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2 font-semibold text-sm">
          Select Date Filter:{" "}
        </label>
        <select
          id="dateFilter"
          onChange={(e) => setDateFilter(e.target.value)}
          value={dateFilter}
          className="p-1 border rounded-md text-xs border-main"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {chartData.labels.length > 0 ? (
        <Line
          id="report-time-trends-chart"
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.raw} reports`;
                  },
                },
              },
              datalabels: {
                display: false, // Disable data labels
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Time of Day (Hour)",
                },
                grid: {
                  display: true,
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Number of Reports",
                },
                grid: {
                  display: true,
                },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <div className="text-center text-gray-500 mt-8">No data available</div>
      )}
    </div>
  );
};

export default ReportTimeTrends;
