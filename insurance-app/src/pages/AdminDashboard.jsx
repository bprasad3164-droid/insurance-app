import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BarChart3, ListChecks, CheckCircle2, AlertCircle, X, ArrowLeft, LogOut, Check, FileText, UserPlus, Briefcase, ShieldCheck, MousePointer2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import useAuthStore from "../store/authStore";
import useWorkflowStore from "../store/workflowStore";
import ActivityFeed from "../components/ActivityFeed";

export default function AdminDashboard() {
  const { role, logout } = useAuthStore();
  const { openTasks, fetchOpenTasks, assignTask } = useWorkflowStore();
  const [claims, setClaims] = useState([]);
  const [kycs, setKycs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({ users: 0, policies: 0, claims: 0, approved: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: "", description: "", premium: "", category: "health" });
  const [assigning, setAssigning] = useState(null); // { type, id }
  const [executiveQueue, setExecutiveQueue] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null); // { type, id }
  
  const navigate = useNavigate();

  const handleBack = () => navigate("/dashboard");
  const handleLogout = () => logout();

  const fetchData = useCallback(async () => {
    try {
        const resStats = await api.get("/analytics/");
        const resKyc = await api.get("/kyc-pending/");
        const resTasks = await api.get("/tasks/open/");
        
        setStats({ ...resStats.data, name: "Insights" });
        setKycs(Array.isArray(resKyc.data) ? resKyc.data : []);
        setExecutiveQueue(resTasks.data.executive_queue || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
        const res = await api.get("/agents/");
        setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error fetching agents", err); }
  }, []);

  const handleAssign = async (agentId) => {
      await assignTask({ type: assigning.type, id: assigning.id, agent_id: agentId });
      setAssigning(null);
      fetchData();
  };

  const adminApproveKYC = async (id, status = 'Verified') => {
      await api.post(`/kyc-verify/${id}/`, { status });
      fetchData();
  };

  useEffect(() => {
    const load = async () => {
        await fetchData();
        await fetchOpenTasks();
        await fetchAgents();
    };
    load();
  }, [fetchData, fetchAgents, fetchOpenTasks]);

  const adminApprove = async (id, status = 'Approved', type = 'Claim') => {
    setLoadingAction({ type, id });
    try {
        if (type === 'Claim') {
            await api.post(`/approve-admin/${id}/`, { status });
        } else {
            // For surveys, we can finalize the appointment status
            await api.post(`/kyc-verify/${id}/`, { status: status === 'Approved' ? 'Verified' : 'Rejected' });
        }
        await fetchData();
        await fetchOpenTasks();
    } catch (e) { alert(e.response?.data?.error || e.response?.data?.msg || "Failed to process request."); }
    finally { setLoadingAction(null); }
  };

  const agentApprove = async (id, status) => {
    try {
        await api.post(`/approve-agent/${id}/`, { status });
        fetchData();
    } catch (e) { alert(e.response?.data?.error || e.response?.data?.msg || "Failed to update claim."); }
  };

  const handleAddPolicy = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("access");
        await api.post("/add-policy/", newPolicy);
        setShowModal(false);
        setNewPolicy({ name: "", description: "", premium: "", category: "health" });
        alert("New Policy Created Successfully");
      } catch (err) {
        alert("Failed to create policy: " + (err.response?.data?.msg || err.message));
      }
  };

  return (
    <div className="min-h-screen bg-clay-bg w-full p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        <div className="lg:col-span-3">
          <header className="flex justify-between clay p-6 mb-12 w-full shadow-xl">
            <div className="flex items-center gap-6">
                <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-black">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center gap-3">
                    <BarChart3 className="text-blue-600 w-8 h-8" />
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Executive Oversight</h1>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg"><PlusCircle className="w-5 h-5" /> New Policy</button>
                <a href="/analytics" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2 text-sm uppercase">Intelligence</a>
                <button onClick={handleLogout} className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-red-600 transition flex items-center gap-2"><LogOut className="w-5 h-5" /> Logout</button>
            </div>
          </header>

      {/* Operations Hub (Step 1 & 2 Task Assignment) */}
      <div className="clay p-12 w-full max-w-7xl shadow-2xl mb-16 border-t-8 border-blue-600">
        <div className="flex items-center gap-3 mb-10">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Operations Hub</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="clay-inset p-8 bg-white/50">
                <h3 className="text-lg font-black text-gray-700 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Pending Bookings (Step 1)
                </h3>
                <div className="space-y-4">
                    {openTasks.appointments.map(appt => (
                        <div key={appt.id} className="clay bg-white p-5 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-black text-gray-800">{appt.client__username}</p>
                                <p className="text-[10px] text-black font-bold uppercase tracking-widest">{appt.category} - {new Date(appt.preferred_date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setAssigning({type: 'appointment', id: appt.id})} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-blue-700 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-3 h-3" /> Assign
                            </button>
                        </div>
                    ))}
                    {openTasks.appointments.length === 0 && <p className="text-black font-bold text-sm italic">No pending survey requests.</p>}
                </div>
            </div>

            <div className="clay-inset p-8 bg-white/50">
                <h3 className="text-lg font-black text-gray-700 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> New Claims (Step 2)
                </h3>
                <div className="space-y-4">
                    {openTasks.claims.map(claim => (
                        <div key={claim.id} className="clay bg-white p-5 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-black text-gray-800">{claim.user__username}</p>
                                <p className="text-[10px] text-black font-bold uppercase tracking-widest">Amount: ₹{claim.amount}</p>
                            </div>
                            <button onClick={() => setAssigning({type: 'claim', id: claim.id})} className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-3 h-3" /> Assign
                            </button>
                        </div>
                    ))}
                    {openTasks.claims.length === 0 && <p className="text-black font-bold text-sm italic">No pending claim verifications.</p>}
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
          {assigning && (
              <div className="fixed inset-0 z-[60] glass flex items-center justify-center p-6">
                  <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="clay p-12 bg-white max-w-md w-full shadow-4xl text-center">
                    <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-widest">Select Field Agent</h3>
                    <div className="space-y-4 mb-10">
                        {agents.map(agent => (
                            <button key={agent.id} onClick={() => handleAssign(agent.id)} className="w-full clay p-5 hover:bg-blue-50 transition font-black text-gray-700 flex justify-between items-center">
                                {agent.username} <UserPlus className="text-blue-600 w-5 h-5"/>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setAssigning(null)} className="text-gray-400 font-black uppercase text-xs hover:text-red-500">Cancel Assignment</button>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-7xl mb-16">
        <motion.div whileHover={{ scale: 1.02 }} className="clay p-12 text-center shadow-2xl bg-white/20 flex flex-col justify-center">
          <h3 className="text-black font-black mb-2 uppercase tracking-widest text-sm">System Capacity (Users)</h3>
          <p className="text-7xl font-black text-gray-800">{stats.users}</p>
        </motion.div>
        
        <div className="clay p-8 shadow-2xl bg-white border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-black font-black mb-6 uppercase tracking-widest text-xs w-full text-left">Revenue & Activity Streams</h3>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[stats]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                    <XAxis dataKey="name" hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="users" fill="#3b82f6" name="Total Users" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="claims" fill="#ef4444" name="Total Claims" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="policies" fill="#8b5cf6" name="Policies Sold" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} className="clay p-12 text-center shadow-2xl bg-green-50/50 border-b-8 border-green-500 flex flex-col justify-center">
          <h3 className="text-black font-black mb-2 uppercase tracking-widest text-sm">Resolved Claims</h3>
          <p className="text-7xl font-black text-green-600">{stats.approved}</p>
        </motion.div>
      </div>


      {kycs.length > 0 && (
          <div className="clay p-12 w-full max-w-7xl shadow-2xl relative mb-16 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-10">
                <FileText className="w-8 h-8 text-amber-500" />
                <h2 className="text-4xl font-black text-gray-800 tracking-tight">Pending KYC Approvals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kycs.map(kyc => (
                    <div key={kyc.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <p className="text-sm font-black text-gray-800">{kyc.username}</p>
                                <p className="text-xs text-black font-bold">{kyc.email}</p>
                            </div>
                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg text-[10px] uppercase font-black">Under Review</span>
                        </div>
                        <div className="flex gap-2">
                             <a href={`http://127.0.0.1:8000${kyc.aadhaar}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline">Aadhaar</a> • 
                             <a href={`http://127.0.0.1:8000${kyc.pan}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline">PAN</a> • 
                             <a href={`http://127.0.0.1:8000${kyc.selfie}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline">Selfie</a>
                        </div>
                        <div className="flex gap-2 mt-auto pt-4">
                            <button onClick={() => adminApproveKYC(kyc.id, 'Verified')} className="flex-1 bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 font-black text-xs uppercase shadow-lg transition">Verify</button>
                            <button onClick={() => adminApproveKYC(kyc.id, 'Rejected')} className="flex-1 bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 font-black text-xs uppercase transition">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      <div className="clay p-12 w-full max-w-7xl shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10">
            <ListChecks className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Processing Queue</h2>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-black uppercase text-xs tracking-widest border-b border-gray-100">
                        <th className="p-6">Reference</th>
                        <th className="p-6">Client ID</th>
                        <th className="p-6">Policy ID</th>
                        <th className="p-6">Requested Amount</th>
                        <th className="p-6">Agent Verification</th>
                        <th className="p-6">System Status</th>
                        <th className="p-6">Executive Action</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 font-bold">
                    {executiveQueue.map(item => (
                        <tr key={`${item.type}-${item.id}`} className="border-b border-gray-50/50 hover:bg-white/40 transition-colors group">
                            <td className="p-6">
                                {item.type === 'claim' ? (
                                    <button 
                                        onClick={() => navigate(`/claim-detail/${item.id}`)}
                                        className="text-blue-600 hover:underline font-black flex items-center gap-1"
                                    >
                                        #{item.type.slice(0,3).toUpperCase()}-{item.id}
                                        <MousePointer2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ) : (
                                    <span className="text-black">#{item.type.slice(0,3).toUpperCase()}-{item.id}</span>
                                )}
                            </td>
                            <td className="p-6">{item.client}</td>
                            <td className="p-6 text-blue-600">{item.policy !== "N/A" ? `POL_${item.policy}` : "N/A"}</td>
                            <td className="p-6 font-black text-gray-800">{item.amount > 0 ? `₹${item.amount.toLocaleString()}` : "-"}</td>
                            <td className="p-6">
                                <span className={`px-4 py-2 rounded-full text-xs flex items-center w-max gap-2 ${item.agent_status === 'Approved' || item.agent_status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {item.agent_status === 'Approved' || item.agent_status === 'Verified' ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                                    {item.agent_status}
                                </span>
                            </td>
                            <td className="p-6">
                                <span className={`px-4 py-2 rounded-full text-xs flex items-center w-max gap-2 ${item.status === 'Approved' || item.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                     {item.status === 'Approved' || item.status === 'Verified' ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                                    {item.status}
                                </span>
                            </td>
                            <td className="p-6">
                                {item.status === 'Pending' || item.status === 'Assigned' || item.status === 'Surveyed' ? (
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={loadingAction?.id === item.id}
                                            onClick={() => adminApprove(item.id, 'Approved', item.type)} 
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg hover:bg-blue-700 transition uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {loadingAction?.id === item.id ? '...' : 'Settle'}
                                        </button>
                                        <button 
                                            disabled={loadingAction?.id === item.id}
                                            onClick={() => adminApprove(item.id, 'Rejected', item.type)} 
                                            className="bg-gray-500 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg hover:bg-gray-600 transition uppercase tracking-widest disabled:opacity-50"
                                        >
                                            Deny
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-300 text-[10px] uppercase font-black">Completed</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {executiveQueue.length === 0 && (
                        <tr>
                            <td colSpan="7" className="p-12 text-center text-black italic">No tasks currently require executive action.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 sticky top-8">
        <div className="clay p-8 bg-white shadow-3xl border-t-8 border-gray-900">
          <ActivityFeed />
        </div>
        
        <div className="mt-8 clay p-8 bg-blue-600 text-white shadow-2xl overflow-hidden relative">
            <div className="relative z-10">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Service Integrity</p>
                <p className="text-xl font-black mb-4">Core Systems Nominal</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Cluster Active</span>
                </div>
            </div>
            <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
        </div>
      </div>
    </div>

      <AnimatePresence>
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 glass">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="clay bg-white p-12 w-full max-w-xl shadow-3xl overflow-y-auto max-h-[90vh]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-3xl font-black text-gray-800">Launch New Policy</h3>
                        <button onClick={() => setShowModal(false)} className="clay p-2 hover:bg-red-50 transition-colors"><X className="w-6 h-6 text-red-500" /></button>
                    </div>
                    
                    <form onSubmit={handleAddPolicy} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Product Designation</label>
                            <input 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold" 
                                placeholder="e.g. Premium Health Shield"
                                value={newPolicy.name}
                                required
                                onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Product Description</label>
                            <textarea 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold h-32" 
                                placeholder="Core benefits and coverage limits..."
                                value={newPolicy.description}
                                required
                                onChange={e => setNewPolicy({...newPolicy, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Category Selection</label>
                            <select 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold bg-white/50"
                                value={newPolicy.category}
                                onChange={e => setNewPolicy({...newPolicy, category: e.target.value})}
                            >
                                <option value="health">Health Insurance</option>
                                <option value="life">Life Insurance</option>
                                <option value="vehicle">Vehicle Insurance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Quarterly Premium (INR)</label>
                            <input 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold" 
                                type="number"
                                placeholder="5000"
                                value={newPolicy.premium}
                                required
                                onChange={e => setNewPolicy({...newPolicy, premium: e.target.value})}
                            />
                        </div>
                        <button className="w-full bg-green-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-green-700 transition uppercase tracking-widest">
                            Global Release
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
