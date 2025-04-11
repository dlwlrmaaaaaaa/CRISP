import React, { useState, useEffect } from "react";

import Prompt from "./Prompt";
import Data from "../../JSON/adminAcc.json";
import { useAuth } from "../../AuthContext/AuthContext";

const Profile = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reenterNewPassword, setReenterNewPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Assuming you get the password from the data
  const [userPassword] = Data.map((data) => data.password);

  // useEffect(() => {
  //   console.log("User", user); // Log user when it's available
  // }, [user]);

  const handleChangePassword = () => {
    if (currentPassword === userPassword) {
      setShowChangePasswordForm(true);
      setPasswordMatchError(false);
    } else {
      setPasswordMatchError(true);
      setErrorMessage("Incorrect Previous Password!");
      setTimeout(() => {
        setErrorMessage(""); // Clear the message after 3 seconds
      }, 3000);
    }
  };

  const handlePromtClick = () => {
    setShowPrompt(true);
  };

  const handlePasswordChange = () => {
    if (newPassword === reenterNewPassword) {
      // Handle password change logic here
      alert("Password changed successfully");
      onClose();
    } else {
      setErrorMessage("Passwords do not match");
      setTimeout(() => {
        setErrorMessage(""); // Clear the message after 3 seconds
      }, 3000);
    }
  };

  const handleLeave = () => {
    setShowPrompt(false);
    onClose(); // Close the AddAccount modal
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-[100svh] items-center justify-center bg-black/50 flex z-30 font-figtree">
        <div
          className="w-full min-h-[100svh] max-h-[100svh] py-12 px-4 overflow-auto flex justify-center items-start"
          id="container"
          onClick={(e) => {
            if (e.target.id === "container") {
              handlePromtClick();
            }
          }}
        >
          <div className="relative w-3/4 md:w-1/2 lg:w-1/3 bg-second flex flex-col items-center justify-center p-8 md:p-10 rounded-xl shadow-xl overflow-hidden">
            {/* bg squares */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
            </div>
            <div className="relative w-full flex items-center justify-center z-20">
              <p className="text-md text-main uppercase font-extrabold">
                Edit Profile
              </p>
            </div>
            <div className="w-full flex flex-col justify-center items-start gap-4 z-20">
              {Data.map((data, index) => (
                <div className="w-full flex flex-col mt-4" key={index}>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                      <p className="text-xs font-semibold">Name</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                      <div className="text-xs font-extrabold  text-main uppercase truncate">
                        {user.username}
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                      <p className="text-xs font-semibold ">Email Address</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                      <p className="text-xs font-semibold ">Phone Number</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {user.contact_number || "Not Available"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="flex justify-start items-center w-full py-2">
                      <p className="text-xs font-semibold ">Department</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {user.department_id === 1
                          ? "Fire"
                          : user.department_id === 2
                          ? "Medical"
                          : user.department_id === 3
                          ? "Police"
                          : user.department_id === 4
                          ? "Street Maintenance"
                          : user.department_id === 5
                          ? "Pothole Maintenance"
                          : user.department_id ||
                            "Not applicable as main admin"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                      <p className="text-xs font-semibold ">Station</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {user.station || "Not applicable as main admin"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="flex justify-start items-center w-full py-2">
                      <p className="text-xs font-semibold ">Station Address</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center border border-main rounded-md">
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {user.station_address || "Not applicable as main admin"}
                      </p>
                    </div>
                  </div>
                  {/* end of only for new employee accounts */}
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="flex justify-start items-center w-full py-2">
                      <p className="text-xs font-semibold ">Password</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                      <input
                        type="password"
                        className="outline-none bg-white w-full resize-none text-xs font-normal overflow-hidden"
                        placeholder="Enter Previous Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* change password form */}
                  {showChangePasswordForm && (
                    <>
                      <div className="w-full flex flex-col items-center justify-center">
                        <div className="flex justify-start items-center w-full py-2">
                          <p className="text-xs font-semibold">New Password</p>
                        </div>
                        <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                          <input
                            type="password"
                            className="outline-none bg-white w-full resize-none text-xs font-normal overflow-hidden"
                            placeholder="Enter New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="w-full flex flex-col items-center justify-center">
                        <div className="flex justify-start items-center w-full py-2">
                          <p className="text-xs font-semibold">
                            Re-enter New Password
                          </p>
                        </div>
                        <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                          <input
                            type="password"
                            className="outline-none bg-white w-full resize-none text-xs font-normal overflow-hidden"
                            placeholder="Re-enter New Password"
                            value={reenterNewPassword}
                            onChange={(e) =>
                              setReenterNewPassword(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/*Error Message*/}
                  {errorMessage && (
                    <div className="w-full flex justify-start mt-2">
                      <p className="text-xs font-bold text-red-700">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="w-full flex flex-row gap-4 items-center justify-end mt-5">
                    {!showChangePasswordForm && (
                      <button
                        className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                        onClick={handleChangePassword}
                      >
                        CHANGE PASSWORD
                      </button>
                    )}
                    {showChangePasswordForm && (
                      <>
                        <button
                          className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                          onClick={handlePasswordChange}
                        >
                          CONTINUE
                        </button>
                        {/* <button
                          className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                          onClick={() => setShowChangePasswordForm(false)}
                        >
                          CANCEL
                        </button> */}
                      </>
                    )}
                    <button
                      className="py-3 px-4 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                      onClick={handlePromtClick}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Prompt
        isVisible={showPrompt}
        onClose={() => setShowPrompt(false)}
        onLeave={handleLeave}
      />
    </>
  );
};

export default Profile;
