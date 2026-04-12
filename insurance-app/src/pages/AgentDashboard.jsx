import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, XCircle, LogOut, ArrowLeft, Home, FileText, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/login");
    };

    const handleHome = () => navigate("/dashboard");

    useEffect(() => {
        fetchClaims();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/claims/", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
            });
            
            // Robust check: Ensure res.data is an array before processing
            const claimsData = Array.isArray(res.data) ? res.data : [];
            setClaims(claimsData);
            
            const pending = claimsData.filter(c => c.agent_status === "Pending").length;
            const verified = claimsData.filter(c => c.agent_status === "Approved").length;
            setStats({ pending, verified });
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyClaim = async (id, status) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/approve-agent/${id}/`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
            });
            alert(`Claim #${id} successfully marked as ${status}.`);
            fetchClaims(); // Refresh data without full page reload
        } catch (err) {
            alert("Error updating claim: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const pendingClaims = claims.filter(c => c.agent_status === "Pending");

    return (
        <div className="min-h-screen bg-[#e0e5ec] p-8 flex flex-col items-center">
            
            {/* Header with Navigation */}
            <header className="flex justify-between items-center clay p-6 mb-12 w-full max-w-6xl shadow-xl sticky top-8 z-20 gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex gap-3">
                        <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-gray-500">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                        <button onClick={handleHome} className="clay p-3 hover:text-blue-600 transition rounded-xl" title="Dashboard">
                            <Home className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <ClipboardList className="text-blue-600 w-8 h-8" />
                        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Field Portal</h1>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-red-100 transition flex items-center gap-2"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </header>

            <main className="w-full max-w-6xl">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div whileHover={{ y: -5 }} className="clay p-8 flex flex-col bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Verification Backlog</p>
                        <span className="text-6xl font-black text-amber-500 tracking-tighter">{stats.pending}</span>
                    </motion.div>
                    
                    <motion.div whileHover={{ y: -5 }} className="clay p-8 flex flex-col bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Successful Audits</p>
                        <span className="text-6xl font-black text-blue-600 tracking-tighter">{stats.verified}</span>
                    </motion.div>

                    <div className="clay p-8 flex flex-col bg-blue-600 text-white justify-center">
                        <h3 className="font-black text-xl mb-1 tracking-tight">Agent Active</h3>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Digital Field Verification Unit</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <FileText className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Active Claim Queue</h2>
                </div>

                <div className="clay bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Claim Amount</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Status</th>
                                    <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-xs font-black text-blue-600 tracking-widest uppercase">Fetching Queue...</p>
                                        </td>
                                    </tr>
                                ) : pendingClaims.length > 0 ? (
                                    pendingClaims.map((claim, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={claim.id} 
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="p-6">
                                                <span className="font-black text-gray-800">#{claim.id}</span>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm font-bold text-gray-700">User ID: {claim.user_id}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Policy #{claim.policy_id}</p>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-black text-blue-600 text-lg">₹{claim.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="bg-amber-100 text-amber-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-200/50 shadow-sm">
                                                    Manual Check Required
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button 
                                                        onClick={() => handleVerifyClaim(claim.id, 'Approved')} 
                                                        className="clay p-3 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition active:scale-95" 
                                                        title="Approve Documents"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerifyClaim(claim.id, 'Rejected')} 
                                                        className="clay p-3 bg-red-50 text-red-600 rounded-xl shadow-lg hover:bg-red-100 transition active:scale-95" 
                                                        title="Reject & Flag"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">All caught up! No active audits found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
