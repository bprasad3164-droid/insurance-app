import { useEffect, useState } from "react";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Send, CheckCircle, ShieldCheck, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Claim() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [amount, setAmount] = useState("");
  const [claimType, setClaimType] = useState("Accident");
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleHome = () => navigate("/dashboard");

  useEffect(() => {
    api.get("/policies/").then(res => setPolicies(res.data));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate multi-part upload logic
    const formData = new FormData();
    formData.append("policy", selectedPolicy);
    formData.append("amount", amount);
    formData.append("claim_type", claimType);
    formData.append("email", email);
    formData.append("phone", phone);
    if (file) formData.append("file", file);

    try {
      await api.post("/claim/", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        }
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
            <button onClick={handleBack} className="clay px-5 py-3 hover:text-blue-600 transition rounded-xl font-black flex items-center gap-2 text-black">
                <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-black text-gray-800 tracking-tighter">Settlement Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <a href="/my-policies" className="clay px-5 py-3 rounded-xl font-black text-black hover:text-green-600 transition flex items-center gap-2">Next &rarr;</a>
              <button onClick={handleHome} className="clay p-3 hover:text-blue-600 transition rounded-xl" title="Home">
                  <Home className="w-5 h-5 text-black" />
              </button>
          </div>
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
            <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">Select Protected Policy</label>
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
            <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">Claim Classification</label>
            <select 
              className="clay-inset w-full p-5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold bg-transparent appearance-none"
              required
              value={claimType}
              onChange={e => setClaimType(e.target.value)}
            >
              <option value="Accident">Accident / Collision</option>
              <option value="Medical">Medical / Surgery</option>
              <option value="Theft">Theft / Burglary</option>
              <option value="Damage">Property Damage</option>
              <option value="Other">Other Service Request</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">Estimated Settlement Amount (INR)</label>
            <input 
              type="number"
              className="clay-inset w-full p-5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold bg-transparent"
              placeholder="e.g. 50000"
              value={amount}
              required
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">Email for Notifications</label>
              <input 
                type="email"
                className="clay-inset w-full p-5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold bg-transparent"
                placeholder="email@example.com"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">WhatsApp Phone (with +91)</label>
              <input 
                type="text"
                className="clay-inset w-full p-5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold bg-transparent"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                required
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-black uppercase tracking-widest mb-3 px-2">Diagnostic Documents (PDF/JPG)</label>
             <div className="clay-inset p-8 text-center relative hover:bg-white/30 transition-colors">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-black font-bold mb-2">{file ? file.name : "Tap to upload supporting evidence"}</p>
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
