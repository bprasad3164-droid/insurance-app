import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, CreditCard, ArrowLeft, ShieldCheck, Zap, User, IndianRupee, Home, Download } from "lucide-react";
import PaymentMethods from "../components/PaymentMethods";

export default function BuyPolicy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [age, setAge] = useState(25);
  const [salary, setSalary] = useState(50000);
  const [premium, setPremium] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/policies");
    }
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    // Fetch policy details to show on the calculator
    const fetchPolicy = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/policies/");
        const found = res.data.find(p => p.id === parseInt(id));
        if (found) setPolicy(found);
      } catch (err) {
        console.error("Error fetching policy", err);
      }
    };
    fetchPolicy();
  }, [id]);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/calculate/", {
        age,
        salary,
        policy_id: id
      });
      setPremium(res.data.premium);
    } catch (err) {
      alert("Calculation failed: " + err.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleBuy = async () => {
    if (!selectedMethod) return alert("Please select a payment method first");
    
    setLoading(true);
    const token = localStorage.getItem("access");
    if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
    }

    const kycStatus = localStorage.getItem("kyc_status");
    if (kycStatus !== "Verified") {
        alert("KYC Verification Required to Purchase. Please complete KYC in your Profile.");
        navigate("/profile");
        return;
    }

    try {
      // 1. Process Payment
      const paymentRes = await axios.post("http://127.0.0.1:8000/api/payment/", {
        policy_id: id,
        amount: premium,
        method: selectedMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newPaymentId = paymentRes.data.payment_id;
      setPaymentId(newPaymentId);

      // 2. Buy Policy
      await axios.post("http://127.0.0.1:8000/api/buy-policy/", {
        policy_id: id,
        premium: premium
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Generate Invoice
      const invoiceRes = await axios.post("http://127.0.0.1:8000/api/invoice/create/", {
        payment_id: newPaymentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoiceId(invoiceRes.data.invoice_id);

      setSuccess(true);
      // Removed auto-redirect for invoice download access
    } catch (err) {
      alert("Transaction failed: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (id) => {
    window.open(`http://127.0.0.1:8000/api/invoice/download/${id}/`);
  };

  if (!policy) return <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec]">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>;

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex gap-4 mb-8">
            <button 
              onClick={handleBack}
              className="clay p-4 rounded-2xl text-gray-500 font-bold hover:text-blue-600 transition flex items-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <button 
              onClick={handleHome}
              className="clay p-4 rounded-2xl text-gray-500 font-bold hover:text-blue-600 transition flex items-center gap-2"
              title="Go to Dashboard"
            >
              <Home className="w-5 h-5" /> Dashboard
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Policy Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="clay p-10 flex flex-col items-center text-center h-fit"
            >
                <div className="p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-4">{policy.name}</h1>
                <p className="text-gray-500 font-medium mb-8 uppercase tracking-widest text-xs">{policy.category} Protection Plan</p>
                
                <div className="w-full space-y-4">
                    <div className="clay-inset p-4 flex justify-between items-center rounded-2xl">
                        <span className="text-gray-400 font-bold text-sm">Base Premium</span>
                        <span className="text-gray-800 font-black">₹{policy.base_premium}</span>
                    </div>
                    <div className="clay-inset p-4 flex justify-between items-center rounded-2xl">
                        <span className="text-gray-400 font-bold text-sm">Max Coverage</span>
                        <span className="text-blue-600 font-black">₹{policy.coverage || "5,00,000"}+</span>
                    </div>
                </div>
                
                <div className="mt-10 p-6 bg-blue-600/5 rounded-3xl border border-blue-100 flex items-start gap-3 text-left">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-xs text-blue-800 font-bold leading-relaxed">
                        This plan uses AI-driven risk assessment. Premium adjusts based on your age and income brackets for optimal fairness.
                    </p>
                </div>
            </motion.div>

            {/* Right: Calculator & Checkout */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
                <div className="clay p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Calculator className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Premium Calculator</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Age</label>
                                <span className="font-black text-blue-600">{age} Years</span>
                            </div>
                            <input 
                                type="range" min="18" max="100" value={age} 
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 clay-inset p-0"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Salary</label>
                                <span className="font-black text-blue-600">₹{salary.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="5000" max="500000" step="5000" value={salary} 
                                onChange={(e) => setSalary(e.target.value)}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 clay-inset p-0"
                            />
                        </div>

                        <button 
                            onClick={handleCalculate}
                            disabled={calculating}
                            className={`w-full p-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${calculating ? 'opacity-50 cursor-not-allowed' : 'clay text-blue-600 group active:scale-95'}`}
                        >
                            {calculating ? "Calculating..." : <><Calculator className="w-5 h-5" /> Update Quote</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {premium > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="clay p-10 bg-blue-600 text-white shadow-2xl relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-2 text-center">Your Customized Quote</p>
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <span className="text-2xl opacity-60">₹</span>
                                    <h2 className="text-6xl font-black tracking-tighter">{premium.toLocaleString()}</h2>
                                    <span className="text-sm self-end mb-2 opacity-60">/year</span>
                                </div>
                                
                                {selectedMethod && !success && (
                                    <button 
                                        onClick={handleBuy}
                                        disabled={loading}
                                        className={`w-full bg-white text-blue-600 p-6 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 mt-8 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                    >
                                        <CreditCard className="w-6 h-6" /> {loading ? "Processing..." : `Pay ₹${premium.toLocaleString()}`}
                                    </button>
                                )}

                                {success && (
                                    <div className="mt-8 space-y-4">
                                        <div className="bg-white/20 p-6 rounded-2xl text-center backdrop-blur-md">
                                            <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
                                            <p className="text-xl font-black">Success! Policy Active</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadInvoice(invoiceId)}
                                            className="w-full bg-emerald-500 text-white p-5 rounded-2xl font-black shadow-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" /> Download PDF Invoice
                                        </button>
                                        <button 
                                            onClick={() => navigate("/dashboard")}
                                            className="w-full bg-white/10 text-white p-4 rounded-xl font-bold hover:bg-white/20 transition"
                                        >
                                            Back to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                                <Zap className="w-48 h-48 rotate-12" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {premium > 0 && !success && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="clay p-10"
                    >
                        <PaymentMethods 
                            amount={premium} 
                            onSelect={handleSelectMethod} 
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}
