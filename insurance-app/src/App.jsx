import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import AgentLogin from "./pages/AgentLogin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user" element={<UserLogin />} />
        <Route path="/agent" element={<AgentLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
