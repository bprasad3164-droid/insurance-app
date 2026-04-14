import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Policies from "./pages/Policies";
import Claim from "./pages/Claim";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import Analytics from "./pages/Analytics";
import Register from "./pages/Register";
import ProfileKYC from "./pages/ProfileKYC";
import BuyPolicy from "./pages/BuyPolicy";
import MyPolicies from "./pages/MyPolicies";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import useAuthStore from "./store/authStore";

const RoleBasedDashboard = () => {
    const { role } = useAuthStore();
    if (role === "admin") return <AdminDashboard />;
    if (role === "agent") return <AgentDashboard />;
    return <Dashboard />;
};

export default function App() {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
        
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
            path="/dashboard" 
            element={
                <ProtectedRoute>
                    <RoleBasedDashboard />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/profile" 
            element={
                <ProtectedRoute>
                    <ProfileKYC />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/policies" 
            element={
                <ProtectedRoute>
                    <Policies />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/claim" 
            element={
                <ProtectedRoute roleRequired="user">
                    <Claim />
                </ProtectedRoute>
            } 
        />

        <Route 
            path="/buy/:id" 
            element={
                <ProtectedRoute>
                    <BuyPolicy />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/my-policies" 
            element={
                <ProtectedRoute>
                    <MyPolicies />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/payment-success" 
            element={
                <ProtectedRoute>
                    <PaymentSuccess />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/analytics" 
            element={
                <ProtectedRoute roleRequired="admin">
                    <Analytics />
                </ProtectedRoute>
            } 
        />
      </Routes>
    </BrowserRouter>
  );
}

