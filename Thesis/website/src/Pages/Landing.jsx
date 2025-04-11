import React, { useEffect, useState, useRef } from "react";
import Navbar from "./NavBar";
import map from "../assets/map.png";
import sos from "../assets/sos.png";
import time from "../assets/time.png";
import { Link } from "react-router-dom";
import pic1 from "../assets/pic1.jpg";
import pic2 from "../assets/pic2.jpg";
import Download from "../Components/Modals/Download";

const Landing = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handlePromtClick = () => {
    setShowDownloadModal(true);
  };

  const handleLeave = () => {
    setShowDownloadModal(false);
    onClose(); // Close the AddAccount modal
  };
  return (
    <div className="relative bg-second h-screen w-screen overflow-hidden">
      {/* Background Squares */}
      <div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3 z-10"></div>
      </div>

      <div className="relative h-[100vh] w-[100vw] flex flex-col items-center z-30 overflow-auto">
        <Navbar />
        <div className="px-8">
          {/* Title and Description */}
          <h1 className="text-4xl font-extrabold text-main text-center mb-4 mt-[15vh]">
            CRISP: A Smarter Way to Protect Your Neighborhood
          </h1>
          <p className="text-lg text-main font-bold text-center mb-2 px-4">
            CRISP (Community Reporting Interface for Safety and Prevention)
          </p>
          <p className="text-md text-main text-center mb-6 px-4">
            Is an innovative mobile application designed to empower community
            members by enabling real-time reporting of crimes, safety concerns,
            and other incidents.
          </p>

          {/* Features Section */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-8 place-items-center">
            <div className="bg-white px-6 py-8 h-[250px] max-h-[250px]  rounded-lg shadow-lg text-center border border-main">
              <img
                src={time} // Replace with real images
                alt="Real-time Reporting"
                className="mx-auto mb-4 h-24 object-cover"
              />
              <h3 className="font-semibold text-xl text-main mb-2">
                Real-Time Reporting
              </h3>
              <p className="text-main text-sm">
                Quickly and accurately report safety issues and incidents to the
                authorities in real-time.
              </p>
            </div>

            <div className="bg-white px-6 py-8 h-[250px] max-h-[250px]  rounded-lg shadow-lg text-center border border-main">
              <img
                src={map} // Replace with real images
                alt="Geo-Location Mapping"
                className="mx-auto mb-4 h-24 object-cover"
              />
              <h3 className="font-semibold text-xl text-main mb-2">
                Geo-Location Mapping
              </h3>
              <p className="text-main text-sm">
                Automatically capture and map the location of incidents for
                improved tracking and response.
              </p>
            </div>

            <div className="bg-white px-6 py-8 h-[250px] max-h-[250px]  rounded-lg shadow-lg text-center border border-main">
              <img
                src={sos} // Replace with real images
                alt="SOS Feature"
                className="mx-auto mb-4 h-24 object-cover"
              />
              <h3 className="font-semibold text-xl text-main mb-2">
                SOS Feature
              </h3>
              <p className="text-main text-sm">
                Send distress signals in case of emergencies directly to local
                emergency services.
              </p>
            </div>
          </div>

          {/* General Objective */}
          <div className="w-full px-6 mb-8">
            <h2 className="text-3xl font-extrabold text-main mb-4">Our Goal</h2>
            <ul className="text-md text-main list-disc pl-6 text-justify pr-4">
              <li>
                To develop and deploy a comprehensive public safety reporting
                system, CRISP, which enables real-time incident reporting,
                enhances community safety through predictive analytics, and
                provides tools for emergency response and monitoring.
              </li>
              <li>
                Integrate an image classification system that automatically
                categorizes and validates reported incidents based on uploaded
                images to ensure that the reports are accurate and actionable.
              </li>
              {/* <li>
                Launch a predictive analytics module that uses historical data
                to forecast potential safety issues, helping authorities and
                residents proactively address future safety risks.
              </li> */}
            </ul>
          </div>

          {/* Images Section */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 px-4 mb-10">
            <img
              src={pic1} // Replace with real images
              alt="Map Preview"
              className="w-100 h-60 object-cover rounded-lg shadow-lg border border-main"
            />
            <img
              src={pic2} // Replace with real images
              alt="App Interface"
              className="w-100 h-60 object-cover rounded-lg shadow-lg border border-main"
            />
          </div>

          {/* Call to Action */}
          <div className="flex justify-center items-center mb-10">
            <div
              onClick={handlePromtClick}
              className="bg-main text-white py-3 px-10 rounded-lg text-md font-semibold uppercase hover:bg-accent transition-all duration-300"
            >
              Download CRISP
            </div>
          </div>

          {/* Footer */}
          <div className="w-full text-start text-main text-sm mb-6">
            <p>&copy; 2024 CRISP. All Rights Reserved.</p>
          </div>
        </div>
      </div>
      <Download
        isVisible={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};

export default Landing;
