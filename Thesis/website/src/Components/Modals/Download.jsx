import React, { useState } from "react";
import QRcode from "../../assets/frame.png";

const Download = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 w-full h-screen bg-black/75 flex items-center justify-center z-40">
        <div
          className="relative flex items-center justify-center rounded-lg w-screen h-screen"
          id="container"
          onClick={(e) => {
            if (e.target.id === "container") {
              onClose();
              //   setActiveDetails(false);
            }
          }}
        >
          <div className="relative bg-second w-auto flex flex-col items-center justify-center p-3 md:p-6 rounded-xl shadow-xl overflow-hidden">
            <div className="relative w-full flex items-center justify-start z-20">
              <p className="text-lg text-main uppercase font-extrabold">
                Download Mobile App
              </p>
            </div>
            <div className="w-full flex flex-col items-center justify-center py-2">
              <div className="flex flex-col justify-start items-center w-full py-2">
                <p className="text-sm font-semibold mb-3">
                  Scan QR code to download the app
                </p>
                <img
                  src={QRcode} // Replace with real images
                  alt="Geo-Location Mapping"
                  className="mx-auto mb-4 h-48 object-cover"
                />
              </div>
              <div className="w-full flex flex-row gap-4 items-center justify-end mt-5">
                <a
                  href="https://tinyurl.com/446s5u43"
                  className="py-2 px-3 border border-main bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                >
                  DOWNLOAD
                </a>
                <button
                  className="py-2 px-3 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                  onClick={() => {
                    onClose();
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Download;
