import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleRequired }) {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // Not logged in — go to home
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Wrong role — go to dashboard (not infinite loop)
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
