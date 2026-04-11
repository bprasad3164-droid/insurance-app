import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BarChart3, ListChecks, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function AdminDashboard() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({ total_claims: 0, approved: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: "", description: "", premium: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const resClaims = await axios.get("http://127.0.0.1:8000/api/claims/");
    const resStats = await axios.get("http://127.0.0.1:8000/api/analytics/");
    setClaims(resClaims.data);
    setStats(resStats.data);
  };

  const agentApprove = async (id) => {
    await axios.post(`http://127.0.0.1:8000/api/approve-agent/${id}/`);
    fetchData();
  };

  const adminApprove = async (id) => {
    try {
        await axios.post(`http://127.0.0.1:8000/api/approve-admin/${id}/`);
        fetchData();
    } catch (e) {
        alert(e.response.data.msg);
    }
  };

  const handleAddPolicy = async (e) => {
      e.preventDefault();
      await axios.post("http://127.0.0.1:8000/api/add-policy/", newPolicy);
      setShowModal(false);
      setNewPolicy({ name: "", description: "", premium: "" });
      alert("New Policy Created Successfully");
  };

  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-clay-bg w-full p-8 flex flex-col items-center">
      <header className="flex justify-between clay p-6 mb-12 w-full max-w-6xl shadow-xl">
        <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600 w-8 h-8" />
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Executive Oversight</h1>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg"
            >
                <PlusCircle className="w-5 h-5" /> New Policy
            </button>
            <a href="/analytics" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Intelligence</a>
            <a href="/" className="bg-gray-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">Home</a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl mb-16">
        <motion.div whileHover={{ scale: 1.02 }} className="clay p-12 text-center shadow-2xl bg-white/20">
          <h3 className="text-gray-400 font-black mb-2 uppercase tracking-widest text-sm">System Capacity</h3>
          <p className="text-7xl font-black text-gray-800">{stats.total_claims}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="clay p-12 text-center shadow-2xl bg-green-50/50 border-b-8 border-green-500">
          <h3 className="text-gray-400 font-black mb-2 uppercase tracking-widest text-sm">Resolved Claims</h3>
          <p className="text-7xl font-black text-green-600">{stats.approved}</p>
        </motion.div>
      </div>

      <div className="clay p-12 w-full max-w-7xl shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10">
            <ListChecks className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Processing Queue</h2>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-400 uppercase text-xs tracking-widest border-b border-gray-100">
                        <th className="p-6">Reference</th>
                        <th className="p-6">Client ID</th>
                        <th className="p-6">Policy ID</th>
                        <th className="p-6">Agent Verification</th>
                        <th className="p-6">System Status</th>
                        <th className="p-6">Executive Action</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 font-bold">
                    {claims.map(c => (
                        <tr key={c.id} className="border-b border-gray-50/50 hover:bg-white/40 transition-colors">
                            <td className="p-6 text-gray-400">#CLM-{c.id}</td>
                            <td className="p-6">USER_{c.user_id}</td>
                            <td className="p-6 text-blue-600">POL_{c.policy_id}</td>
                            <td className="p-6">
                                <span className={`px-4 py-2 rounded-full text-xs flex items-center w-max gap-2 ${c.agent_status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {c.agent_status === 'Approved' ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                                    {c.agent_status}
                                </span>
                            </td>
                            <td className="p-6">
                                <span className={`px-4 py-2 rounded-full text-xs flex items-center w-max gap-2 ${c.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                     {c.status === 'Approved' ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-6">
                                {role === 'agent' && c.agent_status === 'Pending' && (
                                    <button onClick={() => agentApprove(c.id)} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-orange-600 transition">VERIFY</button>
                                )}
                                {role === 'admin' && c.status === 'Pending' && (
                                    <button onClick={() => adminApprove(c.id)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-blue-700 transition">AUTHORIZE</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Designation</label>
                            <input 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold" 
                                placeholder="e.g. Premium Health Shield"
                                value={newPolicy.name}
                                required
                                onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Description</label>
                            <textarea 
                                className="clay-inset w-full p-4 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold h-32" 
                                placeholder="Core benefits and coverage limits..."
                                value={newPolicy.description}
                                required
                                onChange={e => setNewPolicy({...newPolicy, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quarterly Premium (INR)</label>
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
