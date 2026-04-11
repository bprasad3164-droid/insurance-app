import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, UserCheck } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", { email, password, role });
      alert("Registration Successful! Please login.");
      navigate(`/${role}`);
    } catch (err) {
      alert("Error: " + err.response.data.msg);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay p-10 w-full max-w-md shadow-2xl"
      >
        <div className="mb-8 text-center">
            <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Join Pro Insurance</h2>
            <p className="text-gray-500 font-medium">Create your startup ecosystem account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input 
              className="clay-inset w-full p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold" 
              placeholder="Email Address" 
              type="email"
              required
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input 
              className="clay-inset w-full p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold" 
              type="password" 
              placeholder="Strong Password" 
              required
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <div className="relative">
            <UserCheck className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <select 
              className="clay-inset w-full p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold appearance-none"
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
            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest"
          >
            Create Account
          </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-bold">
            Already a member? <a href="/" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </motion.div>
    </div>
  );
}
