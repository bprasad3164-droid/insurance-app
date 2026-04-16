import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { motion } from "framer-motion";
import { Check, XCircle, LogOut, ArrowLeft, Home, FileText, ClipboardList, MapPin, Calendar, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AgentDashboard() {
    const { logout } = useAuthStore();
    const [claims, setClaims] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, surveys: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleBack = () => navigate("/dashboard");
    const handleLogout = () => logout();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch Claims assigned to this agent
            const resClaims = await api.get("/claims/");
            const claimsData = Array.isArray(resClaims.data) ? resClaims.data : [];
            setClaims(claimsData);

            // 2. Fetch Appointments
            const resAppts = await api.get("/appointments/my/");
            const apptsData = Array.isArray(resAppts.data) ? resAppts.data : [];
            setAppointments(apptsData);
            
            setStats({
                pending: claimsData.filter(c => c.agent_status === "Pending").length,
                verified: claimsData.filter(c => c.agent_status === "Approved").length,
                surveys: apptsData.length
            });
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Unable to sync mission logs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleVerifyClaim = async (id, status) => {
        try {
            await api.post(`/approve-agent/${id}/`, { status });
            fetchTasks();
        } catch (err) {
            alert("Error updating claim: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleCompleteSurvey = async (id) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/tasks/complete-survey/`, { id, notes: "Site survey completed successfully." }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
            });
            alert("Survey Completed! Task sent for Executive Approval.");
            fetchTasks();
        } catch (err) {
            alert("Error completing survey: " + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-[#e0e5ec] p-8 flex flex-col items-center">
            
            <header className="flex justify-between items-center clay p-6 mb-12 w-full max-w-6xl shadow-xl sticky top-8 z-20 gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex gap-3">
                        <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-gray-500">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-blue-600 w-8 h-8" />
                        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Mission Terminal</h1>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-red-100 transition flex items-center gap-2"
                >
                    <LogOut className="w-5 h-5" /> Terminate Session
                </button>
            </header>

            <main className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div whileHover={{ y: -5 }} className="clay p-8 flex flex-col bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Pending Claims</p>
                        <span className="text-6xl font-black text-amber-500 tracking-tighter">{stats.pending}</span>
                    </motion.div>
                    
                    <motion.div whileHover={{ y: -5 }} className="clay p-8 flex flex-col bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Survey Assignments</p>
                        <span className="text-6xl font-black text-blue-600 tracking-tighter">{stats.surveys}</span>
                    </motion.div>

                    <div className="clay p-8 flex flex-col bg-blue-600 text-white justify-center shadow-[0_20px_50px_rgba(59,130,246,0.3)]">
                        <h3 className="font-black text-2xl mb-1 tracking-tight">Active Duty</h3>
                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest">Digital Field Unit 04</p>
                    </div>
                </div>


                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="clay p-6 mb-12 bg-red-50 border-2 border-red-200 flex items-center gap-4 text-red-600"
                    >
                        <XCircle className="w-8 h-8" />
                        <div>
                            <p className="font-black uppercase tracking-widest text-xs">System Alert</p>
                            <p className="font-bold text-sm">{error}</p>
                        </div>
                        <button onClick={fetchTasks} className="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-red-700 transition">RETRY SYNC</button>
                    </motion.div>
                )}

                <div className="flex items-center gap-3 mb-8 mt-16">
                    <Calendar className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Field Surveys (Step 1)</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {Array.isArray(appointments) && appointments.length > 0 ? appointments.map((appt, idx) => (
                        <motion.div 
                            key={appt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="clay p-8 relative overflow-hidden group hover:translate-y-[-5px] transition-all bg-white/40"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="clay-inset p-3 rounded-2xl text-green-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Survey Request</h3>
                                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Policy Type: {appt.category}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${appt.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {appt.status}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                                    " {appt.notes || "No additional field notes provided."} "
                                </p>
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Calendar className="w-3 h-3" /> Preferred: {new Date(appt.preferred_date).toLocaleString()}
                                </div>
                            </div>

                            {appt.status === 'Assigned' && (
                                <button 
                                    onClick={() => handleCompleteSurvey(appt.id)}
                                    className="w-full clay p-4 rounded-xl font-black text-xs text-blue-600 hover:bg-blue-600 hover:text-white transition uppercase tracking-widest"
                                >
                                    Verify Site & Complete
                                </button>
                            )}

                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-20 h-20" />
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-2 clay p-20 text-center opacity-30">
                            <MapPin className="w-16 h-16 mx-auto mb-4" />
                            <p className="font-black text-xs uppercase tracking-[0.5em]">No Deployment Orders</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <FileText className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Active Claim Queue (Step 2)</h2>
                </div>

                <div className="clay bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 mb-20">
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
                                ) : claims.length > 0 ? (
                                    claims.filter(c => c.agent_status === "Pending").map((claim, idx) => (
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
                                                <p className="text-sm font-bold text-gray-700">Client: {claim.user__username || claim.user_id}</p>
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

                {/* Claims History */}
                <div className="flex items-center gap-3 mb-8">
                    <ClipboardList className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Claims History</h2>
                </div>

                <div className="clay bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 mb-20">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Claim Amount</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {claims.filter(c => c.agent_status !== "Pending").length > 0 ? (
                                    claims.filter(c => c.agent_status !== "Pending").map((claim, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={claim.id} 
                                            className="hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="p-6">
                                                <span className="font-black text-gray-800">#{claim.id}</span>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm font-bold text-gray-700">Client: {claim.user__username || claim.user_id}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Policy #{claim.policy_id}</p>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-black text-gray-600 text-lg">₹{claim.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-bold text-xs text-gray-500">
                                                    {new Date(claim.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                    claim.agent_status === 'Approved' ? 'bg-green-100 text-green-600 border border-green-200/50' : 'bg-red-100 text-red-600 border border-red-200/50'
                                                }`}>
                                                    {claim.agent_status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                            No history found.
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
