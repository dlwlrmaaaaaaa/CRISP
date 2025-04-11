import React, { useState } from "react";

import { NavLink } from "react-router-dom";

const NavText = () => {
  const Links = [
    { name: "Dashboard", path: "/dept-admin/dashboard" },
    { name: "Reports", path: "/dept-admin/reports" },
    { name: "Analysis", path: "/dept-admin/analysis" },
    { name: "Accounts", path: "/dept-admin/accounts" },
  ];

  return (
    <>
      <div className="absolute w-full px-8 overflow-hidden font-dm pt-16">
        {/* Links */}
        <div>
          <div className="flex flex-wrap justify-center items-center uppercase">
            {Links.map((link, index) => (
              <div
                key={index}
                className="w-auto font-bold lg:my-7 md:my-5 md:ml-12 my-3 ml-6 md:text-lg text-md"
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? "text-main" : "text-textSecond hover:text-main"
                  }
                >
                  {link.name}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavText;
