import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShoppingCart, ShieldCheck, Zap, Info, CreditCard } from "lucide-react";

export default function Policies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/policies/").then(res => {
        setData(res.data);
        setLoading(false);
    });
  }, []);

  const handleBuy = async (policy) => {
      // Simulate Razorpay trigger
      try {
          const res = await axios.post("http://127.0.0.1:8000/api/payment/", { amount: policy.premium });
          alert(`Payment Sequence Initiated for ${policy.name}.\nOrder ID: ${res.data.id}\nSimulated Amount: ₹ ${policy.premium}`);
          alert("Payment Successful! Policy has been added to your coverage.");
      } catch (err) {
          alert("Payment Error: " + err.message);
      }
  };

  return (
    <div className="min-h-screen bg-clay-bg p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex justify-between items-center clay p-6 mb-16 shadow-xl sticky top-8 z-10 bg-white/10 glass">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Product Catalog</h1>
          </div>
          <div className="flex gap-4">
             <a href="/claim" className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition shadow-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Need to Claim?
             </a>
             <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Home</a>
          </div>
      </header>

      {loading ? (
          <div className="flex gap-4 items-center font-black text-blue-600 animate-pulse">
              <Zap className="w-8 h-8 spin" /> ANALYZING MARKET OPTIONS...
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl">
            {data.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="clay p-8 flex flex-col shadow-2xl relative overflow-hidden group border border-white/40"
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 rounded-bl-3xl font-black text-sm tracking-widest group-hover:bg-blue-700 transition-colors">
                    GEN-5
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <ShieldCheck className="w-10 h-10 text-blue-600" />
                    <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Reference: #{p.id}</span>
                </div>

                <h2 className="text-3xl font-black mb-4 text-gray-800 tracking-tight leading-tight">{p.name}</h2>
                <p className="text-gray-500 font-medium mb-8 flex-grow leading-relaxed">{p.description}</p>
                
                <div className="bg-white/40 p-6 rounded-3xl border border-white/20 mb-8 flex items-center justify-between">
                    <span className="text-gray-400 font-black text-sm uppercase">Invest</span>
                    <span className="text-4xl font-black text-blue-900 tracking-tighter">₹ {p.premium.toLocaleString()}</span>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => alert(`Details for ${p.name}: Comprehensive coverage for all ecosystem events.`)}
                        className="clay p-4 text-gray-400 hover:text-blue-600 hover:bg-white/60 transition-all flex-grow-0"
                    >
                        <Info className="w-6 h-6" />
                    </button>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBuy(p)}
                        className="flex-grow bg-blue-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                    >
                        <CreditCard className="w-6 h-6" /> SECURE COVERAGE
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
      )}
    </div>
  );
}
