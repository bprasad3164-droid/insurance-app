import { useState, useEffect } from "react";
import { ShieldCheck, FileText, BarChart3, LogOut, ChevronRight, User, Clock, Activity, ArrowLeft } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ClaimTracking from "../components/ClaimTracking";

export default function Dashboard() {
  const [role] = useState(localStorage.getItem("role") || "");
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

  const fetchMyClaims = async () => {
    try {
        const token = localStorage.getItem("access");
        const res = await axios.get("http://127.0.0.1:8000/api/claim/my/", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setClaims(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const load = async () => {
        await fetchMyClaims();
    };
    load();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] w-full p-10 flex flex-col items-center">
      <header className="flex justify-between items-center clay p-6 mb-16 w-full max-w-6xl shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <ShieldCheck className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Executive Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/policies" className="clay px-5 py-3 rounded-xl font-black text-gray-600 hover:text-green-600 transition flex items-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </a>
          <a href="/profile" className="clay p-3 hover:text-blue-600 transition rounded-xl" title="Profile & KYC">
            <User className="w-6 h-6" />
          </a>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="clay p-16 w-full max-w-5xl text-center border border-white/50"
      >
        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Session Active</span>
        <h2 className="text-7xl font-black mb-10 text-gray-800 tracking-tighter leading-none">
          Welcome,<br />
          <span className="text-blue-600 capitalize">{role || "Handshake Member"}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.a
            href="/my-policies"
            whileHover={{ scale: 1.05 }}
            className="clay p-8 bg-white/50 border border-white flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Marketplace</p>
              <p className="text-2xl font-black text-gray-800 tracking-tight">My Active Plans</p>
            </div>
            <ChevronRight className="w-8 h-8 text-blue-600 group-hover:translate-x-2 transition-transform" />
          </motion.a>

          <motion.a
            href={role === "admin" || role === "agent" ? "/dashboard" : "/claim"}
            whileHover={{ scale: 1.05 }}
            className="clay p-8 bg-white/50 border border-white flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Operations</p>
              <p className="text-2xl font-black text-gray-800 tracking-tight">
                {role === "admin" || role === "agent" ? "System Oversight" : "File a Claim"}
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-blue-600 group-hover:translate-x-2 transition-transform" />
          </motion.a>

          <motion.a
            href="/profile"
            whileHover={{ scale: 1.05 }}
            className="clay p-8 bg-blue-600 text-white flex items-center justify-between group shadow-xl"
          >
            <div className="text-left">
              <p className="text-xs font-black opacity-60 uppercase tracking-widest">Member Center</p>
              <p className="text-2xl font-black tracking-tight">KYC & Certs</p>
            </div>
            <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </motion.a>
        </div>

        {role === "admin" && (
          <motion.a
            href="/analytics"
            whileHover={{ scale: 1.02 }}
            className="clay mt-8 p-6 bg-gray-900 text-white flex items-center justify-center gap-4 group"
          >
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div className="text-left">
              <p className="text-xs font-black opacity-60 uppercase tracking-widest">Admin Only</p>
              <p className="text-2xl font-black tracking-tight">Business Intelligence</p>
            </div>
            <ChevronRight className="w-8 h-8 ml-auto group-hover:translate-x-2 transition-transform" />
          </motion.a>
        )}
      </motion.div>

      {/* Claim Tracking Sidebar/Section */}
      <div className="w-full max-w-5xl mt-20">
          <div className="flex items-center gap-4 mb-10">
              <div className="clay p-4 rounded-3xl text-blue-600">
                  <Clock className="w-8 h-8" />
              </div>
              <div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Settlement Timeline</h2>
                  <p className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">Real-time status tracking</p>
              </div>
          </div>
          {claims.length > 0 ? (
              <ClaimTracking claims={claims} />
          ) : (
              <div className="clay p-12 text-center bg-gray-50/30">
                  <p className="text-gray-400 font-bold italic">No active claims currently being tracked.</p>
              </div>
          )}
      </div>
    </div>
  );
}
