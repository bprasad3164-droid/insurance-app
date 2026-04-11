import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import AgentLogin from "./pages/AgentLogin";
import Policies from "./pages/Policies";
import Claim from "./pages/Claim";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user" element={<UserLogin />} />
        <Route path="/agent" element={<AgentLogin />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
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
            path="/admin-dashboard" 
            element={
                <ProtectedRoute>
                    <AdminDashboard />
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
