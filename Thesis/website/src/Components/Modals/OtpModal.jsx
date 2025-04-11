import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios-instance";
import { useNavigate } from "react-router-dom";

const OtpModal = ({ isVisible, onClose, onSubmit, otpEmail }) => {
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(120); // Timer state for 120 seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true); // State to disable resend button
  const navigate = useNavigate();

  useEffect(() => {
    // Start the countdown timer when the modal is visible
    let countdown;
    if (isVisible && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000); // Decrease timer every second
    } else if (timer === 0) {
      setIsResendDisabled(false); // Enable resend button when timer reaches 0
    }
    return () => clearInterval(countdown); // Clean up on component unmount
  }, [isVisible, timer]);

  if (!isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/api/otp/verify/", {
        email: otpEmail,
        otp,
      });
      if (res.status === 200) {
        onSubmit(); // Call the onSubmit prop to handle successful OTP verification
        localStorage.setItem("isEmailVerified", true); // Update localStorage
        //window.location.reload(); // Refresh the page
        navigate("/dept-admin/dashboard"); // Redirect to department admin dashboard
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("OTP verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      const res = await axiosInstance.post("/api/resend-otp-department/", {
        email: otpEmail,
      });
      if (res.status === 200) {
        alert("OTP resent successfully.");
        setTimer(120); // Reset timer when OTP is resent
        setIsResendDisabled(true); // Disable the resend button again
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setErrorMessage("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-second p-10 rounded-lg shadow-lg w-full sm:w-96  border border-main">
        <h2 className="text-xl font-extrabold text-main mb-2">
          Verify your Email
        </h2>
        <p className="text-sm mb-6">
          CRISP has sent you an OTP to verify your email address.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="p-3 rounded-md w-full mb-6 bg-[#f6edff] text-xs font-semibold text-main placeholder:text-main  border border-main"
            placeholder="Enter OTP"
            autoFocus
          />
          {errorMessage && (
            <div className="text-red-500 text-xs mb-4">{errorMessage}</div>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendDisabled} // Disable the button when the timer is not over
              className="py-2 px-4 bg-[#f6edff] rounded-md text-main font-semibold text-sm border border-main"
            >
              {isResendDisabled ? `${timer}s` : "Resend OTP"}{" "}
              {/* Show countdown if disabled */}
            </button>
            <div className="flex">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 py-2 px-4 bg-[#f6edff] text-main rounded-md font-semibold text-sm border border-main"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-main text-white rounded-md font-semibold text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
