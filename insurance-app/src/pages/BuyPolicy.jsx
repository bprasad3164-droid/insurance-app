import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, CreditCard, ArrowLeft, ShieldCheck, Zap, User, IndianRupee, Home, Smartphone, Globe, Check, SmartphoneIcon as UPI, Wallet, CreditCardIcon as Card, Landmark, Loader2, X } from "lucide-react";
import useAuthStore from "../store/authStore";


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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'upi', 'card', 'netbanking'
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'form', 'processing'
  const [vpa, setVpa] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

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

  const { token } = useAuthStore();

  const handleBuy = () => {
    if (premium === 0) return alert("Please calculate premium first");
    if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
    }
    setShowPayment(true);
    setPaymentStep('select');
  };

  const handleFinalPayment = async () => {
    setLoading(true);
    setPaymentStep('processing');
    
    try {
        const token = localStorage.getItem("access");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Create Payment Record (Manual)
        const payRes = await axios.post("http://127.0.0.1:8000/api/make-payment/", {
            policy_id: id,
            amount: premium,
            method: paymentMethod.toUpperCase()
        }, { headers });

        // 2. Buy the Policy
        await axios.post("http://127.0.0.1:8000/api/buy-policy/", {
            policy_id: id,
            premium: premium
        }, { headers });

        setSuccess(true);
        setTimeout(() => {
            navigate(`/payment-success?payment_id=${payRes.data.payment_id}&policy_id=${id}`);
        }, 2000);

    } catch (err) {
        alert("Transaction Failed: " + (err.response?.data?.error || err.message));
        setPaymentStep('form');
    } finally {
        setLoading(false);
    }
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
                                
                                <button 
                                    onClick={handleBuy}
                                    disabled={loading || success}
                                    className={`w-full bg-white text-blue-600 p-6 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${loading || success ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    {success ? (
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-6 h-6" /> Success!
                                        </div>
                                    ) : (
                                        <><CreditCard className="w-6 h-6" /> Confirm Purchase</>
                                    )}
                                </button>
                                
                                {success && (
                                    <p className="text-center mt-4 text-xs font-bold opacity-80 animate-pulse">
                                        Redirecting to your dashboard...
                                    </p>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                                <Zap className="w-48 h-48 rotate-12" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
      </div>

      {/* Payment Overlay */}
      <AnimatePresence>
        {showPayment && !success && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-xl"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="clay bg-white w-full max-w-lg p-10 relative overflow-hidden"
                >
                    <button 
                        onClick={() => setShowPayment(false)}
                        className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-red-500 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {paymentStep === 'select' && (
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <Wallet className="w-8 h-8 text-blue-600" />
                                <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Select Payment</h1>
                            </div>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => { setPaymentMethod('upi'); setPaymentStep('form'); }}
                                    className="w-full clay p-6 flex items-center justify-between group hover:scale-[1.02] transition active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                            <UPI className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-gray-800">UPI Transfer</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instant & Secure</p>
                                        </div>
                                    </div>
                                    <Check className="w-5 h-5 text-gray-200 group-hover:text-blue-600 transition" />
                                </button>

                                <button 
                                    onClick={() => { setPaymentMethod('card'); setPaymentStep('form'); }}
                                    className="w-full clay p-6 flex items-center justify-between group hover:scale-[1.02] transition active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                                            <Card className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-gray-800">Credit / Debit Card</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </div>
                                    <Check className="w-5 h-5 text-gray-200 group-hover:text-blue-600 transition" />
                                </button>

                                <button 
                                    onClick={() => { setPaymentMethod('netbanking'); setPaymentStep('form'); }}
                                    className="w-full clay p-6 flex items-center justify-between group hover:scale-[1.02] transition active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                                            <Landmark className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-gray-800">Net Banking</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Direct Bank Transfer</p>
                                        </div>
                                    </div>
                                    <Check className="w-5 h-5 text-gray-200 group-hover:text-blue-600 transition" />
                                </button>
                            </div>
                        </div>
                    )}

                    {paymentStep === 'form' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <button onClick={() => setPaymentStep('select')} className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-6 hover:gap-3 transition-all">
                                <ArrowLeft className="w-4 h-4" /> Change Method
                            </button>

                            {paymentMethod === 'upi' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Enter UPI ID (VPA)</label>
                                        <input 
                                            placeholder="e.g. user@okaxis" 
                                            value={vpa}
                                            onChange={(e) => setVpa(e.target.value)}
                                            className="w-full clay-inset p-5 rounded-2xl font-black text-gray-700 focus:text-blue-600 outline-none placeholder:opacity-30" 
                                        />
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                                        <Smartphone className="w-8 h-8 text-blue-600 animate-bounce" />
                                        <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                            Open your UPI app after clicking pay to authorize the ₹{premium.toLocaleString()} request.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleFinalPayment}
                                        className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition"
                                    >
                                        Pay Successfully
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Card Number</label>
                                        <div className="relative">
                                            <input 
                                                maxLength="16"
                                                placeholder="xxxx xxxx xxxx xxxx" 
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                className="w-full clay-inset p-5 rounded-2xl font-mono font-black text-gray-700 outline-none" 
                                            />
                                            <div className="absolute right-5 top-5 flex gap-1">
                                                <div className="w-6 h-4 bg-red-400 rounded-sm" />
                                                <div className="w-6 h-4 bg-orange-400 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Expiry</label>
                                            <input placeholder="MM / YY" className="w-full clay-inset p-5 rounded-2xl font-black text-gray-700 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">CVV</label>
                                            <input placeholder="***" maxLength="3" className="w-full clay-inset p-5 rounded-2xl font-black text-gray-700 outline-none" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleFinalPayment}
                                        className="w-full bg-purple-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-purple-700 transition"
                                    >
                                        Initialize Encryption
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'netbanking' && (
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Select Your Bank</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank'].map(bank => (
                                            <button 
                                                key={bank}
                                                onClick={() => setSelectedBank(bank)}
                                                className={`p-4 rounded-xl font-black text-sm border-2 transition ${selectedBank === bank ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                                            >
                                                {bank}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8">
                                        <button 
                                            onClick={handleFinalPayment}
                                            className="w-full bg-orange-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-orange-700 transition"
                                        >
                                            Connect to {selectedBank || "Bank"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {paymentStep === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="mb-8"
                            >
                                <Loader2 className="w-16 h-16 text-blue-600" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-2">Processing Transaction</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center max-w-xs leading-relaxed">
                                Please do not refresh or close this window. We are establishing a secure handshake with the financial provider.
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
