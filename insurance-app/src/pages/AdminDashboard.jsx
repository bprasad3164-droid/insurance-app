import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({ total_claims: 0, approved: 0 });

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
    alert("Agent Approval Successful");
    fetchData();
  };

  const adminApprove = async (id) => {
    try {
        const res = await axios.post(`http://127.0.0.1:8000/api/approve-admin/${id}/`);
        alert(res.data.msg);
        fetchData();
    } catch (e) {
        alert(e.response.data.msg);
    }
  };

  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center">
      <header className="flex justify-between clay p-5 mb-10 w-full max-w-5xl shadow-xl bg-blue-50/50">
        <h1 className="text-2xl font-black text-blue-900 tracking-tight">Admin & Agent Portal</h1>
        <div className="flex gap-4">
            <a href="/analytics" className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-lg">View Charts</a>
            <a href="/" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg">Portal Home</a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-12">
        <div className="clay p-10 text-center shadow-xl border-l-8 border-blue-500">
          <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Claims</h3>
          <p className="text-6xl font-black text-gray-800">{stats.total_claims}</p>
        </div>
        <div className="clay p-10 text-center shadow-xl border-l-8 border-green-500">
          <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Final Approvals</h3>
          <p className="text-6xl font-black text-gray-800">{stats.approved}</p>
        </div>
      </div>

      <div className="clay p-8 w-full max-w-6xl shadow-2xl">
        <h2 className="text-3xl font-black mb-8 text-gray-800 tracking-tight">Claim Processing Queue</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-400 uppercase text-xs tracking-widest">
                        <th className="p-4">ID</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Policy</th>
                        <th className="p-4">Agent Status</th>
                        <th className="p-4">Final Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 font-bold">
                    {claims.map(c => (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-white/30 transition-colors">
                            <td className="p-4">#{c.id}</td>
                            <td className="p-4">User {c.user_id}</td>
                            <td className="p-4">Policy {c.policy_id}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-lg text-xs ${c.agent_status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {c.agent_status}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-lg text-xs ${c.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-4 space-x-2">
                                {role === 'agent' && c.agent_status === 'Pending' && (
                                    <button onClick={() => agentApprove(c.id)} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600">Verify</button>
                                )}
                                {role === 'admin' && c.status === 'Pending' && (
                                    <button onClick={() => adminApprove(c.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">Approve</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
