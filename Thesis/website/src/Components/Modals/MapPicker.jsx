import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import LControlGeocoder from "leaflet-control-geocoder";
import { AiOutlineCloseCircle } from "react-icons/ai";

const MapPicker = ({ isVisible, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [geocoder, setGeocoder] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const geoInstance = LControlGeocoder.nominatim();
    setGeocoder(geoInstance);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error(error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Handling map click events to select a location
  const MapClickHandler = () => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setSelectedLocation({ lat, lng });
      },
    });
    return null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue && geocoder) {
      // Using Leaflet's control geocoder to search the location
      geocoder.geocode(searchValue, function (results) {
        if (results && results.length > 0) {
          setSearchResults(results);
          setSelectedLocation({
            lat: results[0].center.lat,
            lng: results[0].center.lng,
          });
          // console.log("Geocode results: ", results);
        } else {
          alert("No locations found!");
          setSearchResults([]);
        }
      });
    } else {
      alert("Please enter a location to search.");
    }
  };

  // Select location from the results
  const handleLocationSelect = (location) => {
    setSelectedLocation({ lat: location.center.lat, lng: location.center.lng });
    setSearchResults([]); // Clear search results after selection
  };

  // Custom hook to update map view when a location is selected
  const UpdateMapView = () => {
    const map = useMap(); // Get the Leaflet map instance
    if (selectedLocation) {
      // Change map view to the selected location
      map.setView([selectedLocation.lat, selectedLocation.lng], 13); // 13 is the zoom level
    } else if (currentLocation) {
      // Center the map on current location if no selection is made
      map.setView([currentLocation.lat, currentLocation.lng], 13);
    }
    return null;
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 z-40 ">
      <div
        className="w-full min-h-[100svh] max-h-[100svh] py-12 px-4 overflow-auto flex justify-center items-start"
        id="container"
        onClick={(e) => {
          if (e.target.id === "container") {
            handlePromtClick();
          }
        }}
      >
        <div className="relative w-4/5 md:w-3/4 lg:w-1/2 bg-white rounded-xl shadow-xl">
          <div
            className="absolute top-0 right-0 p-4 cursor-pointer"
            onClick={onClose}
          >
            <AiOutlineCloseCircle className="text-3xl text-main mr-2" />
          </div>

          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">
              Select Station Address
            </h3>

            {/* Search bar */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for location"
                  className="w-full py-2 px-4 rounded-md border border-gray-300"
                />
                <button
                  onClick={handleSearch}
                  className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Display Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Search Results:</h4>
                <ul className="space-y-2">
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                      onClick={() => handleLocationSelect(result)}
                    >
                      {result.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Leaflet Map */}
            <div className="h-64 bg-gray-200">
              <MapContainer
                center={currentLocation}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler />
                <UpdateMapView />{" "}
                {/* Update map view when selectedLocation changes */}
                {currentLocation && (
                  <Marker position={currentLocation}>
                    <Popup>
                      Your Current Location: {currentLocation.lat},{" "}
                      {currentLocation.lng}
                    </Popup>
                  </Marker>
                )}
                {selectedLocation && (
                  <Marker position={selectedLocation}>
                    <Popup>
                      Selected Location: {selectedLocation.lat},{" "}
                      {selectedLocation.lng}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Select Location Button */}
            <div className="flex justify-center mt-4">
              <button
                className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                onClick={() => {
                  if (selectedLocation) {
                    onSelectLocation(selectedLocation);
                    onClose(); // Close after selection
                  } else {
                    alert("Please select a location!");
                  }
                }}
              >
                Select Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
