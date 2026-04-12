import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { UserCheck, ShieldOff, ShieldCheck, UploadCloud, ChevronLeft, CreditCard, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileKYC() {
  const [user, setUser] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [invoiceId, setInvoiceId] = useState(null);
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
    fetchProfile();
    fetchUserPolicies();
  }, []);

  const fetchProfile = () => {
    setUser({
      email: localStorage.getItem("email") || "Unknown",
      kyc_status: localStorage.getItem("kyc_status") || "Pending",
      role: localStorage.getItem("role") || "user",
    });
  };

  const fetchUserPolicies = async () => {
      try {
          const token = localStorage.getItem("access");
          const res = await axios.get("http://127.0.0.1:8000/api/my-policies/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPolicies(res.data);
      } catch (err) { console.log(err); }
  };

  const handleKYCUpload = async () => {
    if (!aadhaar || !pan || !selfie) return alert("Please upload all 3 required documents (Aadhaar, PAN, and Selfie)");
    setLoading(true);
    const formData = new FormData();
    formData.append("aadhaar", aadhaar);
    formData.append("pan", pan);
    formData.append("selfie", selfie);
    try {
      const token = localStorage.getItem("access");
      await axios.post("http://127.0.0.1:8000/api/kyc-update/", formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
        }
      });
      alert("Documents submitted for manual verification.");
      setUser({ ...user, kyc_status: "Pending" });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCert = async (certId) => {
      const token = localStorage.getItem("access");
      window.open(`http://127.0.0.1:8000/api/download-cert/${certId}/?access_token=${token}`);
  };

  const pay = async (method) => {
    try {
      const token = localStorage.getItem("access");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let amount = 500;
      let policy_id = policies[0]?.id || 1;

      // STEP 1: UI simulation (important)
      if (method === "UPI") {
        alert("Opening UPI App...");
      }

      if (method === "Card") {
        const card = prompt("Enter Card Number (demo: 1234)");
        if (!card) return;
      }

      if (method === "Net Banking") {
        const bank = prompt("Enter Bank Name");
        if (!bank) return;
      }

      // STEP 2: Call backend
      const res = await axios.post("http://127.0.0.1:8000/api/make-payment/", {
        policy_id,
        amount,
        method
      }, config);

      if (!res.data.payment_id) {
        throw new Error("Payment not created");
      }

      // STEP 3: Invoice
      const invoiceRes = await axios.post("http://127.0.0.1:8000/api/invoice/create/", {
        payment_id: res.data.payment_id
      }, config);

      setInvoiceId(invoiceRes.data.invoice_id);
      alert("Payment Success ✅");

    } catch (err) {
      console.error(err);
      alert("Payment Failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex justify-between items-center clay p-6 mb-16 shadow-xl glass">
          <div className="flex gap-4">
              <button onClick={handleBack} className="flex items-center gap-2 font-bold text-gray-500 hover:text-blue-600 transition p-2 rounded-xl">
                  <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleHome} className="flex items-center gap-2 font-bold text-gray-500 hover:text-blue-600 transition p-2 rounded-xl" title="Dashboard">
                  <Home className="w-5 h-5" />
              </button>
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Member Profile</h1>
          <div className="w-16"></div> {/* Spacer for center alignment */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full max-w-7xl">
        {/* Profile Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
        >
            <div className="clay p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-white shadow-inner">
                    <UserCheck className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">{user?.email?.split('@')[0]}</h2>
                <p className="text-gray-400 font-bold mb-8">{user?.email}</p>
                
                <div className={`p-4 rounded-2xl flex items-center justify-center gap-2 mb-8 ${user?.kyc_status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user?.kyc_status === 'Verified' ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                    <span className="font-black text-sm uppercase tracking-widest">KYC Status: {user?.kyc_status}</span>
                </div>

                {user?.kyc_status !== 'Verified' && (
                    <div className="text-left space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Verify Your Identity (Requires 3 files)</p>
                        
                        <div className="clay-inset p-4 relative text-center hover:bg-white/30 transition rounded-xl">
                            <UploadCloud className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{aadhaar ? aadhaar.name : "1. Upload Aadhaar Card (PDF/JPG)"}</p>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setAadhaar(e.target.files[0])} />
                        </div>

                        <div className="clay-inset p-4 relative text-center hover:bg-white/30 transition rounded-xl">
                            <UploadCloud className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{pan ? pan.name : "2. Upload PAN Card (PDF/JPG)"}</p>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setPan(e.target.files[0])} />
                        </div>

                        <div className="clay-inset p-4 relative text-center hover:bg-white/30 transition rounded-xl">
                            <UploadCloud className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{selfie ? selfie.name : "3. Upload Live Selfie (JPG/PNG)"}</p>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => setSelfie(e.target.files[0])} />
                        </div>
                        <button 
                            onClick={handleKYCUpload} 
                            disabled={loading || !aadhaar || !pan || !selfie}
                            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "PROCESSING..." : "SUBMIT FOR REVIEW"}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Coverage Details */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
        >
            <div className="clay p-12 shadow-2xl bg-white/40">
                <div className="flex items-center gap-3 mb-10">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <h3 className="text-3xl font-black text-gray-800 tracking-tight">Active Protection Portfolio</h3>
                </div>

                <div className="space-y-6">
                    {policies.length > 0 ? policies.map(p => (
                        <div key={p.id} className="clay-inset p-8 flex justify-between items-center group hover:bg-white/20 transition">
                            <div>
                                <p className="font-black text-2xl text-gray-800">{p.policy_name}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cert ID: {p.certificate_id}</p>
                            </div>
                            <button 
                                onClick={() => downloadCert(p.certificate_id)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-blue-700 transition tracking-widest uppercase flex items-center gap-2"
                            >
                                <UploadCloud className="w-4 h-4 rotate-180" /> Download PDF
                            </button>
                        </div>
                    )) : (
                        <div className="text-center p-12 opacity-30">
                            <CreditCard className="w-20 h-20 mx-auto mb-4" />
                            <p className="font-black text-xl uppercase tracking-widest">No Active Policies found</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="clay p-8 bg-blue-50/50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Premium Invested</p>
                    <p className="text-4xl font-black text-blue-800">₹ 85,400</p>
                </div>
                <div className="clay p-8 bg-green-50/50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Next Renewal Date</p>
                    <p className="text-4xl font-black text-green-800">Oct 24</p>
                </div>
            </div>

            {/* Payment Section */}
            <div className="clay p-10 bg-white/40 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Make Manual Payment</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={()=>pay("UPI")} className="clay p-4 font-black text-xs text-blue-600 hover:scale-105 active:scale-95 transition tracking-widest uppercase">
                        UPI
                    </button>
                    <button onClick={()=>pay("Card")} className="clay p-4 font-black text-xs text-blue-600 hover:scale-105 active:scale-95 transition tracking-widest uppercase">
                        Credit / Debit Card
                    </button>
                    <button onClick={()=>pay("Net Banking")} className="clay p-4 font-black text-xs text-blue-600 hover:scale-105 active:scale-95 transition tracking-widest uppercase">
                        Net Banking
                    </button>
                </div>

                {invoiceId && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 p-6 bg-blue-600 rounded-2xl flex items-center justify-between"
                    >
                        <div>
                            <p className="text-white font-black text-lg">Payment Successful!</p>
                            <p className="text-blue-100 text-xs font-bold">Your invoice is ready for download.</p>
                        </div>
                        <button
                            onClick={() => window.open(`http://127.0.0.1:8000/api/invoice/download/${invoiceId}/`)}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs shadow-xl hover:bg-gray-100 transition tracking-widest uppercase flex items-center gap-2"
                        >
                            <UploadCloud className="w-4 h-4 rotate-180" /> Download Invoice
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}
