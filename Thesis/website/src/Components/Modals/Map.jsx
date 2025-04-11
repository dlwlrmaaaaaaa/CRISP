import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useAuth } from "../../AuthContext/AuthContext";
import {
  onSnapshot,
  collection,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "../../Firebase/firebaseConfig";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const db = getFirestore(app);

const Map = ({ lat, lon, selectedCategory }) => {
  // const { reports } = useAuth();
  const [reports, setReports] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user_id = localStorage.getItem("user_id");
  const accountType = localStorage.getItem("accountType");
  // console.log("reports", reports);

  const API_KEY = "b29aa0efcb4db33afa698232bfb7b3a2"; // Replace with your OpenWeatherMap API key
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  // const WEATHER_API_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const fetchDocuments = async (category) => {
    setReports([]); // Clear reports before fetching new data
    const categories = [
      "fire accident",
      "street light",
      "potholes",
      "floods",
      "others",
      "fallen tree",
      "road accident",
    ];
    const categoriesToFetch = category === "all" ? categories : [category];

    const unsubscribeFunctions = categoriesToFetch.map((category) => {
      let q = collection(db, `reports/${category}/reports`);

      return onSnapshot(q, (snapshot) => {
        const fetchedReports = snapshot.docs.map((doc) => doc.data());
        setReports((prevReports) => [...prevReports, ...fetchedReports]);
      });
    });

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  };

  useEffect(() => {
    fetchDocuments(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    // Fetch weather data
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(WEATHER_API_URL);
        // console.log(response.data); // Log the response to see the structure of the data
        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather data:", err); // Log the error message
        setError("Error fetching weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  // Handle loading and error states
  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>{error}</div>;

  const filteredReports =
    accountType == "department_admin"
      ? reports.filter((report) => report.assigned_to_id == user_id) // Only show reports assigned to this user
      : reports;

  // console.log("filteredReports", filteredReports);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <MapContainer
        id="map"
        center={[lat, lon]}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer
          url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
        />
        {/* Add a marker for the weather location */}
        <Marker position={[lat, lon]}>
          <Popup>
            <div>
              <h4>Current Location</h4>
              <h4>Weather Data</h4>
              <p>
                Temperature: {(weatherData.main.temp - 273.15).toFixed(2)}°C
              </p>
              <p>Weather: {weatherData.weather[0].description}</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind Speed: {weatherData.wind.speed} m/s</p>
            </div>
          </Popup>
        </Marker>

        {/* Loop through reports and add a marker for each */}
        {filteredReports.map((report) => {
          const {
            latitude,
            longitude,
            id, // This is the unique identifier
            status,
            location,
            report_description,
            username,
            type_of_report,
          } = report;

          return (
            <Marker key={id} position={[latitude, longitude]}>
              <Popup>
                <div>
                  <h4>Report: {type_of_report}</h4>
                  <p>Reported by: {username}</p>
                  <p>Location: {location}</p>
                  <p>Description: {report_description}</p>
                  <p>Status: {status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
