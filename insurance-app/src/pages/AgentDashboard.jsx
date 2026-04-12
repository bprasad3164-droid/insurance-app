import { useState, useEffect } from "react";
import axios from "axios";
import { Check, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/claims/", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
                });
                setClaims(res.data);
                const pending = res.data.filter(c => c.agent_status === "Pending").length;
                const verified = res.data.filter(c => c.agent_status === "Approved").length;
                setStats({ pending, verified });
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate("/login");
            }
        };
        fetchClaims();
    }, [navigate]);

    const handleVerifyClaim = async (id, status) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/approve-agent/${id}/`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
            });
            alert(`Claim successfully marked as ${status} by Agent.`);
            window.location.reload();
        } catch (err) {
            alert("Error updating claim");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="flex-1 p-10 block">
               <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Agent Field Portal</h1>
                   <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition">Logout</button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 w-full max-w-4xl">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pending Verifications</p>
                       <span className="text-5xl font-black text-amber-500">{stats.pending}</span>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Verified Documents</p>
                       <span className="text-5xl font-black text-blue-500">{stats.verified}</span>
                   </div>
               </div>

               <h2 className="text-xl font-black text-gray-800 mb-6">Assigned Claims (Needs Document Check)</h2>
               <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                               <tr>
                                   <th className="p-6">Claim ID</th>
                                   <th className="p-6">User ID</th>
                                   <th className="p-6">Policy ID</th>
                                   <th className="p-6">Amount</th>
                                   <th className="p-6">Current Status</th>
                                   <th className="p-6">Agent Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                               {claims.filter(c => c.agent_status === "Pending").map(claim => (
                                   <tr key={claim.id} className="hover:bg-blue-50/50 transition">
                                       <td className="p-6 font-bold text-gray-800 text-sm">#{claim.id}</td>
                                       <td className="p-6 text-gray-600 font-medium text-sm">{claim.user_id}</td>
                                       <td className="p-6 text-gray-600 font-medium text-sm">{claim.policy_id}</td>
                                       <td className="p-6 text-blue-600 font-black text-sm">₹{claim.amount?.toLocaleString() || 0}</td>
                                       <td className="p-6">
                                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">Pending Check</span>
                                       </td>
                                       <td className="p-6 flex gap-2">
                                           <button onClick={() => handleVerifyClaim(claim.id, 'Approved')} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition" title="Approve">
                                               <Check className="w-4 h-4" />
                                           </button>
                                           <button onClick={() => handleVerifyClaim(claim.id, 'Rejected')} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition" title="Reject">
                                               <XCircle className="w-4 h-4" />
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                               {claims.filter(c => c.agent_status === "Pending").length === 0 && (
                                   <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No pending verifications assigned.</td></tr>
                               )}
                           </tbody>
                       </table>
                   </div>
               </div>
            </div>
        </div>
    );
}
