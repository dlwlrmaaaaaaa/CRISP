// ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';  // Adjust the import path as necessary

const ProtectedRoute = () => {
  const authenticated = localStorage.getItem('accessToken')
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;