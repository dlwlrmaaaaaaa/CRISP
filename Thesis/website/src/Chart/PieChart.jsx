import React, { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { app } from "../Firebase/firebaseConfig";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin

const db = getFirestore(app);

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels); // Register the plugin

const PieChart = ({
  dateFilter,
  setDateFilter,
  selectedCategory,
  setCategoryFilter,
}) => {
  const [reportCounts, setReportCounts] = useState({});

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

  const fetchDocuments = async (filter, category) => {
    // Reset counts to avoid displaying stale data
    setReportCounts({});

    const categories = [
      "fire accident",
      "street light",
      "pothole",
      "flood",
      "others",
      "fallen tree",
      "road accident",
    ];
    // If "all" is selected for category, fetch for all categories
    const categoriesToFetch = category === "all" ? categories : [category];

    const unsubscribeFunctions = categoriesToFetch.map((category) => {
      let q = collection(db, `reports/${category}/reports`);

      if (filter !== "all") {
        const startOfPeriod = getStartOfPeriod(filter);
        if (startOfPeriod) {
          // If filter is applied, fetch reports after the specified date
          q = query(q, where("report_date", ">=", startOfPeriod.toISOString()));
        }
      }

      // console.log(`Fetching reports for ${category} with filter: ${filter}`);
      return onSnapshot(q, (snapshot) => {
        const count = snapshot.docs.length; // Count the number of documents in each category
        // console.log(`${category} count:`, count); // Debug log to verify count
        setReportCounts((prevCounts) => ({
          ...prevCounts,
          [category]: count, // Replace the previous count with the current count
        }));
      });
    });

    // Cleanup function to unsubscribe from listeners when the component unmounts
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    fetchDocuments(dateFilter, selectedCategory);
  }, [dateFilter, selectedCategory]); // Fetch data whenever the date filter changes

  // Prepare data for the chart
  const chartData = {
    labels: Object.keys(reportCounts),
    datasets: [
      {
        data: Object.values(reportCounts),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)", // Fires
          "rgba(54, 162, 235, 0.6)", // Street Lights
          "rgba(255, 206, 86, 0.6)", // Potholes
          "rgba(79, 192, 75, 0.6)", // Floods
          "rgba(153, 102, 255, 0.6)", // Others
          "rgba(255, 159, 64, 0.6)", // Road Accident
          "rgba(35, 262, 162, 0.6)", // Teal
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)", // Fires
          "rgba(54, 162, 235, 1)", // Street Lights
          "rgba(255, 206, 86, 1)", // Potholes
          "rgba(79, 192, 75, 1)", // Floods
          "rgba(153, 102, 255, 1)", // Others
          "rgba(255, 159, 64, 1)", // Road Accident
          "rgba(35, 262, 162, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-screen flex-grow h-[400px] justify-center items-center mt-8 ml-8">
      <div className="font-bold text-md text-main">
        Distribution of Reports by Category
      </div>

      {/* Dropdown for Date Filter */}
      {/* <div className="mb-4">
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
      </div> */}

      {chartData.labels.length > 0 ? (
        <Pie
          id="pie-chart"
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              datalabels: {
                color: "#000", // Label text color
                font: {
                  weight: "normal", // Make the text bold
                  size: 11, // Adjust the font size
                },
                formatter: (value, context) => {
                  // Hide labels for slices with a value of 0
                  if (value === 0) {
                    return null; // or return "";
                  }
                  // Display the label and value for non-zero slices
                  return `${
                    context.chart.data.labels[context.dataIndex]
                  }:${value}`;
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const value = context.raw;
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${context.label}: ${percentage}% (${value} reports)`;
                  },
                },
              },
            },
            cutout: "50%", // This line makes it a donut chart
          }}
        />
      ) : (
        <div className="text-center text-gray-500 mt-8">No data available</div>
      )}
    </div>
  );
};

export default PieChart;
