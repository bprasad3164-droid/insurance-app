import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Download, ArrowRight, ShieldCheck, Smartphone, CreditCard, Landmark, IndianRupee, FileText, Calendar, Clock } from "lucide-react";
import axios from "axios";

const METHOD_CONFIG = {
    UPI: { icon: Smartphone, label: "UPI Transfer", color: "text-blue-600", bg: "bg-blue-50" },
    CARD: { icon: CreditCard, label: "Credit / Debit Card", color: "text-purple-600", bg: "bg-purple-50" },
    NETBANKING: { icon: Landmark, label: "Net Banking", color: "text-orange-600", bg: "bg-orange-50" },
};

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [invoiceId, setInvoiceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState(null);

    const paymentId = searchParams.get("payment_id");
    const policyId = searchParams.get("policy_id");

    useEffect(() => {
        const finalizePayment = async () => {
            try {
                const token = localStorage.getItem("access");
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Get payment details
                try {
                    const detailRes = await axios.get(`http://127.0.0.1:8000/api/payment-detail/${paymentId}/`, { headers });
                    setPaymentDetails(detailRes.data);
                } catch (e) {
                    console.warn("Could not fetch payment details", e);
                }

                // 2. Generate Invoice
                const res = await axios.post("http://127.0.0.1:8000/api/invoice/create/", 
                    { payment_id: paymentId },
                    { headers }
                );
                setInvoiceId(res.data.invoice_id);
                setLoading(false);
            } catch (err) {
                console.error("Failed to generate invoice", err);
                setLoading(false);
            }
        };

        if (paymentId) finalizePayment();
    }, [paymentId]);

    const downloadInvoice = () => {
        if (invoiceId) {
            window.open(`http://127.0.0.1:8000/api/invoice/download/${invoiceId}/`, "_blank");
        }
    };

    const method = paymentDetails?.method?.toUpperCase() || "UPI";
    const config = METHOD_CONFIG[method] || METHOD_CONFIG.UPI;
    const MethodIcon = config.icon;
    const now = new Date();

    return (
        <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="clay p-0 max-w-2xl w-full overflow-hidden"
            >
                {/* Success Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full" />
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                        className="flex justify-center mb-5 relative z-10"
                    >
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter relative z-10">
                        Payment Successful
                    </h1>
                    <p className="text-emerald-100 font-bold text-sm relative z-10">
                        Your policy coverage is now active
                    </p>
                </div>

                {/* Details Section */}
                <div className="p-8 space-y-6">
                    
                    {/* Payment Method Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="clay-inset p-5 flex items-center gap-4 rounded-2xl"
                    >
                        <div className={`p-3 rounded-2xl ${config.bg}`}>
                            <MethodIcon className={`w-7 h-7 ${config.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment Method</p>
                            <p className="font-black text-gray-800 text-lg">{config.label}</p>
                        </div>
                    </motion.div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="clay-inset p-5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</p>
                            </div>
                            <p className="font-mono text-sm font-bold text-gray-700">TXN-{paymentId?.toString().padStart(6, '0')}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="clay-inset p-5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</p>
                            </div>
                            <p className="font-black text-emerald-600 text-lg">
                                ₹{paymentDetails?.amount ? Number(paymentDetails.amount).toLocaleString() : "—"}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="clay-inset p-5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                            </div>
                            <p className="font-bold text-gray-700 text-sm">{now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="clay-inset p-5 rounded-2xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                            </div>
                            <p className="font-bold text-emerald-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Active & Secured
                            </p>
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-4 pt-2"
                    >
                        <button 
                            onClick={downloadInvoice}
                            disabled={loading || !invoiceId}
                            className="bg-blue-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 animate-spin" /> Generating Invoice...
                                </span>
                            ) : (
                                <><Download className="w-6 h-6" /> Download PDF Invoice</>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => navigate("/my-policies")}
                            className="text-gray-500 font-black flex items-center justify-center gap-2 hover:text-gray-800 transition uppercase tracking-widest text-sm p-3"
                        >
                            View My Policies <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
