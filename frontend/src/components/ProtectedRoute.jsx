import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="app-soft-loader" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = (user.role || "").replace("ROLE_", "").toUpperCase();
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
