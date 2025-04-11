import React, { useState, useEffect } from "react";

import Prompt from "./Prompt";
import { LuEye, LuEyeOff, LuMapPin } from "react-icons/lu";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { useAuth } from "../../AuthContext/AuthContext";
import MapPicker from "./MapPicker";
import axiosInstance from "../../axios-instance";

const AddDeptType = ({ isVisible, onClose, account_type }) => {
  if (!isVisible) return null;

  const { departments, department } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [departmentType, setDepartmentType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [incompleteInput, setIncompleteInput] = useState(false);
  const [errors, setErrors] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [depts, setDepts] = useState(departments);
  const [load, setLoad] = useState({});

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const handlePromtClick = () => {
    setShowPrompt(true);
  };

  const handleLeave = () => {
    setShowPrompt(false);
    onClose(); // Close the AddAccount modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if the departmentType field is empty
    if (!departmentType) {
      setIncompleteInput(true);
      setIsLoading(false);
      // console.log("Fields: ", departmentType);
      setTimeout(() => {
        setIncompleteInput(false);
      }, 3000);
      return;
    }

    // Normalize the departmentType by removing the "s" at the end (if plural)
    const normalize = (str) => {
      return str.endsWith("s") ? str.slice(0, -1) : str; // Remove trailing "s" if it exists
    };

    const normalizedInput = normalize(departmentType.toLowerCase());

    // Check if the normalized input matches any existing department name
    const duplicate = departments.some((department) =>
      normalize(department.name.toLowerCase()).includes(normalizedInput)
    );

    if (duplicate) {
      setErrors("Department name is too similar to an existing department.");
      setTimeout(() => {
        setErrors(false);
      }, 3000);
      setIsLoading(false); // Stop loading spinner for duplicates
      return;
    }

    // Check if departmentType is too short (e.g., less than 3 characters)
    if (departmentType.length < 3) {
      setErrors(
        "Department name is too short. Please enter at least 3 characters."
      );
      setTimeout(() => {
        setErrors(false);
      }, 3000);
      setIsLoading(false); // Stop loading spinner for invalid input
      return;
    }

    const res = await axiosInstance.post("api/department/create/", {
      name: departmentType,
    });
    if (res.status === 200 || res.status === 201) {
      // console.log("Department added successfully!");
      setIsLoading(false);
      setDepartmentType("");
      depts.push(res.data);
      // onClose();
    } else {
      // console.log("Failed to add department.");
      alert("Failed to add department.");
      setIsLoading(false);
    }
  };

  // Function to show delete confirmation modal
  const confirmDeleteDepartment = (department) => {
    setDepartmentToDelete(department);
    setDeleteConfirmVisible(true);
  };

  // Handle the actual deletion
  const deleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      setLoad((prev) => ({ ...prev, [departmentToDelete.id]: true }));
      const res = await axiosInstance.delete(
        `api/department/${parseInt(departmentToDelete.id)}/delete/`
      );
      if (res.status === 200 || res.status === 204) {
        alert("Department deleted successfully!");
        setDepts((prev) =>
          prev.filter((department) => department.id !== departmentToDelete.id)
        );
        setDeleteConfirmVisible(false);
        setDepartmentToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    } finally {
      setLoad((prev) => ({ ...prev, [departmentToDelete.id]: false }));
    }
  };

  // Handle canceling deletion
  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setDepartmentToDelete(null);
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
                Add New Department Type
              </p>
            </div>
            <div className="w-full flex flex-col justify-center items-start gap-4 z-20">
              <div className="w-full ">
                <div className="w-full flex flex-col mt-4">
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="py-2 px-1 flex flex-row items-center justify-start w-full">
                      <p className="text-xs font-semibold">Department</p>
                      <p className="text-xs font-semibold text-red-700">*</p>
                    </div>
                    <div className="px-4 py-3 bg-white w-full flex items-center justify-center border border-main rounded-md">
                      <textarea
                        value={departmentType}
                        onChange={(e) => setDepartmentType(e.target.value)}
                        rows={1}
                        className="outline-none bg-white w-full resize-none text-xs font-normal overflow-hidden"
                        placeholder="Enter Department Type"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-6">
                  <div className="relative w-full flex items-center justify-start z-20 mb-2">
                    <p
                      className="text-md text-main uppercase font-extrabold cursor-pointer justify-between flex items-center"
                      onClick={toggleTableVisibility}
                    >
                      Existing Department Types{" "}
                      {isTableVisible ? <FaCaretRight /> : <FaCaretDown />}
                    </p>
                  </div>
                  {isTableVisible && (
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border-b text-xs font-semibold text-left">
                            ID
                          </th>
                          <th className="px-4 py-2 border-b text-xs font-semibold text-left">
                            Department Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {depts.map((department, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 border-b text-xs">
                              {department.id}
                            </td>
                            <td className="px-4 py-2 border-b text-xs">
                              {department.name}
                            </td>
                            <td className="px-4 py-2 border-b text-xs">
                              {/* Delete button */}
                              <button
                                onClick={() =>
                                  confirmDeleteDepartment(department)
                                }
                                className="text-red-600 hover:text-red-800 text-xs font-semibold border border-red-600 rounded-md px-2 py-1 items-center justify-center flex"
                              >
                                {load[department.id] ? (
                                  <svg
                                    className="animate-spin h-5 w-5 mr-3 text-red-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 50 50"
                                    stroke="currentColor"
                                  >
                                    <circle
                                      cx="25"
                                      cy="25"
                                      r="20"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeDasharray="125"
                                      strokeDashoffset="50"
                                    />
                                  </svg>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex items-center justify-start mt-2 flex-col">
                  {incompleteInput === true ? (
                    <p className="text-xs text-red-800 font-semibold flex text-left w-full mt-2">
                      Fill the Required Fields!
                    </p>
                  ) : null}
                  {errors ? (
                    <p className="text-xs text-red-800 font-semibold flex text-left w-full mt-2">
                      {errors}
                    </p>
                  ) : null}
                </div>
                <div className="w-full flex flex-row gap-4 items-center justify-end mt-5">
                  <button
                    onClick={handleSubmit}
                    className="py-3 px-4 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 50 50"
                        stroke="currentColor"
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="125"
                          strokeDashoffset="50"
                        />
                      </svg>
                    ) : null}
                    {isLoading ? null : <span>ADD</span>}
                  </button>
                  <button
                    className="py-3 px-4 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
                    onClick={handlePromtClick}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 w-1/3">
            <p className="text-lg font-bold text-center mb-4">
              Are you sure you want to delete this Department?
            </p>
            <div className="w-full flex flex-row gap-4 items-center justify-end mt-5">
              <button
                onClick={deleteDepartment}
                className="py-2 px-3 border border-accent bg-main text-white rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="py-2 px-3 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500 truncate"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Prompt
        isVisible={showPrompt}
        onClose={() => setShowPrompt(false)}
        onLeave={handleLeave}
      />
    </>
  );
};

export default AddDeptType;
