import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
import { app } from "../Firebase/firebaseConfig";
import { Chart, registerables } from "chart.js";
import { getAddressFromCoordinates } from "../utils/getAddressFromCoordinates";

Chart.register(...registerables);

const db = getFirestore(app);

const ReportByAreas = ({
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

  // Note: We're no longer declaring fetchDocuments as async.
  const fetchDocuments = (filter, category) => {
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

    // We'll accumulate counts here
    const addressCounts = {};

    const unsubscribeFunctions = categoriesToFetch.map((category) => {
      let collRef = collection(db, `reports/${category}/reports`);
      let q = collRef;

      if (filter && filter !== "all") {
        const startOfPeriod = getStartOfPeriod(filter);
        if (startOfPeriod) {
          // Assuming report_date is stored as a Timestamp/Date,
          // pass the Date object directly.
          q = query(q, where("report_date", ">=", startOfPeriod.toISOString()));
        }
      }

      return onSnapshot(q, (snapshot) => {
        // console.log(
        //   `Snapshot for category "${category}"`,
        //   snapshot.docs.length
        // );
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // console.log("Data", data);
          const { location } = data;

            if (location) {
              // Extract only the street name or first word from the location string
              const shortenedLocation = location.split(",")[1];  // Or use location.split(" ")[0] for first word

              // Use the shortened location in addressCounts
              addressCounts[shortenedLocation] = (addressCounts[shortenedLocation] || 0) + 1;

              // Update state with new counts
              setReportCounts((prevCounts) => ({
                ...prevCounts,
                ...addressCounts,
              }));
            } else {
              console.error("Location is missing for data entry:", data);
            }

        });
      });
    });

    // Return the cleanup function that unsubscribes from all listeners.
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    // Reset reportCounts before fetching new data
    setReportCounts({});
    // Pass dateFilter into fetchDocuments so that filtering is applied
    const unsubscribe = fetchDocuments(dateFilter, selectedCategory);
    return unsubscribe;
  }, [dateFilter, selectedCategory]);

  const chartData = {
    labels: Object.keys(reportCounts),
    datasets: [
      {
        label: "Number of Reports per Location",
        data: Object.values(reportCounts),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-4/5 flex-grow h-[400px] mt-8 ml-8">
      <div className="font-bold text-md text-main">
        Incident Reports by Location
      </div>

      {/* Dropdown for Date Filter */}
      {/* <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2 font-semibold text-sm">
          Select Date Filter:{" "}
        </label>
        <select
          id="dateFilter"
          onChange={(e) => setDateFilter(e.target.value)} // Update state when the filter changes
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
        <Bar
          id="report-by-areas"
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw} reports`,
                },
              },
            },
            scales: {
              x: { title: { display: true, text: "Locations" } },
              y: {
                title: { display: true, text: "Number of Reports" },
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

export default ReportByAreas;
