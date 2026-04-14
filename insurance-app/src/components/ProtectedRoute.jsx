import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children, roleRequired }) {
    const { isAuthenticated, role, loading } = useAuthStore();

    if (loading) {
        return <div className="flex items-center justify-center h-screen font-black text-blue-600">Authenticating...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (roleRequired && role !== roleRequired) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

