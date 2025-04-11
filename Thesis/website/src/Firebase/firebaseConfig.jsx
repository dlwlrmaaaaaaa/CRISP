import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEKoeUmd_Nps_xNbDdGAYqPLZPibHYppA",
  authDomain: "crisp-63736.firebaseapp.com",
  databaseURL: "https://crisp-63736-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crisp-63736",
  storageBucket: "crisp-63736.appspot.com",
  messagingSenderId: "25886713465",
  appId: "1:25886713465:web:021f343b5785e55c1d96a8",
  measurementId: "G-NSBZMHRT4X",
};

// Initialize Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Optionally initialize analytics if you need it
const analytics = getAnalytics(app);

export { app, analytics };
