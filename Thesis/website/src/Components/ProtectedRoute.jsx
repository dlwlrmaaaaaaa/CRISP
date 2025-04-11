import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext"; // Import the useAuth hook

const ProtectedRoute = () => {
  const { authenticated } = useAuth(); // Get the authenticated status from context

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
