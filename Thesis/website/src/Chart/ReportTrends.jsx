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

// Register the components
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

// Define a color palette for each report category
const categoryColors = {
  "fire accident": {
    backgroundColor: "rgba(255, 99, 132, 0.4)", // Pink
    borderColor: "rgba(255, 99, 132, 1)",
  },
  "street light": {
    backgroundColor: "rgba(54, 162, 235, 0.4)", // Blue
    borderColor: "rgba(54, 162, 235, 1)",
  },
  pothole: {
    backgroundColor: "rgba(255, 206, 86, 0.4)", // Yellow
    borderColor: "rgba(255, 206, 86, 1)",
  },
  flood: {
    backgroundColor: "rgba(79, 192, 75, 0.4)", // Green
    borderColor: "rgba(79, 192, 75, 1)",
  },
  others: {
    backgroundColor: "rgba(153, 102, 255, 0.4)", // Purple
    borderColor: "rgba(153, 102, 255, 1)",
  },
  "road accident": {
    backgroundColor: "rgba(255, 159, 64, 0.4)", // Orange
    borderColor: "rgba(255, 159, 64, 1)",
  },
  "fallen tree": {
    backgroundColor: "rgba(35, 262, 162, 0.4)", // Teal
    borderColor: "rgba(35, 262, 162, 1)",
  },
};

const ReportTrends = ({
  dateFilter,
  setDateFilter,
  selectedCategory,
  setCategoryFilter,
}) => {
  const [reports, setReports] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

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
  const fetchDocuments = async (filter, category) => {
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

    // Clear previous reports to avoid duplication
    setReports([]);

    const unsubscribeFunctions = categoriesToFetch.map((category) => {
      let q = collection(db, `reports/${category}/reports`);

      if (filter !== "all") {
        const startOfPeriod = getStartOfPeriod(filter);
        if (startOfPeriod) {
          // If filter is applied, fetch reports after the specified date
          q = query(q, where("report_date", ">=", startOfPeriod.toISOString()));
        }
      }

      return onSnapshot(q, (snapshot) => {
        const updateReports = snapshot.docs.map((doc) => ({
          ...doc.data(),
          category,
          id: doc.id, // Track unique document ID
        }));

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
    fetchDocuments(dateFilter, selectedCategory);
  }, [dateFilter, selectedCategory]); // Fetch data whenever the date filter changes

  useEffect(() => {
    if (reports.length > 0) {
      const reportCounts = {};
      reports.forEach((report) => {
        const date = new Date(report.report_date).toLocaleDateString(); // Ensure the date is in correct format
        const category = report.category;

        if (!reportCounts[date]) {
          reportCounts[date] = {};
        }
        reportCounts[date][category] = (reportCounts[date][category] || 0) + 1;
      });

      // Sort dates to ensure they're in chronological order
      const sortedLabels = Object.keys(reportCounts).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      // Prepare data for the chart
      const datasets = [];
      const categories = [...new Set(reports.map((report) => report.category))];

      categories.forEach((category) => {
        const data = sortedLabels.map(
          (date) => reportCounts[date][category] || 0
        );

        // Use the specific color for each category
        const color = categoryColors[category];

        datasets.push({
          label: category,
          data: data,
          fill: false,
          backgroundColor: color.backgroundColor,
          borderColor: color.borderColor,
          tension: 0.1, // Smooth lines
        });
      });

      setChartData({
        labels: sortedLabels, // Use sorted dates as labels
        datasets: datasets,
      });
    } else {
      // If no reports, clear the chart data
      setChartData({
        labels: [], // No labels for x-axis
        datasets: [], // No datasets to render
      });
    }
  }, [reports]);

  return (
    <div className="w-4/5 flex-grow h-[400px] mt-8 ml-8">
      <div className="font-bold text-md text-main">Report Date Trends</div>

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
        <Line
          id="report-trends"
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
                  text: "Date",
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

export default ReportTrends;
