import React, { useState, useEffect } from "react";
import axios from "axios";

import Data from "../../JSON/accounts.json";
import Navbar from "./Navigation/NavBar";
import NavText from "./Navigation/NavText";
import ReviewAccount from "../../Components/Modals/ReviewAccount";
import AddAccount from "../../Components/Modals/AddAccount";
import DenyVerification from "../../Components/Modals/DenyVerification";

import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useAuth } from "../../AuthContext/AuthContext";
import axiosInstance from "../../axios-instance";

const Accounts = () => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [violation, setViolation] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [userID, setUserID] = useState("");
  const [address, setAddress] = useState(""); // Fixed typo from "aaddress" to "address"
  const [emailAddress, setEmailAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [photo, setPhoto] = useState("");
  const [selfieWId, setSelfieWId] = useState("");
  const [idPicture, setIdPicture] = useState("");

  // const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [selectedAccountType, setSelectedAccountType] = useState("");
  const accountType = ["department_admin", "citizen", "worker"];
  const { account_type, departments, authenticated, users } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status filter
  const accountStatuses = ["Status", "Suspended", "Blocked"];
  const [station, setStation] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedVerified, setSelectedVerified] = useState(""); // Selected verified filter
  const accountVerified = ["Verified", "Not Verified"];
  const user_id = localStorage.getItem("user_id");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page
  const [filterOpen, setFilterOpen] = useState(false); // State for dropdown filte

  const filteredUsers = users.filter((user) => {
    const matchesType =
      selectedAccountType === "" || user.role === selectedAccountType;
    const matchesStatus =
      selectedStatus === "" || user.account_status === selectedStatus;
    const matchesVerified =
      selectedVerified === "" ||
      (selectedVerified === "Verified" ? user.is_verified : !user.is_verified);
    const matchesUserId = user.supervisor == user_id;
    return matchesType && matchesStatus && matchesVerified && matchesUserId; // Only include users that match both filters
  });
  const handleAddAccount = () => {
    setShowAddAccount(true);
  };

  // Calculate total pages
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Create an array of page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Handle page navigation
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.date_joined);
    const dateB = new Date(b.date_joined);
    return dateB - dateA; // descending order
  });

  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const statuses = [...new Set(Data.map((item) => item.status))];
  // useEffect(() => {
  //   console.log("User: ", currentUsers);
  // }, []);
  // Get unique report types and statuses for dropdown options
  // const accountType = [...new Set(Data.map((item) => item.type))];
  // const accountVerified = [...new Set(Data.map((item) => item.verified))];

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convert to Date object
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ""); // Replace comma between date and time (optional)
  };

  return (
    <>
      <div className="relative bg-second h-[100vh] w-[100vw] overflow-hidden">
        {/* bg square */}
        <div className="absolute inset-0 z-10">
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
          <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
        </div>

        {/* content */}
        <div className="relative h-[100vh] w-[100vw] flex flex-col items-center z-30 overflow-auto">
          <Navbar />
          <NavText />
          <div className="flex pt-5 mb-[5vh] mt-[30vh] md:mt-[30vh] lg:mt-[20vh] ">
            <div className="bg-white border-2 border-main flex flex-col rounded-lg antialiased min-h-[70vh] w-full mx-10">
              {/* header and filter button */}
              <div className="flex flex-row justify-between bg-main">
                <div className="flex justify-center items-center py-3 px-8">
                  <p className="text-white font-semibold text-sm">accounts</p>
                </div>
                <div className="flex flex-row">
                  <div
                    className="bg-white text-main font-bold text-sm py-3 px-6 border border-accent border-b-main rounded-t-lg hover:bg-main hover:text-accent ease-in-out duration-500 text-center cursor-pointer"
                    onClick={handleAddAccount}
                  >
                    ADD ACCOUNT
                  </div>
                  <div>
                    <div
                      className={`font-bold text-sm py-3 px-6 border border-b-main rounded-t-lg hover:bg-main hover:text-accent ease-in-out duration-500 text-center cursor-pointer h-full ${
                        filterOpen ? "bg-main text-white" : "bg-white text-main"
                      }`}
                      onClick={() => setFilterOpen(!filterOpen)}
                    >
                      FILTER
                    </div>
                    {filterOpen && (
                      <div className="absolute top-auto right-10 mt-2 bg-white border rounded-md shadow-lg w-48">
                        {/* <div className="p-2">
                          <p className="font-bold text-main">Account Type</p>
                          <ul className="list-disc pl-4">
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedAccountType("");
                                  setFilterOpen(
                                    (prevFilterOpen) => !prevFilterOpen
                                  );
                                }}
                                className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300 ${
                                  selectedAccountType === ""
                                    ? "font-bold text-main"
                                    : "text-textSecond"
                                }`}
                              >
                                All
                              </button>
                            </div>
                            {accountType.map((type, index) => (
                              <div key={index}>
                                <button
                                  onClick={() => {
                                    setSelectedAccountType(type);
                                    setFilterOpen(
                                      (prevFilterOpen) => !prevFilterOpen
                                    );
                                  }}
                                  className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                    selectedAccountType === type
                                      ? "font-bold text-main"
                                      : "text-textSecond"
                                  }`}
                                >
                                  {type}
                                </button>
                              </div>
                            ))}
                          </ul>
                        </div> */}
                        {/* <div className="p-2 border-t">
                          <p className="font-bold text-main">Status</p>
                          <ul className="list-disc pl-4">
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedStatus("");
                                  setFilterOpen(
                                    (prevFilterOpen) => !prevFilterOpen
                                  );
                                }}
                                className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                  selectedStatus === ""
                                    ? "font-bold text-main"
                                    : "text-textSecond"
                                }`}
                              >
                                All
                              </button>
                            </div>
                            {statuses.map((status, index) => (
                              <div key={index}>
                                <button
                                  onClick={() => {
                                    setSelectedStatus(status);
                                    setFilterOpen(
                                      (prevFilterOpen) => !prevFilterOpen
                                    );
                                  }}
                                  className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                    selectedStatus === status
                                      ? "font-bold text-main"
                                      : "text-textSecond"
                                  }`}
                                >
                                  {status}
                                </button>
                              </div>
                            ))}
                          </ul>
                        </div> */}
                        <div className="p-2 border-t">
                          <p className="font-bold text-main">Verified</p>
                          <ul className="list-disc pl-4">
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedVerified("");
                                  setFilterOpen(
                                    (prevFilterOpen) => !prevFilterOpen
                                  );
                                }}
                                className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300  ${
                                  selectedVerified === ""
                                    ? "font-bold text-main"
                                    : "text-textSecond"
                                }`}
                              >
                                All
                              </button>
                            </div>
                            {accountVerified.map((verified, index) => (
                              <div key={index}>
                                <button
                                  onClick={() => {
                                    setSelectedVerified(verified);
                                    setFilterOpen(
                                      (prevFilterOpen) => !prevFilterOpen
                                    );
                                  }}
                                  className={`block py-1 px-2 text-sm capitalize hover:text-main duration-300 ${
                                    selectedVerified === verified
                                      ? "font-bold text-main"
                                      : "text-textSecond"
                                  }`}
                                >
                                  {verified}
                                </button>
                              </div>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* table header*/}
              <div className="hidden md:block px-5 py-5 h-full">
                {currentUsers.length === 0 ? (
                  <p className="text-center text-gray-500 w-[90vw]">
                    No users found
                  </p>
                ) : (
                  <table className="w-full table-fixed">
                    <thead className="text-xs font-bold text-gray-500">
                      <tr className="border-b">
                        <th scope="col" className="text-start p-3 truncate">
                          Name
                        </th>
                        <th scope="col" className="text-start p-3 truncate">
                          Phone Number
                        </th>
                        <th scope="col" className="text-center p-3 truncate">
                          Verified
                        </th>
                        <th scope="col" className="text-center p-3 truncate">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((data) => (
                        <tr
                          className="text-xs font-normal even:bg-square hover:bg-[#f6edff] ease-in-out duration-500 cursor-pointer border-b"
                          key={data.id} // Use the unique id from the user data
                        >
                          <th
                            scope="row"
                            className="text-[#24693c] text-start p-4"
                          >
                            <p className="w-full truncate">{data.username}</p>
                          </th>
                          <td className="p-4">
                            <p className="w-full truncate">
                              {data.contact_number}
                            </p>
                          </td>
                          <td className="p-4 text-center font-semibold uppercase">
                            {data.is_verified ? (
                              <p className="w-full font-bold truncate text-[#007a3f]">
                                Verified
                              </p>
                            ) : (
                              <p className="w-full truncate font-bold text-[#a10b00]">
                                Not Verified
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              className="bg-main text-white py-2 px-4 font-semibold rounded-md hover:bg-textSecond ease-in-out duration-500 truncate"
                              onClick={() => {
                                // Handle the review button click
                                setShowAccount(true);
                                setName(data.username);
                                setPhoneNumber(data.contact_number);
                                setVerified(data.is_verified);
                                setViolation(data.violation);
                                setStatus(data.account_status);
                                setType(data.role);
                                setAddress(data.address);
                                setEmailAddress(data.email);
                                setIdNumber(data.id_number);
                                setPhoto(data.photo);
                                setSelfieWId(data.selfie_w_id);
                                setIdPicture(data.id_picture);
                              }}
                            >
                              REVIEW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* small screen  */}
              <div className="block md:hidden px-5 py-5">
                {currentUsers.length === 0 ? (
                  <p className="text-center text-gray-500">No users found</p>
                ) : (
                  currentUsers.map((data) => (
                    <div
                      key={data.id}
                      className="bg-[#FAF5FF] min-w-[250px] max-w-[300px] min-h-[250px] border border-main rounded-lg px-6 py-6 flex flex-col mt-2"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex gap-4">
                          <div className="flex items-center justify-center rounded-md">
                            <div className="bg-square p-4 rounded-lg">
                              <HiOutlineDocumentReport className="text-[#2f2f2f] text-xl" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-between py-1 w-full">
                            <div className="grid gap-1 text-start">
                              <p className="text-xs font-bold text-[#113e21] truncate">
                                {data.username}
                              </p>
                              <p className="text-xs font-bold text-[#2f2f2f] capitalize truncate">
                                {data.contact_number}
                              </p>
                              <p className="text-xs font-bold capitalize truncate">
                                {data.is_verified ? (
                                  <span className="text-[#007a3f]">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-[#a10b00]">
                                    Not Verified
                                  </span>
                                )}
                              </p>
                              <p className="text-xs font-normal text-[#2f2f2f] capitalize truncate">
                                {data.violation}
                              </p>

                              <p className="text-xs font-bold capitalize truncate">
                                {data.role === "superadmin" ? (
                                  <span className="text-[#363636]">
                                    {data.role}
                                  </span>
                                ) : data.role === "citizen" ? (
                                  <span className="text-[#363636]">
                                    {data.role}
                                  </span>
                                ) : (
                                  <span className="text-[#363636]">
                                    {data.role}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs font-bold capitalize truncate">
                                {data.account_status === "active" ? (
                                  <span className="text-[#007a3f]">
                                    {data.account_status}
                                  </span>
                                ) : data.account_status === "Suspended" ? (
                                  <span className="text-[#af3232]">
                                    {data.account_status}
                                  </span>
                                ) : (
                                  <span className="text-[#363636]">
                                    {data.account_status}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center items-center mt-4">
                        <button
                          className="bg-main text-white w-full py-2 px-4 font-semibold rounded-md hover:bg-textSecond hover:scale-105 ease-in-out duration-500 truncate"
                          onClick={() => {
                            setShowAccount(true);
                            setName(data.username);
                            setPhoneNumber(data.contact_number);
                            setVerified(data.is_verified);
                            setViolation(data.violation);
                            setStatus(data.account_status);
                            setType(data.role);
                            setAddress(data.address);
                            setEmailAddress(data.email);
                            setIdNumber(data.id_number);
                            setPhoto(data.photo);
                            setSelfieWId(data.selfie_w_id);
                            setIdPicture(data.id_picture);
                          }}
                        >
                          REVIEW
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* pagination  */}
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex flex-row gap-1 items-center justify-end w-full px-12 py-6">
                  <button
                    className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                    }}
                    disabled={currentPage === 1}
                  >
                    <FaAngleLeft className="text-xs text-main" />
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`p-1 ease-in-out duration-500 font-semibold ${
                        pageNumber === currentPage
                          ? "text-md text-main font-bold"
                          : "text-xs text-textSecond font-semibold"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      nextPage();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <FaAngleRight className="text-xs text-main" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewAccount
        isVisible={showAccount}
        onClose={() => setShowAccount(false)}
        userName={name}
        phoneNumber={phoneNumber}
        verified={verified}
        violation={violation}
        accountStatus={status}
        type={type}
        address={address}
        emailAddress={emailAddress}
        userId={userID}
      />
      <AddAccount
        isVisible={showAddAccount}
        departments={departments}
        account_type={account_type}
        onClose={() => setShowAddAccount(false)}
      />
    </>
  );
};

export default Accounts;
