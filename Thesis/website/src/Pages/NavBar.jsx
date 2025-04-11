import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/android-icon-square.png";

const NavBar = () => {
  return (
    <>
      <div className="fixed w-full px-8 font-dm z-30">
        <div className="py-4 px-6 bg-main flex justify-between items-center rounded-b-lg ">
          <div className="flex justify-center items-center gap-2">
            <img src={logo} alt="/" className="w-[30px]" />
            <p className="hidden md:block font-semibold text-sm uppercase text-second">
              CRISP: Community Reporting Interface for Safety and Prevention
            </p>
            <p className="block md:hidden font-extrabold text-sm uppercase text-second">
              CRISP
            </p>
          </div>
          {/* menu dropdown */}
          <div className="relative flex gap-2">
            <Link to={"/login"}>
              <button className="bg-main border-accent border text-second py-2 px-12 font-extrabold text-xs rounded-full hover:bg-accent transition-all ">
                LOGIN
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
