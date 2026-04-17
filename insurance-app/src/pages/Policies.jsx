import { useEffect, useState } from "react";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, CreditCard, Heart, Car, Activity, AlignLeft, ArrowLeft, X, Scale, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Static fallback plans (shown when backend is offline) ── */
const STATIC_PLANS = [
  {
    id: 1,
    name: "Health Shield",
    description: "Comprehensive health cover for you and your family. Includes hospitalisation, day-care procedures, and preventive care across 500+ network hospitals.",
    premium: 4999,
    category: "health",
  },
  {
    id: 2,
    name: "Life Secure",
    description: "Long-term life protection with critical illness rider. Tax-saving benefits under Section 80C. Covers accidental death and permanent disability.",
    premium: 2999,
    category: "life",
  },
  {
    id: 3,
    name: "Motor Guard",
    description: "360° vehicle protection with zero depreciation cover, roadside assistance 24/7, engine protection, and cashless repairs at 3000+ garages.",
    premium: 1999,
    category: "vehicle",
  },
  {
    id: 4,
    name: "Premium Health Pro",
    description: "Elite health plan with international coverage, OPD benefits, no room-rent capping, and dedicated wellness manager.",
    premium: 9999,
    category: "health",
  },
  {
    id: 5,
    name: "Term Shield Plus",
    description: "Pure term insurance with return of premium option. Covers up to ₹2Cr. Includes waiver of premium on critical illness diagnosis.",
    premium: 1299,
    category: "life",
  },
  {
    id: 6,
    name: "Bike Protect",
    description: "Complete two-wheeler insurance with own damage cover, third party liability, and pillion rider cover. Instant policy issuance.",
    premium: 899,
    category: "vehicle",
  },
];

const CATEGORIES = [
  { id: "all",     label: "All Plans", icon: <AlignLeft className="w-4 h-4" /> },
  { id: "health",  label: "Health",    icon: <Heart    className="w-4 h-4" /> },
  { id: "life",    label: "Life",      icon: <Activity className="w-4 h-4" /> },
  { id: "vehicle", label: "Vehicle",   icon: <Car      className="w-4 h-4" /> },
];

const CATEGORY_STYLE = {
  health:  { bg: "bg-rose-50",  text: "text-rose-500",  icon: <Heart    className="w-8 h-8" /> },
  life:    { bg: "bg-green-50", text: "text-green-500", icon: <Activity className="w-8 h-8" /> },
  vehicle: { bg: "bg-blue-50",  text: "text-blue-500",  icon: <Car      className="w-8 h-8" /> },
};

export default function Policies() {
  const [plans, setPlans]           = useState(STATIC_PLANS);
  const [filter, setFilter]         = useState("all");
  const [loading, setLoading]       = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [compareList, setCompareList]     = useState([]);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/policies/" : `/policies/?category=${filter}`;
      const res = await api.get(url, { timeout: 5000 });
      if (res.data && res.data.length > 0) {
        setPlans(Array.isArray(res.data) ? res.data : []);
        setUsingFallback(false);
      } else {
        applyFallback();
      }
    } catch {
      applyFallback();
    } finally {
      setLoading(false);
    }
  };

  const applyFallback = () => {
    const filtered =
      filter === "all"
        ? STATIC_PLANS
        : STATIC_PLANS.filter((p) => p.category === filter);
    setPlans(filtered);
    setUsingFallback(true);
  };

  const toggleCompare = (plan) => {
    if (compareList.find((p) => p.id === plan.id)) {
      setCompareList(compareList.filter((p) => p.id !== plan.id));
    } else {
      if (compareList.length >= 3) return alert("You can compare up to 3 plans only.");
      setCompareList([...compareList, plan]);
    }
  };

  const catStyle = (category) =>
    CATEGORY_STYLE[category] || { bg: "bg-gray-50", text: "text-gray-500", icon: <ShieldCheck className="w-8 h-8" /> };

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-8 flex flex-col items-center">

      {/* ── Header ── */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center clay p-8 mb-16 shadow-xl sticky top-8 z-10 gap-6">
        <div className="flex items-center gap-6">
          <button onClick={handleBack} className="clay px-4 py-3 hover:text-blue-600 transition rounded-xl flex items-center gap-2 font-bold text-black">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={handleHome} className="clay p-3 hover:text-blue-600 transition rounded-xl" title="Go to Dashboard">
            <Home className="w-5 h-5 text-black" />
          </button>
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-blue-600 fill-blue-600" />
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Marketplace</h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">Enterprise Grade Plans</p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 bg-white/40 p-2 rounded-2xl clay-inset">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                filter === cat.id ? "bg-blue-600 text-white shadow-lg" : "text-black hover:text-blue-600"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Fallback banner ── */}
      {usingFallback && (
        <div className="w-full max-w-7xl mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-700 font-bold text-sm">
            <Zap className="w-4 h-4 flex-shrink-0" />
            Demo plans shown — backend offline. Start the Django server to see live plans.
          </div>
        </div>
      )}

      {/* ── Compare tray ── */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-8"
          >
            <div className="clay bg-gray-900 text-white p-6 w-full max-w-4xl flex justify-between items-center border border-white/20 shadow-2xl rounded-2xl">
              <div className="flex gap-4 flex-wrap">
                {compareList.map((p) => (
                  <div key={p.id} className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="font-bold text-sm">{p.name}</span>
                    <button onClick={() => toggleCompare(p)} className="text-red-400 font-black text-lg">&times;</button>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  alert(`Comparison:\n${compareList.map((p) => `${p.name}: ₹${p.premium}/yr`).join("\n")}`)
                }
                className="bg-blue-600 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Scale className="w-4 h-4" /> Compare {compareList.length} Plans
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plan cards ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-32">
          <div className="w-20 h-20 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="font-black text-blue-600 tracking-widest animate-pulse">LOADING PLANS...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="clay p-20 text-center max-w-md mt-10">
          <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-600 mb-2">No Plans Found</h2>
          <p className="text-gray-400 font-medium">No plans available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl pb-36">
          {plans.map((p, idx) => {
            const cs = catStyle(p.category);
            const inCompare = compareList.find((x) => x.id === p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ scale: 1.02, translateY: -6 }}
                className={`clay p-10 flex flex-col shadow-2xl relative overflow-hidden group border-2 transition-all ${
                  inCompare ? "border-blue-400" : "border-transparent"
                }`}
              >
                {/* Icon + Compare toggle */}
                <div className="mb-8 flex items-center justify-between">
                  <div className={`p-4 rounded-3xl ${cs.bg} ${cs.text}`}>{cs.icon}</div>
                  <button
                    onClick={() => toggleCompare(p)}
                    className={`text-[10px] font-black px-4 py-2 rounded-xl transition ${
                      inCompare ? "bg-blue-600 text-white" : "clay-inset text-black hover:text-blue-600"
                    }`}
                  >
                    {inCompare ? "✓ IN COMPARE" : "+ COMPARE"}
                  </button>
                </div>

                <h2 className="text-3xl font-black mb-3 text-gray-800 tracking-tighter group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h2>
                <p className="text-black font-medium mb-8 flex-grow leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Premium */}
                <div className="bg-white/40 p-6 rounded-[2rem] border border-white/20 mb-8 text-center">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-1">Annual Premium</p>
                  <span className="text-5xl font-black text-blue-900 tracking-tighter">
                    ₹{(p.base_premium || p.premium || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-black font-bold">/yr</span>
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/buy/${p.id}`)}
                  className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black text-base shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest"
                >
                  <CreditCard className="w-5 h-5" /> Calculate &amp; Buy
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
