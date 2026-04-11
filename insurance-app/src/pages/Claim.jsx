import axios from "axios";
import { useEffect, useState } from "react";

export default function Claim() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/policies/").then(res => setPolicies(res.data));
  }, []);

  const submit = async () => {
    if (!selectedPolicy) return alert("Select a policy first");
    
    try {
      await axios.post("http://127.0.0.1:8000/api/claim/", {
        user: 1, // Static for now as per snippet, in real app use logged in user id
        policy: selectedPolicy
      });
      alert("Claim Submitted Successfully!");
      window.location.href = "/";
    } catch (error) {
      alert("Submission failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center justify-center animate-in slide-in-from-bottom duration-700">
      <div className="clay p-12 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black mb-10 text-center text-gray-800 tracking-tight">Submit a Claim</h1>
        
        <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">Select Policy</label>
        <select 
          className="w-full p-4 mb-8 rounded-2xl bg-white/50 border border-white/20 shadow-inner outline-none appearance-none font-bold text-gray-700 hover:bg-white/70 transition-colors"
          value={selectedPolicy}
          onChange={(e) => setSelectedPolicy(e.target.value)}
        >
          <option value="">Choose your policy...</option>
          {policies.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button 
          onClick={submit}
          className="w-full bg-blue-600 text-white font-black p-5 rounded-2xl hover:bg-blue-700 hover:shadow-blue-200 transition-all shadow-xl active:scale-95 text-lg"
        >
          Submit My Claim
        </button>

        <div className="mt-8 text-center border-t border-gray-300 pt-6">
            <a href="/policies" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                Check Policies
            </a>
        </div>
      </div>
    </div>
  );
}
