import React, { useState } from "react";

import { AuthProvider } from "../../../AuthContext/AuthContext";
import Profile from "../../../Components/Modals/Profile";

import logo from "../../../assets/android-icon-square.png";
import { FaUser } from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../AuthContext/AuthContext"; // Import the Auth context
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toggleNotifsOpen, setIsNotifsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate(); // Use navigate for redirecting
  const { onLogout } = useAuth(); // Get the logout function from the context

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotifs = () => setIsNotifsOpen(!toggleNotifsOpen);

  const handleAddAccount = () => {
    setShowProfile(true);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await onLogout(); // Call the logout function
    setIsDropdownOpen(false); // Close the dropdown after logout
    navigate("/login", { replace: true }); // Use replace to prevent going back to the dashboard
  };

  const handleLogoClick = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="fixed w-full px-8 font-dm z-30">
        <div className="py-4 px-6 bg-main flex justify-between items-center rounded-b-lg">
          <div className="flex justify-center items-center gap-2">
            <img
              src={logo}
              alt="/"
              className="w-[30px] cursor-pointer"
              onClick={handleLogoClick}
            />
            <p className="hidden md:block font-semibold text-sm uppercase text-second">
              CRISP: Community Reporting Interface for Safety and Prevention
            </p>
            <p className="block md:hidden font-extrabold text-sm uppercase text-second">
              CRISP
            </p>
          </div>
          {/* menu dropdown */}
          <div className="relative flex gap-2">
            <div className="flex items-center justify-center">
              <p className="hidden md:block font-semibold text-sm uppercase text-second">
                Department Admin
              </p>
            </div>
            <div
              className="flex items-center justify-center cursor-pointer px-2"
              onClick={toggleNotifs}
            >
              <MdNotificationsActive className="text-second text-3xl" />
              <div className="absolute top-0 right-12 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div
              className="rounded-full bg-second w-[35px] h-[35px] flex items-center justify-center cursor-pointer"
              onClick={toggleDropdown}
            >
              <FaUser className="text-main text-lg" />
            </div>
            {toggleNotifsOpen && (
              <div className="absolute top-full right-12 mt-2 bg-white shadow-lg rounded-lg border  w-80">
                <ul className="flex flex-col">
                  <li>
                    <div
                      // onClick={handleAddAccount}
                      className="block px-4 py-2 font-bold text-red-600 "
                    >
                      Notifications
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  <li>
                    <div
                      // onClick={handleLogout} // Change from NavLink to div and handleLogout
                      className="block px-4 py-2 font-bold text-textSecond hover:text-main cursor-pointer"
                    >
                      Notifs here
                    </div>
                  </li>
                </ul>
              </div>
            )}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border  w-auto">
                <ul className="flex flex-col">
                  <li>
                    <div
                      onClick={handleAddAccount}
                      className="block px-4 py-2 font-bold text-textSecond hover:text-main"
                    >
                      Profile
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  <li>
                    <div
                      onClick={handleLogout} // Change from NavLink to div and handleLogout
                      className="block px-4 py-2 font-bold text-textSecond hover:text-main cursor-pointer"
                    >
                      Logout
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthProvider>
        <Profile
          isVisible={showProfile}
          onClose={() => setShowProfile(false)}
        />
      </AuthProvider>
    </>
  );
};

export default NavBar;
