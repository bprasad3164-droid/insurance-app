import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ShieldCheck, Zap, Info, CreditCard, Heart, Car, Activity, AlignLeft, Filter } from "lucide-react";

const categories = [
    { id: 'all', name: 'All Plans', icon: <AlignLeft className="w-4 h-4" /> },
    { id: 'health', name: 'Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'life', name: 'Life', icon: <Activity className="w-4 h-4" /> },
    { id: 'vehicle', name: 'Vehicle', icon: <Car className="w-4 h-4" /> },
];

export default function Policies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, [filter]);

  const fetchPolicies = async () => {
    setLoading(true);
    const url = filter === 'all' 
        ? "http://127.0.0.1:8000/api/policies/" 
        : `http://127.0.0.1:8000/api/policies/?category=${filter}`;
    const res = await axios.get(url);
    setData(res.data);
    setLoading(false);
  };

  const handleBuy = async (policy) => {
      const token = localStorage.getItem("access");
      if (!token) return alert("Please login to purchase");
      
      try {
          const res = await axios.post("http://127.0.0.1:8000/api/buy-policy/", { policy_id: policy.id }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert(`Success! Policy issued.\nCertificate ID: ${res.data.certificate_id}`);
          window.location.href = "/profile";
      } catch (err) {
          alert("Purchase failed: " + err.message);
      }
  };

  const toggleCompare = (policy) => {
      if (compareList.find(p => p.id === policy.id)) {
          setCompareList(compareList.filter(p => p.id !== policy.id));
      } else {
          if (compareList.length < 3) {
              setCompareList([...compareList, policy]);
          } else {
              alert("You can compare up to 3 plans only.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-clay-bg p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center clay p-8 mb-16 shadow-xl glass sticky top-8 z-10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Zap className="w-10 h-10 text-blue-600 fill-blue-600" />
            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Marketplace</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-blue-600">Enterprise Grade Plans Only</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-white/40 p-2 rounded-2xl clay-inset">
              {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${filter === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600'}`}
                  >
                      {cat.icon} {cat.name}
                  </button>
              ))}
          </div>
      </header>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {compareList.length > 0 && (
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-8"
            >
                <div className="clay bg-gray-900 text-white p-6 w-full max-w-4xl shadow-3xl flex justify-between items-center border border-white/20">
                    <div className="flex gap-4">
                        {compareList.map(p => (
                            <div key={p.id} className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                <span className="font-bold text-sm">{p.name}</span>
                                <button onClick={() => toggleCompare(p)} className="text-red-400 font-black">×</button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => alert(`Comparison Data: \n${compareList.map(p => `${p.name}: ₹${p.premium}`).join('\n')}`)}
                        className="bg-blue-600 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition"
                    >
                        Compare {compareList.length} Plans
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
          <div className="flex flex-col items-center gap-4 py-32">
              <div className="w-20 h-20 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="font-black text-blue-600 tracking-widest animate-pulse">OPTIMIZING QUOTES...</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl pb-32">
            {data.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="clay p-10 flex flex-col shadow-2xl relative overflow-hidden group border-2 border-transparent hover:border-blue-400 transition-all"
              >
                <div className="mb-8 flex items-center justify-between">
                    <div className={`p-4 rounded-3xl ${p.category === 'health' ? 'bg-red-50 text-red-500' : p.category === 'life' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                        {p.category === 'health' ? <Heart className="w-8 h-8" /> : p.category === 'life' ? <Activity className="w-8 h-8" /> : <Car className="w-8 h-8" />}
                    </div>
                    <button 
                        onClick={() => toggleCompare(p)}
                        className={`text-[10px] font-black px-4 py-2 rounded-xl transition ${compareList.find(x => x.id === p.id) ? 'bg-blue-600 text-white' : 'clay-inset text-gray-400'}`}
                    >
                        {compareList.find(x => x.id === p.id) ? 'READY TO COMPARE' : '+ ADD TO COMPARE'}
                    </button>
                </div>

                <h2 className="text-4xl font-black mb-4 text-gray-800 tracking-tighter">{p.name}</h2>
                <p className="text-gray-500 font-medium mb-10 flex-grow leading-relaxed line-clamp-3">{p.description}</p>
                
                <div className="bg-white/40 p-8 rounded-[2rem] border border-white/20 mb-10 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Quarterly Investment</p>
                    <span className="text-5xl font-black text-blue-900 tracking-tighter">₹ {p.premium.toLocaleString()}</span>
                </div>

                <div className="flex gap-4">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = `/buy/${p.id}`}
                        className="flex-grow bg-blue-600 text-white p-5 rounded-3xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest"
                    >
                        <CreditCard className="w-6 h-6" /> Calculate & Buy
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
      )}
    </div>
  );
}
