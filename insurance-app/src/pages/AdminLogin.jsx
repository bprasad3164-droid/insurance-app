import axios from "axios";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", { email, password });
      if (res.data.role !== "admin") {
        alert("Access Denied: You do not have Admin privileges.");
        setLoading(false);
        return;
      }
      // Standardized keys
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("kyc_status", res.data.kyc_status || "Pending");
      localStorage.setItem("email", email);
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Login failed. Check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e0e5ec] w-full">
      <div className="clay p-10 w-96 shadow-2xl">
        <h2 className="text-3xl font-black mb-2 text-center text-gray-800 tracking-tight">Admin Login</h2>
        <p className="text-center text-gray-400 font-medium text-sm mb-8">Executive Access Portal</p>
        <div className="space-y-4">
          <input
            className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-blue-300 outline-none transition-all placeholder:text-gray-400 font-medium"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-blue-300 outline-none transition-all placeholder:text-gray-400 font-medium"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-600 text-white font-black p-4 mt-8 rounded-2xl hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-60"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Secure Login"}
        </button>
        <div className="mt-6 text-center">
          <a href="/" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
