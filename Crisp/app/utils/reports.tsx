import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import * as FileSystem from "expo-file-system";
import api from "@/app/api/axios";
// Define the Reports interface based on your requirements
export interface Reports {
  id: string;
  user_id: number;
  username: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  upvote: number;
  downvote: number;
  report_date: string;
  custom_type: string;
  floor_number: string;
  upvoteCount: number | any;
  downvoteCount: number | any;
  voted: "upvote" | "downvote" | null;
  is_validated: boolean;
  status: string;
  userFeedback: Feedback[]; // Updated type
  workerFeedback: Feedback[];
  location: string;
  imageUrl: string;
}
interface Feedback {
  description: string;
  proof: string;
  submited_at: string;
}

const db = getFirestore(app);

export class Report implements Reports {
  public id: string;
  public user_id: number;
  public username: string;
  public type_of_report: string;
  public report_description: string;
  public longitude: number;
  public latitude: number;
  public category: string;
  public image_path: string;
  public upvote: number;
  public downvote: number;
  public report_date: string;
  public custom_type: string;
  public floor_number: string;
  public upvoteCount: number | any;
  public downvoteCount: number | any;
  public voted: "upvote" | "downvote" | null;
  public is_validated: boolean;
  public status: string;
  public userFeedback: Feedback[] = []; // Initialize as an empty array
  public workerFeedback: Feedback[] = []; // Initialize as an empty array
  public location: string;
  public imageUrl: string;

  constructor(reportData: Reports) {
    this.id = reportData.id;
    this.user_id = reportData.user_id;
    this.username = reportData.username;
    this.type_of_report = reportData.type_of_report;
    this.report_description = reportData.report_description;
    this.longitude = reportData.longitude;
    this.latitude = reportData.latitude;
    this.category = reportData.category;
    this.image_path = reportData.image_path;
    this.upvote = reportData.upvote;
    this.downvote = reportData.downvote;
    this.report_date = reportData.report_date;
    this.custom_type = reportData.custom_type;
    this.floor_number = reportData.floor_number;
    this.upvoteCount = reportData.upvoteCount;
    this.downvoteCount = reportData.downvoteCount;
    this.voted = reportData.voted;
    this.is_validated = reportData.is_validated;
    this.status = reportData.status;
    this.userFeedback = []; // Initialize as empty array
    this.workerFeedback = []; // Initialize as empty array
    this.location = reportData.location;
    this.imageUrl = reportData.imageUrl;
  }

  public static async fetchReportsByCategory(
    category: string
  ): Promise<Report[]> {
    const reports: Report[] = [];

    try {
      const reportCollection = collection(db, `reports/${category}/reports`);
      const reportSnapshot = await getDocs(reportCollection);

      reportSnapshot.forEach((doc) => {
        const data = doc.data() as Reports; // Cast the data to Reports
        const { id, ...rest } = data; // Destructure to omit id from data
        const report = new Report({ id: doc.id, ...rest }); // Create a Report instance with the id and rest of the data
        reports.push(report);
      });

      return reports;
    } catch (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
  }

  public static async deleteReports(
    reportId: string,
    selectedReport: Reports,
    username: string
  ) {
    try {
      const reportRef = doc(
        db,
        `reports/${selectedReport.type_of_report.toLowerCase()}/reports`,
        reportId
      );

      // Get the report data before deleting
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        console.error("Report does not exist!");
        return;
      }
      const reportData = reportSnap.data();

      // Move report to deletedReports
      const deletedReportRef = doc(db, "deletedReports", reportId);
      await setDoc(deletedReportRef, {
        ...reportData,
        deleted_at: new Date().toISOString(),
        deleted_by: username,
      });

      // Delete original report
      await deleteDoc(reportRef);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  public static async addReports(
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    is_emergency: string,
    image_path: string,
    custom_type: string,
    floor_number: string,
    location: string
  ) {
    const formData = new FormData();
    formData.append("type_of_report", type_of_report);
    formData.append("report_description", report_description);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("is_emergency", is_emergency);
    const imageBase64 = await FileSystem.readAsStringAsync(image_path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    formData.append("image_path", `data:image/jpeg;base64,${imageBase64}`);
    formData.append("custom_type", custom_type);
    formData.append("floor_number", floor_number);
    formData.append("location", location);
    try {
      const res = await api.post("api/create-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(
        type_of_report,
        report_description,
        longitude,
        latitude,
        is_emergency,
        image_path,
        custom_type,
        floor_number,
        location
      );
      if (res.status === 201 || res.status === 200) {
        return res;
      }
    } catch (error: any) {
      console.error("Error details:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        throw new Error(
          `An unexpected error occurred: ${
            error.response.data.message || error.message
          }`
        );
      } else {
        throw new Error(`An unexpected error occurred: ${error.message}`);
      }
    }
  }

  // Fetch all reports across all categories
  public static async fetchAllReports(): Promise<Report[]> {
    const categories = [
      "fire accident",
      "street light",
      "pothole",
      "flood",
      "others",
      "road accident",
      "fallen trees",
    ];
    const allReports: Report[] = [];

    try {
      // Fetch all reports in parallel for each category
      await Promise.all(
        categories.map(async (category) => {
          const reports = await this.fetchReportsByCategory(category);
          allReports.push(...reports);
        })
      );
      return allReports;
    } catch (error) {
      console.error("Error retrieving all reports:", error);
      return [];
    }
  }
}
