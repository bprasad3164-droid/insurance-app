import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, CreditCard, ArrowLeft, ShieldCheck, Zap, User, IndianRupee, Home, Smartphone, Globe, Check, SmartphoneIcon as UPI, Wallet, CreditCardIcon as Card, Landmark, Loader2, X } from "lucide-react";


export default function BuyPolicy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(25);
  const [salary, setSalary] = useState(50000);
  const [premium, setPremium] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'upi', 'card', 'netbanking'
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'form', 'processing'
  const [vpa, setVpa] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [portfolioStats, setPortfolioStats] = useState({ total_premium: 0, next_renewal: null });

  const fetchPortfolioStats = async () => {
    try {
        const res = await api.get("/portfolio-stats/");
        setPortfolioStats(res.data);
    } catch (err) {
        console.error("Error fetching portfolio stats", err);
    }
  };

  useEffect(() => {
    fetchPortfolioStats();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setUser({
        kyc_status: localStorage.getItem("kyc_status") || "Pending"
    });
  };

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
    const fetchPolicy = async () => {
      try {
        const res = await api.get("/policies/");
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
      const res = await api.post("/calculate/", {
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


  const handleFinalPayment = async () => {
    setPaymentStep('processing');
    
    try {
        // 1. Create Razorpay Order from Backend
        const orderRes = await api.post("/payment/", {
            policy_id: id,
            amount: premium
        });

        const { order_id, amount, currency } = orderRes.data;

        // 2. Open Razorpay Checkout
        const options = {
            key: "rzp_test_5uO7eYq2rX6M7z", // Replace with your actual Key ID
            amount: amount,
            currency: currency,
            name: "Pro Insurance",
            description: `Purchase for ${policy.name}`,
            order_id: order_id,
            handler: async (response) => {
                try {
                    // 3. Verify Payment
                    const verifyRes = await api.post("/payment/verify/", {
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature
                    });

                    if (verifyRes.data.status === 'success') {
                        setSuccess(true);
                        setTimeout(() => {
                            // Backend verification already created the UserPolicy
                            navigate(`/payment-success?payment_id=${response.razorpay_payment_id}&policy_id=${id}`);
                        }, 2000);
                    } else {
                        throw new Error("Verification failed");
                    }
                } catch (err) {
                    alert("Verification Failed: " + (err.response?.data?.error || err.message));
                    setPaymentStep('form');
                }
            },
            prefill: {
                name: localStorage.getItem("username") || "Member Token",
                email: "customer@proinsurance.com",
            },
            theme: {
                color: "#2563eb",
            },
            modal: {
                ondismiss: () => {
                    setPaymentStep('form');
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (err) {
        alert("Transaction Initialization Failed: " + (err.response?.data?.error || err.message));
        setPaymentStep('form');
    }
  };


  if (!policy) return <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec]">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>;

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-12">
            <div className="flex gap-4">
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
            
            {/* Header Stats From Screenshot */}
            <div className="flex gap-6">
                <div className="clay p-6 bg-white/50 min-w-[240px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Premium Invested</p>
                    <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-2xl font-black">₹</span>
                        <h2 className="text-4xl font-black tracking-tighter">{portfolioStats?.total_premium?.toLocaleString() || 0}</h2>
                    </div>
                </div>
                <div className="clay p-6 bg-white/50 min-w-[200px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Renewal Date</p>
                    <h2 className="text-4xl font-black text-green-600 tracking-tighter capitalize">
                        {portfolioStats?.next_renewal 
                            ? new Date(portfolioStats.next_renewal).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                            : "No Active Policies"}
                    </h2>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Policy Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="clay p-10 flex flex-col items-center text-center h-fit bg-white/30"
            >
                <div className="p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-4 uppercase">{policy?.name || "Premium Shield"}</h1>
                <p className="text-gray-500 font-bold mb-8 uppercase tracking-[0.3em] text-[10px]">{policy?.category || "Insurance"} Protection Plan</p>
                
                <div className="w-full space-y-4">
                    <div className="clay-inset p-5 flex justify-between items-center rounded-2xl">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Base Premium</span>
                        <span className="text-gray-800 font-black text-xl">₹{policy?.base_premium?.toLocaleString() || 0}</span>
                    </div>
                    <div className="clay-inset p-5 flex justify-between items-center rounded-2xl">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Max Coverage</span>
                        <span className="text-blue-600 font-black text-xl">₹{(policy?.coverage || 500000).toLocaleString()}+</span>
                    </div>
                </div>
                
                <div className="mt-10 p-6 clay-inset bg-blue-50/30 rounded-3xl flex items-start gap-4 text-left border-none">
                    <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        This plan utilizes <span className="text-blue-600 font-black uppercase">Direct Handshake</span> technology. Your premium is calculated based on AI-assessed risk factors.
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
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Premium Calculator</h2>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Applicant Age</label>
                                <span className="font-black text-blue-600">{age} Years</span>
                            </div>
                            <input 
                                type="range" min="18" max="100" value={age} 
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 clay-inset"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Liquidity</label>
                                <span className="font-black text-blue-600">₹{salary.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="5000" max="500000" step="5000" value={salary} 
                                onChange={(e) => setSalary(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 clay-inset"
                            />
                        </div>

                        <button 
                            onClick={handleCalculate}
                            disabled={calculating}
                            className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${calculating ? 'opacity-50 cursor-not-allowed' : 'clay text-blue-600 hover:scale-[1.02] active:scale-95'}`}
                        >
                            {calculating ? "Processing Query..." : <><Calculator className="w-5 h-5" /> Calculate Quote</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {premium > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="clay p-10 bg-white shadow-xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-5 mb-10">
                                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none">Manual Payment</h1>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">Handshake Protocol v2.4</p>
                                </div>
                            </div>

                            {user?.kyc_status !== 'Verified' ? (
                                <div className="clay-inset p-8 bg-red-50/50 rounded-3xl border-2 border-red-100 flex flex-col items-center text-center">
                                    <ShieldCheck className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                                    <h3 className="text-xl font-black text-red-600 uppercase mb-2">KYC Verification Required</h3>
                                    <p className="text-xs text-gray-500 font-bold mb-6">Internal regulations require identity verification before purchasing new assets.</p>
                                    <button onClick={()=>navigate("/profile")} className="bg-red-500 text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-red-600 transition uppercase tracking-widest">
                                        Verify Identity Now
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-8 mb-12">
                                    <button 
                                        onClick={() => { setPaymentMethod('upi'); setShowPayment(true); setPaymentStep('form'); }}
                                        className="clay p-10 rounded-[2.5rem] font-black group active:scale-95 transition-all flex flex-col items-center gap-6"
                                    >
                                        <Smartphone className="w-14 h-14 text-blue-600 group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-[0.2em] text-[10px] text-blue-600 font-black">UPI</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => { setPaymentMethod('card'); setShowPayment(true); setPaymentStep('form'); }}
                                        className="clay p-10 rounded-[2.5rem] font-black group active:scale-95 transition-all flex flex-col items-center gap-6"
                                    >
                                        <Card className="w-14 h-14 text-purple-600 group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-[0.1em] text-[8px] text-purple-600 font-black text-center leading-tight">Credit / Debit<br/>Card</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => { setPaymentMethod('netbanking'); setShowPayment(true); setPaymentStep('form'); }}
                                        className="clay p-10 rounded-[2.5rem] font-black group active:scale-95 transition-all flex flex-col items-center gap-6"
                                    >
                                        <Landmark className="w-14 h-14 text-orange-600 group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-[0.2em] text-[10px] text-orange-600 font-black text-center">Net Banking</span>
                                    </button>
                                </div>
                            )}

                            <div className="clay-inset p-10 flex justify-between items-center rounded-3xl bg-gray-50/30">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Amount to Remit</span>
                                <span className="text-4xl font-black text-gray-800 tracking-tighter">₹{premium.toLocaleString()}</span>
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
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-2xl"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="clay bg-white w-full max-w-2xl p-0 relative overflow-hidden border border-white"
                >
                    <div className="p-10 pb-0">
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
                                        {paymentMethod?.toUpperCase()} Payment
                                    </h1>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Handshake Protocol v2.4</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowPayment(false)}
                                className="p-3 rounded-2xl text-gray-300 hover:text-red-500 transition clay-inset border-none"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-10 pt-0">
                        {paymentStep === 'form' && (
                            <>
                                {paymentMethod === 'upi' && (

                                <div className="space-y-6">
                                    <div className="clay-inset p-6 rounded-3xl">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Merchant VPA Handle</label>
                                        <input 
                                            placeholder="proinsure@axis" 
                                            disabled
                                            className="w-full bg-transparent p-0 font-black text-gray-300 text-2xl border-none outline-none focus:ring-0" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Your UPI ID</label>
                                        <input 
                                            placeholder="e.g. user@okicici" 
                                            value={vpa}
                                            onChange={(e) => setVpa(e.target.value)}
                                            className="w-full clay-inset p-5 rounded-2xl font-black text-gray-700 focus:text-blue-600 outline-none placeholder:opacity-20" 
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={handleFinalPayment}
                                            className="flex-1 bg-blue-600 text-white p-6 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition"
                                        >
                                            Transmit ₹{premium.toLocaleString()}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-6">
                                    <div className="clay-inset p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl mb-8 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-12 h-10 bg-yellow-400/80 rounded-lg shadow-inner" />
                                                <Card className="w-8 h-8 opacity-60" />
                                            </div>
                                            <p className="font-mono text-2xl tracking-[0.2em] mb-8 font-black">
                                                {cardNumber ? cardNumber.match(/.{1,4}/g).join(' ') : '**** **** **** ****'}
                                            </p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black opacity-60 mb-1">Asset Holder</p>
                                                    <p className="font-black tracking-widest text-sm uppercase">Member Token</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black opacity-60 mb-1">Maturity</p>
                                                    <p className="font-black tracking-widest text-sm">12/28</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                                            <Globe className="w-40 h-40" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Primary Token Number</label>
                                        <input 
                                            maxLength="16"
                                            placeholder="16-Digit Sequence" 
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            className="w-full clay-inset p-5 rounded-2xl font-mono font-black text-gray-700 outline-none placeholder:opacity-20" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Security Code</label>
                                            <input placeholder="***" maxLength="3" className="w-full clay-inset p-5 rounded-2xl font-black text-gray-700 outline-none placeholder:opacity-20" />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                onClick={handleFinalPayment}
                                                className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-purple-700 transition"
                                            >
                                                Authorize
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'netbanking' && (
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Institutional Portal Selection</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank'].map(bank => (
                                            <button 
                                                key={bank}
                                                onClick={() => setSelectedBank(bank)}
                                                className={`p-6 rounded-2xl font-black text-sm transition-all border-none ${selectedBank === bank ? 'clay bg-orange-600 text-white scale-[1.05]' : 'clay-inset text-gray-400 hover:text-orange-500'}`}
                                            >
                                                {bank}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-4">
                                        <button 
                                            onClick={handleFinalPayment}
                                            disabled={!selectedBank}
                                            className="w-full bg-orange-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-orange-700 transition disabled:opacity-30 disabled:grayscale"
                                        >
                                            Link to {selectedBank || "Institution"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            </>
                        )}
                    </div>

                    {paymentStep === 'processing' && (


                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/10">
                            <div className="relative mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="w-24 h-24 border-8 border-blue-600/10 border-t-blue-600 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center uppercase font-black text-[8px] tracking-tighter text-blue-600">
                                    Sync
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Establishing Handshake</h2>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] text-center max-w-sm leading-loose">
                                Security Hash Verified. Contacting Financial Gateway.<br />
                                <span className="text-blue-600">Do not interrupt transmission.</span>
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
