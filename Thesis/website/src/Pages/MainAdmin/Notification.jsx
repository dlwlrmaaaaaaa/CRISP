import React, { useEffect, useState, useRef } from "react";

import Data from "../../JSON/callLogs.json";
import Navbar from "./Navigation/NavBar";
import NavText from "./Navigation/NavText";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";

// Importing all the maps
import NFloodSus from "../../assets/Maps/N-FloodSus.JPG";
import NGroundLiq from "../../assets/Maps/N-GroundLiq.JPG";
import NGroundSus from "../../assets/Maps/N-GroundSus.JPG";
import NRainLand from "../../assets/Maps/N-RainLand.JPG";
import NStorm from "../../assets/Maps/N-Storm.JPG";
import NTsunami from "../../assets/Maps/N-Tsunami.JPG";
import NWindSus from "../../assets/Maps/N-WindSus.JPG";
import SFloodSus from "../../assets/Maps/S-FloodSus.JPG";
import SGroundLiq from "../../assets/Maps/S-GroundLiq.JPG";
import SGroundSus from "../../assets/Maps/S-GroundSus.JPG";
import SRainLand from "../../assets/Maps/S-RainLand.JPG";
import SStorm from "../../assets/Maps/S-Storm.JPG";
import STsunami from "../../assets/Maps/S-Tsunami.JPG";
import SWindSus from "../../assets/Maps/S-WindSus.JPG";
import { app } from "../../Firebase/firebaseConfig";
const db = getFirestore(app);
import ImageModal from "../../Components/Modals/ImageModal";

// Weather Map Component
import WeatherMap from "../../Components/Modals/WeatherMap"; // Assuming WeatherMap component is stored in Components folder
import { addDoc, collection, getFirestore } from "firebase/firestore";

const Notification = () => {
  const [formData, setFormData] = useState({
    name: "",
    reportType: "",
    description: "",
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleButtonClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true); // Show the modal
  };

  const [location, setLocation] = useState({
    lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    lng: 120.9705,
  });

  useEffect(() => {
    // Get current location using Geolocation API
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            // You can use default location here if geolocation fails
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getCurrentLocation();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const sendNotificationToUsers = async (e) => {
    try {
      e.preventDefault();

      // Check if description is empty
      if (!formData.description.trim()) {
        alert("Description cannot be empty!");
        return;
      }
      if (!formData.reportType.trim()) {
        alert("Report Type cannot be empty!");
        return;
      }

      const notifRef = await addDoc(collection(db, "globalNotification"), {
        title: formData.reportType,
        description: formData.description,
        createdAt: new Date(),
        general: true,
      });

      if (!notifRef) {
        console.error("Notification sending failed!");
        return;
      }
      alert("Notification sent!");
      setFormData({
        name: "",
        reportType: "",
        description: "",
      });
    } catch (error) {
      console.error("Send notification to user: ", error);
    }
  };

  return (
    <>
      <div className="relative bg-second h-[100vh] w-full overflow-hidden">
        {/* bg square */}
        <div className="absolute inset-0 z-10">
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
        </div>

        {/* content */}
        <div className="relative h-[100vh] w-full flex flex-col items-center z-30 overflow-auto">
          <Navbar />
          <NavText />
          <div className="h-[100vh] grid grid-col md:grid-cols-2 pt-5 mt-[30vh] md:mt-[30vh] lg:mt-[20vh] w-full px-10 gap-8 ">
            <div className="w-full h-[450px] sticky top-[20vh] flex items-center rounded-2xl border-2 border-main">
              {/* Weather Map Component */}
              <WeatherMap lat={location.lat} lon={location.lng} />
            </div>

            <div>
              {/* Form and Risk Map Buttons */}
              <div className="bg-white border-2 border-main flex flex-col rounded-lg antialiased w-full overflow-y-auto mb-[2vh]">
                <div className="w-full flex flex-row justify-between bg-main">
                  <form className="w-full flex flex-col space-y-4 p-6 bg-white">
                    {/* <label className="text-sm font-medium text-gray-700">
                      Recipient
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      // value={formData.name}
                      // onChange={handleInputChange}
                      className="p-2 text-sm border border-main rounded-md"
                    /> */}

                    <label className="text-sm font-medium text-gray-700">
                      Report Type
                    </label>
                    <select
                      id="reportType"
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleInputChange}
                      className="p-2 text-sm border border-main rounded-md"
                      required
                    >
                      <option value="">Select a Report Type</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Updates">Updates</option>
                      <option value="Safety Alert">Safety Alert</option>
                      <option value="Critical Safety Alert">
                        Critical Safety Alert
                      </option>
                      <option value="Safety Precautions">
                        Safety Precautions
                      </option>
                      <option value="Safety Tips">Safety Tips</option>
                      <option value="Public Health Notices">
                        Public Health Notices
                      </option>
                    </select>

                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="p-2 text-sm border border-main rounded-md resize-none"
                      rows="3"
                      required
                    ></textarea>

                    <button
                      onClick={(e) => {
                        sendNotificationToUsers(e);
                      }}
                      className="bg-main text-white py-2 px-6 rounded-md hover:bg-main-dark"
                    >
                      Send Notification
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-white border-2 border-main flex flex-col rounded-lg antialiased w-full mb-[5vh]">
                <div className="text-xl font-extrabold text-main p-6">
                  RISK MAPS
                </div>
                <div className="text-md font-bold text-main px-6 pb-4">
                  South Caloocan
                </div>
                <div className="w-full overflow-x-auto pb-4">
                  <div className="inline-flex space-x-6">
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0 ml-6"
                      onClick={() => handleButtonClick(SWindSus)}
                    >
                      Severe Wind
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(SRainLand)}
                    >
                      Rain Induced Landslide
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(SFloodSus)}
                    >
                      Flood Susceptibility
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(SStorm)}
                    >
                      Storm Surge
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(STsunami)}
                    >
                      Tsunami
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(SGroundSus)}
                    >
                      Ground Shaking
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(SGroundLiq)}
                    >
                      Ground Liquefaction
                    </button>
                  </div>
                </div>

                <div className="text-md font-bold text-main px-6 pb-4">
                  North Caloocan
                </div>
                <div className="w-full overflow-x-auto pb-4">
                  <div className="inline-flex space-x-6">
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0 ml-6"
                      onClick={() => handleButtonClick(NWindSus)}
                    >
                      Severe Wind
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NRainLand)}
                    >
                      Rain Induced Landslide
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NFloodSus)}
                    >
                      Flood Susceptibility
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NStorm)}
                    >
                      Storm Surge
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NTsunami)}
                    >
                      Tsunami
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NGroundSus)}
                    >
                      Ground Shaking
                    </button>
                    <button
                      className="bg-white border-2 border-main text-main hover:bg-slate-400 font-bold text-sm rounded-lg p-3 flex-shrink-0"
                      onClick={() => handleButtonClick(NGroundLiq)}
                    >
                      Ground Liquefaction
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isVisible={showImageModal}
        onClose={() => setShowImageModal(false)}
        attachment={selectedImage}
      />
    </>
  );
};

export default Notification;
