import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", { email, password });
      if (res.data.role !== "agent") {
        setError("Access Denied: Agent credentials required.");
        setLoading(false);
        return;
      }
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("kyc_status", res.data.kyc_status || "Pending");
      localStorage.setItem("email", email);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Login failed. Make sure the backend server is running."
      );
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full" style={{ background: "#e0e5ec" }}>
      <div className="clay p-10 w-96">
        <h2 className="text-3xl font-black mb-2 text-center text-gray-800 tracking-tight">Agent Login</h2>
        <p className="text-center text-gray-400 font-medium text-sm mb-8">Verification Officer Portal</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full p-4 rounded-2xl outline-none font-medium text-gray-800 placeholder:text-gray-400"
            style={{ background: "#e0e5ec", boxShadow: "inset 6px 6px 10px #a3b1c6, inset -6px -6px 10px #ffffff" }}
            placeholder="Agent Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="w-full p-4 rounded-2xl outline-none font-medium text-gray-800 placeholder:text-gray-400"
            style={{ background: "#e0e5ec", boxShadow: "inset 6px 6px 10px #a3b1c6, inset -6px -6px 10px #ffffff" }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="w-full text-white font-black p-4 mt-8 rounded-2xl transition-all active:scale-95"
          style={{ background: loading ? "#c4b5fd" : "#7c3aed", cursor: loading ? "not-allowed" : "pointer" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Agent Access"}
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
