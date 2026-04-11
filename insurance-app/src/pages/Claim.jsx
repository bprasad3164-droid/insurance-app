import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Send, CheckCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Claim() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/policies/").then(res => setPolicies(res.data));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate multi-part upload logic
    const formData = new FormData();
    formData.append("user", 1); // Mock user ID
    formData.append("policy", selectedPolicy);
    if (file) formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/api/claim/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl flex justify-between items-center clay p-6 mb-12 shadow-xl">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="clay p-3 hover:text-blue-600 transition rounded-xl">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-black text-gray-800 tracking-tighter">Settlement Center</h1>
            </div>
          </div>
          <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Dashboard</a>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="clay p-10 w-full max-w-2xl shadow-2xl relative"
      >
        <AnimatePresence>
            {success && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-0 right-0 mx-auto w-max bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" /> Claim Submitted Successfully!
                </motion.div>
            )}
        </AnimatePresence>

        <h2 className="text-3xl font-black mb-8 text-gray-800">Submit New Claim</h2>
        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Select Protected Policy</label>
            <select 
              className="clay-inset w-full p-5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold bg-transparent appearance-none"
              required
              onChange={e => setSelectedPolicy(e.target.value)}
            >
              <option value="">Choose a policy...</option>
              {policies.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Diagnostic Documents (PDF/JPG)</label>
             <div className="clay-inset p-8 text-center relative hover:bg-white/30 transition-colors">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-bold mb-2">{file ? file.name : "Tap to upload supporting evidence"}</p>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
             </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Processing..." : <><Send className="w-6 h-6" /> File Final Claim</>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
