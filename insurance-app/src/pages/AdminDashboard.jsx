import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/claims/").then(res => setClaims(res.data));
    axios.get("http://127.0.0.1:8000/api/policies/").then(res => setPolicies(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center">
      <header className="flex justify-between clay p-5 mb-10 w-full max-w-5xl shadow-xl bg-blue-50/50">
        <h1 className="text-2xl font-black text-blue-900 tracking-tight">Admin Analytics</h1>
        <a href="/" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg">Portal Home</a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-12">
        <div className="clay p-10 text-center shadow-xl border-l-8 border-blue-500">
          <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Claims Received</h3>
          <p className="text-6xl font-black text-gray-800">{claims.length}</p>
        </div>
        <div className="clay p-10 text-center shadow-xl border-l-8 border-green-500">
          <h3 className="text-gray-500 font-bold mb-2 uppercase tracking-widest text-xs">Active Insurance Policies</h3>
          <p className="text-6xl font-black text-gray-800">{policies.length}</p>
        </div>
      </div>

      <div className="clay p-8 w-full max-w-5xl shadow-2xl overflow-hidden">
        <h2 className="text-3xl font-black mb-8 text-gray-800 tracking-tight">Recent Claims</h2>
        <div className="space-y-4">
            {claims.length > 0 ? (
                claims.map(c => (
                    <div key={c.id} className="bg-white/40 p-5 rounded-2xl flex justify-between items-center border border-white/60 hover:bg-white/70 transition-colors shadow-sm">
                        <div>
                            <span className="text-blue-700 font-black mr-4 uppercase text-xs px-2 py-1 bg-blue-100 rounded-lg">ID: {c.id}</span>
                            <span className="text-gray-800 font-bold">Policy ID: {c.policy_id}</span>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs shadow-inner">
                            {c.status}
                        </span>
                    </div>
                ))
            ) : (
                <div className="p-10 text-center text-gray-500 font-bold italic bg-gray-100/50 rounded-3xl">No claims to display yet.</div>
            )}
        </div>
      </div>
    </div>
  );
}
