import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Download, ArrowRight, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [invoiceId, setInvoiceId] = useState(null);
    const [loading, setLoading] = useState(true);

    const paymentId = searchParams.get("payment_id");
    // const policyId = searchParams.get("policy_id"); // Unused but keep as comment if needed for future

    useEffect(() => {
        const finalizePayment = async () => {
            try {
                const token = localStorage.getItem("access");
                // 1. Generate Invoice
                const res = await axios.post("http://127.0.0.1:8000/api/invoice/create/", 
                    { payment_id: paymentId },
                    { headers: { Authorization: `Bearer ${token}` } }
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

    return (
        <div className="min-h-screen bg-clay-bg flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="clay p-12 max-w-2xl w-full text-center shadow-3xl bg-white/80 backdrop-blur-md border border-white"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className="flex justify-center mb-8"
                >
                    <CheckCircle className="w-24 h-24 text-green-500" />
                </motion.div>

                <h1 className="text-4xl font-black text-gray-800 mb-4 uppercase tracking-tighter">Transmission Successful</h1>
                <p className="text-gray-500 font-bold mb-10 text-lg">
                    Your premium has been securely processed. Your policy coverage is now active and protected by <span className="text-blue-600">Pro Insurance</span>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                    <div className="clay-inset p-6 bg-white/40">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt Identifier</p>
                        <p className="font-mono text-xs font-bold text-gray-700">{paymentId}</p>
                    </div>
                    <div className="clay-inset p-6 bg-white/40">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asset Status</p>
                        <p className="font-bold text-green-600 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Secured & Active
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={downloadInvoice}
                        disabled={loading || !invoiceId}
                        className="bg-blue-600 text-white p-6 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? "Generating Asset..." : <><Download className="w-6 h-6" /> Download PDF Invoice</>}
                    </button>
                    
                    <button 
                        onClick={() => navigate("/my-policies")}
                        className="text-gray-500 font-black flex items-center justify-center gap-2 hover:text-gray-800 transition uppercase tracking-widest text-sm"
                    >
                        Portfolio Overview <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
