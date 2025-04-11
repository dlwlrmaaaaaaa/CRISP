import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as htmlToImage from "html-to-image";

const Maps2 = ({ lat, lon, onMapCapture }) => {
  const mapContainerRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = "b29aa0efcb4db33afa698232bfb7b3a2"; // Replace with your OpenWeatherMap API key
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  useEffect(() => {
    // Fetch weather data
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(WEATHER_API_URL);
        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Error fetching weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  // Capture the map image once the weather data is fetched
  useEffect(() => {
    if (mapContainerRef.current && weatherData) {
      htmlToImage
        .toPng(mapContainerRef.current)
        .then((dataUrl) => {
          onMapCapture(dataUrl); // Pass the captured image data to the parent component
        })
        .catch((err) => {
          console.error("Error capturing map image:", err);
        });
    }
  }, [weatherData, lat, lon]);

  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      className="w-full h-full flex flex-col items-center"
      ref={mapContainerRef}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={17}
        className="w-full h-full"
        style={{ height: "400px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer
          url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
        />
        <Marker position={[lat, lon]}></Marker>
      </MapContainer>
    </div>
  );
};

export default Maps2;
