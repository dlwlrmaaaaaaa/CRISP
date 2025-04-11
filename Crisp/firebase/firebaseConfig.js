import { initializeApp, } from "firebase/app"; // Include getApp and getApps

import Constants from 'expo-constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.API_KEY, 
  authDomain: Constants.expoConfig.extra.AUTH_DOMAIN,
  databaseURL: Constants.expoConfig.extra.DB_URL,
  projectId: Constants.expoConfig.extra.PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.ID,
  appId: Constants.expoConfig.extra.APP_ID,
  measurementId: Constants.expoConfig.extra.MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
export { app };

