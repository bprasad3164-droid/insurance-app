import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, UserCheck, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", { email, password, role });
      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay p-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Join Pro Insurance</h2>
          <p className="text-gray-500 font-medium">Create your account to get started</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              className="w-full p-4 pl-12 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-blue-400 outline-none font-bold"
              placeholder="Email Address"
              type="email"
              required
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              className="w-full p-4 pl-12 pr-12 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-blue-400 outline-none font-bold"
              type={showPassword ? "text" : "password"}
              placeholder="Strong Password"
              required
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <UserCheck className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <select
              className="w-full p-4 pl-12 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-blue-400 outline-none font-bold appearance-none"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="user">Policy Holder (User)</option>
              <option value="agent">Verification Officer (Agent)</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-bold">
          Already a member? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
        <p className="mt-3 text-center">
          <a href="/home" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">← Back to Home</a>
        </p>
      </motion.div>
    </div>
  );
}
