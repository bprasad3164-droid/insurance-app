import axios from "axios";
import { useState } from "react";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", { email, password });
      if (res.data.role !== "user") {
        alert("Access Denied: Please use the correct login page for your role.");
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
        <h2 className="text-3xl font-black mb-2 text-center text-gray-800 tracking-tight">User Login</h2>
        <p className="text-center text-gray-400 font-medium text-sm mb-8">Policy Holder Portal</p>
        <div className="space-y-4">
          <input
            className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-green-400 outline-none transition-all placeholder:text-gray-400 font-medium"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-green-400 outline-none transition-all placeholder:text-gray-400 font-medium"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-green-600 text-white font-black p-4 mt-8 rounded-2xl hover:bg-green-700 transition-all shadow-xl active:scale-95 disabled:opacity-60"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Portal Entry"}
        </button>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400 font-medium">New here? </span>
          <a href="/register" className="text-sm font-bold text-green-600 hover:underline">Create Account</a>
        </div>
        <div className="mt-4 text-center">
          <a href="/" className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
