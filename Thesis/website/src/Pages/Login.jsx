import React, { useState, useEffect } from "react";
import logo from "../assets/android-icon-square.png";
import { Link } from "react-router-dom";
import { LuUser, LuKey, LuEye, LuEyeOff } from "react-icons/lu";
import axiosInstance from "../axios-instance"; // Ensure this imports your configured axios instance
import { useAuth } from "../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import OtpModal from "../Components/Modals/OtpModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false); // State to control OTP modal visibility
  const [otpEmail, setOtpEmail] = useState(""); // State to store email for OTP verification

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const { onLogin, authenticated } = useAuth();
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email before proceeding
    if (!isValidEmail(email)) {
      setErrors("Please enter a valid email address.");
      setIsLoading(false);
      setTimeout(() => {
        setErrors("");
      }, 3000);
      return;
    }

    try {
      const res = await onLogin(email, password);
      if (res && res.account_type) {
        // console.log("Account type:", res.account_type);
        if (
          res.account_type === "superadmin" ||
          res.account_type === "super_admin"
        ) {
          if (res) {
            navigate("/admin/dashboard");
          }
        } else if (res.account_type === "department_admin") {
          if (res.is_email_verified) {
            navigate("/dept-admin/dashboard");
          } else {
            setOtpEmail(email);
            setShowOtpModal(true);
          }
        } else {
          setErrorMessage("Invalid account type. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    try {
      const res = await axiosInstance.post("/api/resend-otp/verify/", {
        email: otpEmail,
      });
      if (res.status === 200) {
        navigate("/dept-admin/dashboard"); // Redirect to department admin dashboard
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("OTP verification failed. Please try again.");
    } finally {
      setShowOtpModal(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await axiosInstance.post("/api/resend-otp-department/", {
        email: otpEmail,
      });
      if (res.status === 200) {
        alert("OTP Sent successfully.");
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Failed to resend OTP. Please try again.");
    }
  };

  // Automatically send OTP when the modal is shown
  useEffect(() => {
    if (showOtpModal) {
      handleResendOtp();
    }
  }, [showOtpModal]);

  // Allow form submission on "Enter" key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="relative bg-main h-[100vh] w-[100vw] overflow-hidden">
      {/* background */}
      <div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3 z-10"></div>
      </div>
      {/* page */}
      <div className="relative h-[100vh] w-[100vw] flex flex-col md:flex-row gap-4 md:gap-6 justify-items-center items-center z-20 overflow-auto">
        {/* logo and title */}
        <div className="relative flex flex-col justify-center items-center w-full h-auto">
          <img
            src={logo}
            alt="logo"
            className="md:h-[35vh] md:w-[35vh] h-[20vh] w-[20vh] md:mt-0 mt-20 mb-7"
          />
          <div className="md:text-5xl text-3xl font-bold text-second mb-2">
            CRISP
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center text-center items-center text-second">
            (Community Reporting Interface for Safety and Prevention)
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-second mb-2">
            A Smarter Way to Protect Your Neighborhood
          </div>
        </div>
        {/* login form */}
        <div className="relative w-full h-auto flex flex-col justify-center items-center p-7 md:mt-0 mt-14 md:mb-0 mb-14">
          <div className="bg-second h-auto w-full lg:w-1/2 md:w-auto p-9 rounded-[10px] border border-accent">
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
              <div className="flex flex-col justify-center items-center">
                <div className="md:text-2xl text-lg font-bold text-main uppercase">
                  Welcome Back
                </div>
                <p className="text-xs md:mb-6 mb-4">login to your account</p>
              </div>
              <div className="flex flex-col justify-center items-center w-full h-auto gap-4">
                <div className="w-full flex flex-col gap-2">
                  <p className="text-xs font-semibold px-1">Email</p>
                  <div className="py-3 px-4 bg-[#f6edff] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                    <LuUser className="text-md text-main" />
                    <input
                      type="text"
                      placeholder="enter email"
                      className="text-xs w-full outline-none bg-[#f6edff] truncate"
                      role="presentation"
                      autoComplete="off"
                      onChange={(e) => setEmail(e.target.value)}
                      id="email-input"
                      value={email}
                    />
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <p className="text-xs font-semibold px-1">Password</p>
                  <div className="py-3 px-4 bg-[#f6edff] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                    <LuKey className="text-md text-main" />
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="enter password"
                      className="text-xs w-full outline-none bg-[#f6edff] truncate"
                      role="presentation"
                      autoComplete="off"
                      onChange={(e) => setPassword(e.target.value)}
                      id="password-input"
                      value={password}
                    />
                    <button type="button" onClick={togglePasswordVisibility}>
                      {isPasswordVisible ? (
                        <LuEyeOff className="text-md text-main" />
                      ) : (
                        <LuEye className="text-md text-main" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Error Message */}
                {errorMessage && (
                  <div className="w-full flex justify-start">
                    <p className="text-xs font-bold text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                )}
                <div className="w-full flex justify-end">
                  <Link
                    to="/forgot-password" // Adjust the path to your forgot password page
                    className="text-main font-bold md:text-sm text-xs"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="flex w-full items-left justify-left flex-col">
                  {errors ? (
                    <p className="text-xs text-red-800 font-semibold flex text-left w-full mt-2">
                      {errors}
                    </p>
                  ) : null}
                </div>
                <div className="w-full flex items-end justify-end pt-4">
                  <button
                    type="submit"
                    className="text-xs font-semibold text-white bg-main px-6 py-2 rounded-md hover:bg-textSecond ease-in-out duration-700 flex items-center justify-center"
                    disabled={isLoading} // Disable the button while loading
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
                          strokeDasharray="125" // This controls the length of the dash
                          strokeDashoffset="50" // This controls the offset for the dash, creating the "progress" effect
                          className="circle" // Apply rotation animation to this circle
                        />
                      </svg>
                    ) : null}
                    {isLoading ? null : <span>Login</span>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <OtpModal
        isVisible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp} // Pass the resend OTP handler
        otpEmail={otpEmail} // Pass the email for OTP verification
      />
    </div>
  );
};

export default Login;
