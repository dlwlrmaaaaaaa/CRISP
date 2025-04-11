import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axios-instance";
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { app } from "../Firebase/firebaseConfig";

const db = getFirestore(app);

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [departments, setDepartment] = useState([]);
  const [account_type, setAccountType] = useState("");
  const [reports, setReports] = useState([]);
  const [accountRole, setAccountRole] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);
  const [totalNotDoneReportsCount, setTotalNotDoneReportsCount] = useState(0);
  const [totalNotDoneReportsCountDept, setTotalNotDoneReportsCountDept] =
    useState(0);
  const [weeklyReportsCount, setWeeklyReportsCount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [popUp, setPopUp] = useState({});
  // Check authentication on initial load from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Example token check
    const account_type = localStorage.getItem("accountType"); // Example token check
    const is_email_verified =
      localStorage.getItem("isEmailVerified") === "true"; // Check email verification status
    if (token) {
      setAccountType(account_type);
      setAuthenticated(true);
      setEmailVerified(is_email_verified); // Set email verification status
      fetchUserInfo(token);
    } else {
      setAccountType("");
      setAuthenticated(false);
    }
  }, []);

  // Function to fetch user info using the stored token
  const fetchUserInfo = async (token) => {
    try {
      const response = await axiosInstance.get("api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setLoading(false); // Set loading to false after the user is fetched
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Failed to load user data.");
      setLoading(false); // Set loading to false even if there's an error
    }
  };
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const account_type = localStorage.getItem("accountType");
        if (account_type !== "department_admin") {
          // console.log("you are not department admin");
          return;
        }
        const res = await axiosInstance.get("api/worker/accounts/");
        if (!res) {
          console.error("Cannot fetch worker");
          alert("Cannot Fetch Workers!");
          return;
        }
        setUsers(res.data);
        localStorage.setItem("workers_count", res.data.length);
      } catch (error) {
        console.error("Fetching workers error: ", error);
      }
    };
    fetchWorker();
  }, []);

  useEffect(() => {
    department();
  }, []);

  const fetchDocuments = async () => {
    const categories = [
      "fire accident",
      "street light",
      "pothole",
      "flood",
      "others",
      "road accident",
      "fire accident",
      "fallen tree",
    ];

    // Initialize a variable to accumulate the total count of reports that are not "done"
    let totalCount = 0;
    let totalCountsDept = 0; // Variable for department_admin
    const countedReportIds = new Set();
    const countedReportDeptIds = new Set();

    const unsubscribeFunctions = categories.map((category) => {
      return onSnapshot(
        collection(db, `reports/${category}/reports`),
        async (snapshot) => {
          totalCount = 0;
          const updateReports = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              const reportId = doc.id;

              // Fetch user and worker feedback for each report
              const userFeedbackRef = collection(
                db,
                `reports/${category}/reports/${reportId}/userFeedback`
              );
              const workerFeedbackRef = collection(
                db,
                `reports/${category}/reports/${reportId}/workerFeedback`
              );
              const falseCount = collection(
                db,
                `reports/${category}/reports/${reportId}/reported`
              );
              const querySnapshot = await getDocs(falseCount);

              const falseCountDescriptions = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return data.report_count; // Return only the report_count value
              });
              // const reportCount = querySnapshot.size;

              const userFeedbackSnapshot = await getDocs(userFeedbackRef);
              const workerFeedbackSnapshot = await getDocs(workerFeedbackRef);

              const userFeedbackDescriptions = userFeedbackSnapshot.docs.map(
                (doc) => ({
                  description: doc.data().description,
                  proof: doc.data().proof,
                  submitted_at: doc.data().submited_at, // assuming 'submitted_at' is a Firestore timestamp
                })
              );

              const workerFeedbackDescriptions =
                workerFeedbackSnapshot.docs.map((doc) => ({
                  description: doc.data().description,
                  proof: doc.data().proof,
                  submitted_at: doc.data().submited_at,
                }));

              // Return the report along with feedback
              return {
                ...data,
                id: doc.id, // Ensure Firestore id is included
                userFeedback: userFeedbackDescriptions,
                workerFeedback: workerFeedbackDescriptions,
                reportCount: falseCountDescriptions,
              };
            })
          );

          // Filter reports to only include those that are NOT "done"
          const notDoneReports = updateReports.filter(
            (report) =>
              report.status !== "done" && !countedReportIds.has(report.id)
          );
          const activeReport = updateReports.filter(
            (report) => report.status === "Ongoing"
          );
          localStorage.setItem("activeReportCount", activeReport.length);

          notDoneReports.forEach((report) => {
            countedReportIds.add(report.id);
          });
          totalCount += notDoneReports.length; // Accumulate the count of "not done" reports
          // Store the accumulated totalCount in state only after all categories are processed
          setTotalNotDoneReportsCount(totalCount);

          const today = new Date(); // Get the current date
          const dayOfWeek = today.getDay();

          const startOfWeek = new Date(today);
          startOfWeek.setDate(
            today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
          ); // Adjust for Sunday

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          const accountType = localStorage.getItem("accountType");

          if (accountType === "superadmin") {
            let weeklyCount = 0;

            // Filter reports that fall within the current week (Monday to Sunday)
            const weeklyReports = updateReports.filter((data) => {
              const reportDate = new Date(data.report_date);
              return reportDate >= startOfWeek && reportDate <= endOfWeek;
            });

            weeklyCount = weeklyReports.length;
            localStorage.setItem("weeklyReportCount", weeklyCount);
            setWeeklyReportsCount(weeklyCount);
          }

          if (accountType === "department_admin") {
            const user_id = localStorage.getItem("user_id");
            let weeklyAssignedCount = 0; // Reset count for department_admin

            // Filter reports for the current user and within the weekly range
            const weeklyAssignedReports = updateReports.filter((data) => {
              if (data.assigned_to_id == user_id) {
                const reportDate = new Date(data.report_date);
                return reportDate >= startOfWeek && reportDate <= endOfWeek;
              }
              return false; // Only include reports assigned to the current user
            });

            weeklyAssignedCount += weeklyAssignedReports.length;
            localStorage.setItem("weeklyAssignedReport", weeklyAssignedCount);

            // Filter reports to only include those that are NOT "done" and assigned to the current user
            const notDoneReportsForDept = updateReports.filter(
              (report) =>
                report.status !== "done" &&
                report.assigned_to_id == user_id &&
                !countedReportDeptIds.has(report.id)
            );

            totalCountsDept += notDoneReportsForDept.length; // Accumulate the "not done" count for department_admin
            setTotalNotDoneReportsCountDept(totalCountsDept); // Update state for department_admin

            // Add the report IDs to the Set to track them
            notDoneReportsForDept.forEach((report) => {
              countedReportDeptIds.add(report.id);
            });
          }
          const sortedReports = updateReports.sort(
            (a, b) => new Date(b.report_date) - new Date(a.report_date)
          );
          // Update the reports state
          setReports((prevReports) => {
            const combinedReports = [...prevReports, ...sortedReports];
            const uniqueReports = [
              ...new Map(
                combinedReports.map((item) => [item.id, item])
              ).values(),
            ];
            return uniqueReports;
          });
        }
      );
    });

    // Cleanup function for unsubscribing
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = await fetchDocuments();
      return unsubscribe;
    };
    fetchData().catch((error) => {
      console.error("Error in fetching documents:", error);
    });
  }, []);

  const department_admin_registration = async (
    username,
    email,
    phoneNumber,
    department,
    station,
    stationAddress,
    password,
    password_confirm
  ) => {
    try {
      const data = {
        username,
        email,
        contact_number: phoneNumber,
        department,
        station,
        station_address: stationAddress,
        password,
        password_confirm,
      };
      const res = await axiosInstance.post(
        "api/department_admin/registration/",
        data
      );

      if (!res) {
        throw new Error("Error in Department Registration");
      }

      return res;
    } catch (error) {
      if (error.response) {
        // Server responded with an error status
        console.log("Error Response:", error.response.data);
        // alert(`Error: ${error.response.data.detail || "An error occurred"}`); // Customize this depending on your API error response format
      } else if (error.request) {
        // Request was made but no response was received
        // console.log("Error Request:", error.request);
        alert("No response received from server. Please try again.");
      } else {
        // Something else happened in setting up the request
        // console.log("Error Message:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const worker_registration = async (
    username,
    email,
    phoneNumber,
    department,
    station,
    stationAddress,
    password,
    password_confirm
  ) => {
    try {
      const data = {
        username,
        email,
        contact_number: phoneNumber,
        department,
        station,
        station_address: stationAddress,
        password,
        password_confirm,
      };
      const res = await axiosInstance.post("api/worker/registration/", data);

      if (!res) {
        throw new Error("Error in Department Registration");
      }
      return res;
    } catch (error) {
      if (error.response) {
        // Server responded with an error status
        console.log("Error Response:", error.response.data);
        alert(`Error: ${error.response.data.detail || "An error occurred"}`); // Customize this depending on your API error response format
      } else if (error.request) {
        // Request was made but no response was received
        console.log("Error Request:", error.request);
        alert("No response received from server. Please try again.");
      } else {
        // Something else happened in setting up the request
        console.log("Error Message:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const department = async () => {
    try {
      if (
        account_type == "department_admin" ||
        account_type == "departmentadmin" ||
        account_type == "worker" ||
        account_type == "citizen"
      )
        return;

      const res = await axiosInstance.get("api/departments/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDepartment((prev) => {
        const newDepartments = res.data;
        const uniqueDepartments = [
          ...prev,
          ...newDepartments.filter(
            (dep) => !prev.some((existingDep) => existingDep.id === dep.id)
          ),
        ];
        return uniqueDepartments;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onLogin = async (email, password) => {
    try {
      const res = await axiosInstance.post("api/token/", {
        username: email,
        password,
      });

      // console.log("Login response:", res.data);

      const {
        access,
        refresh,
        account_type,
        station_address,
        coordinates,
        station,
        department,
        user_id,
        is_email_verified,
      } = res.data;

      if (
        account_type !== "superadmin" &&
        account_type !== "super_admin" &&
        account_type !== "department_admin" &&
        account_type !== "department_head"
      ) {
        alert("You are not permitted to enter this site.");
        return null;
      }

      localStorage.setItem("accessToken", access);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("accountType", account_type);
      localStorage.setItem("station_address", station_address);
      localStorage.setItem("department", department);
      localStorage.setItem("coordinates", coordinates);
      localStorage.setItem("station", station);
      localStorage.setItem("isEmailVerified", is_email_verified); // Store email verification status

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access}`;
      setAccountType(account_type);
      setAuthenticated(true);
      setEmailVerified(is_email_verified); // Set email verification status
      setToken(access);
      fetchUserInfo(access);
      if (account_type === "superadmin" || account_type === "super_admin") {
        department();
      }
      return { ...res.data, is_email_verified }; // Adding the is_email_verified here
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.status === 401) {
          alert("Invalid username or password. Please try again.");
        } else {
          const detailMessage =
            error.response.data.detail ||
            "An error occurred. Please try again.";
          alert(detailMessage);
        }
      } else {
        // console.log("Error", error.message);
      }
    }
  };

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("station_address");
    localStorage.removeItem("coordinates");
    localStorage.removeItem("accountType");
    localStorage.removeItem("station");
    localStorage.removeItem("isEmailVerified"); // Remove email verification status
    localStorage.removeItem("departmentName"); // Remove department name
    localStorage.removeItem("department");
    localStorage.removeItem("user_id");
    localStorage.removeItem("users_count");
    localStorage.removeItem("weeklyReportCount");
    localStorage.removeItem("workers_count");
    localStorage.removeItem("new_notif_counts");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setAuthenticated(false); // Set user as not authenticated
  };

  return (
    <AuthContext.Provider
      value={{
        onLogin,
        onLogout,
        authenticated,
        reports,
        account_type,
        departments,
        setDepartment,
        department_admin_registration,
        department,
        worker_registration,
        weeklyReportsCount,
        user,
        users,
        totalNotDoneReportsCount,
        totalNotDoneReportsCountDept,
        emailVerified, // Provide email verification status
        popUp,
        setPopUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
