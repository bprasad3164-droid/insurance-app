import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldCheck, Download, Calendar, Activity, CheckCircle2, ArrowRight, ArrowLeft, User, Hash, IndianRupee, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyPolicies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const fetchMyPolicies = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) {
        navigate("/login");
        return;
    }
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/my-policies/", {
          headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching policies", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyPolicies();
  }, [fetchMyPolicies]);

  const handleDownload = (certId) => {
    if (!certId) return alert("Certificate ID missing for this policy.");
    window.location.href = `http://127.0.0.1:8000/api/download-cert/${certId}/`;
  };

  const handleRenewal = async (policyId) => {
    const token = localStorage.getItem("access");
    try {
        await axios.post("http://127.0.0.1:8000/api/renewals/create/", 
            { policy_id: policyId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Renewal request submitted successfully. An agent will be assigned to verify your profile.");
    } catch (err) {
        alert("Renewal request failed: " + (err.response?.data?.msg || err.message));
    }
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div className="flex items-center gap-4">
                <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-gray-600">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button onClick={() => navigate("/dashboard")} className="clay p-3 hover:text-blue-600 transition rounded-xl" title="Home">
                    <Home className="w-5 h-5 text-gray-600" />
                </button>
                <div className="clay p-4 rounded-3xl text-blue-600">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">My Portfolio</h1>
                    <p className="text-xs font-black tracking-[0.3em] text-blue-600 uppercase">Active Protection Logs</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate("/policies")}
                    className="clay px-8 py-4 rounded-2xl font-black text-gray-800 hover:text-blue-600 transition flex items-center gap-3 group"
                >
                    Browse New Plans <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="/claim" className="clay px-5 py-4 rounded-2xl font-black text-gray-600 hover:text-green-600 transition flex items-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </header>

        {data.length === 0 ? (
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="clay p-20 text-center flex flex-col items-center"
            >
                <Activity className="w-20 h-20 text-gray-300 mb-8" />
                <h2 className="text-3xl font-black text-gray-700 mb-4">No active policies found.</h2>
                <p className="text-gray-400 font-medium mb-10 max-w-sm">Secure your future today. Head over to the marketplace to find the perfect plan for you.</p>
                <button onClick={() => navigate("/policies")} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition">Explore Plans</button>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {data.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="clay p-10 group hover:translate-y-[-5px] transition-all relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="clay-inset p-3 rounded-2xl text-blue-600">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <span className="font-black text-gray-400 text-xs tracking-widest">{item.certificate_id || 'PENDING-ID'}</span>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${item.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
                                <CheckCircle2 className="w-3 h-3" /> {item.status || 'Processing'}
                            </span>
                        </div>

                        <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{item.policy_name}</h3>
                        <p className="text-gray-400 font-bold text-sm mb-10">Secured Investment Dashboard</p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="clay-inset p-6 rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Premium</p>
                                <p className="text-xl font-black text-gray-800">₹{item.premium?.toLocaleString() || 'N/A'}</p>
                            </div>
                            <div className="clay-inset p-6 rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Maturity</p>
                                <p className="text-xl font-black text-gray-800">{new Date(item.purchase_date).getFullYear() + 2}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleDownload(item.certificate_id)}
                                className="flex-1 clay p-5 rounded-2xl font-black flex items-center justify-center gap-3 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                <Download className="w-6 h-6" /> Certificate
                            </button>
                            <button 
                                onClick={() => handleRenewal(item.id)}
                                className="flex-1 clay p-5 rounded-2xl font-black flex items-center justify-center gap-3 text-gray-600 hover:bg-green-600 hover:text-white transition-all shadow-lg active:scale-95 uppercase text-[10px] tracking-widest"
                            >
                                Extend Coverage
                            </button>
                        </div>

                        
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <ShieldCheck className="w-64 h-64" />
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}
