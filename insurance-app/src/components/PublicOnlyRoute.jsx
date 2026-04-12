import { Navigate } from "react-router-dom";

/**
 * PublicOnlyRoute — wraps pages like /home that are meant ONLY for customers.
 * If an admin or agent is logged in and tries to visit, redirect them to
 * their own dashboard instead.
 */
export default function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // Admin or agent: redirect to their own dashboard
  if (token && (role === "admin" || role === "agent")) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Everyone else (guests + customers): allow through
  return children;
}
