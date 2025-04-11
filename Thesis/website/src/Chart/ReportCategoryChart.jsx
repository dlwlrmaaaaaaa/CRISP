import React, { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import { app } from "../Firebase/firebaseConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const db = getFirestore(app);

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportCategoryChart = () => {
  const [reportCounts, setReportCounts] = useState({});
  const [dateFilter, setDateFilter] = useState("month");

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

  // Fetch documents from Firestore with date filtering
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

    // Clear previous counts to avoid doubling
    setReportCounts({});

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
        const count = snapshot.docs.length; // Count the number of documents in each category
        setReportCounts((prevCounts) => ({
          ...prevCounts,
          [category]: count, // Overwrite the previous count with the latest count
        }));
      });
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    fetchDocuments(dateFilter);
  }, [dateFilter]); // Fetch data whenever the date filter changes

  // Prepare data for the chart
  const chartData = {
    labels: Object.keys(reportCounts),
    datasets: [
      {
        label: "Number of Reports",
        data: Object.values(reportCounts),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)", // Fires
          "rgba(54, 162, 235, 0.6)", // Street Lights
          "rgba(255, 206, 86, 0.6)", // Potholes
          "rgba(79, 192, 75, 0.6)", // Floods
          "rgba(153, 102, 255, 0.6)", // Others
          "rgba(255, 159, 64, 0.6)", // Road Accident
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)", // Fires
          "rgba(54, 162, 235, 1)", // Street Lights
          "rgba(255, 206, 86, 1)", // Potholes
          "rgba(79, 192, 75, 1)", // Floods
          "rgba(153, 102, 255, 1)", // Others
          "rgba(255, 159, 64, 1)", // Road Accident
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-4/5 flex-grow h-[400px] mt-8 ml-8">
      <div className="font-bold text-md text-main">
        Report Counts by Category
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
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.raw} reports`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Report Categories",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Number of Reports",
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

export default ReportCategoryChart;
