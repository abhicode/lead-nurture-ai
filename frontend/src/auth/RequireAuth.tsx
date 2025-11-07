import React from "react";
import { useAuth } from "./AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.token) {
    // Redirect to login, preserve the destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
