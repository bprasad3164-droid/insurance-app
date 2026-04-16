import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Download, Shield, Clock, HardDrive, 
    CreditCard, Calendar, AlertCircle, CheckCircle2,
    FileText, User, MapPin
} from 'lucide-react';

export default function ClaimDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/claim-detail/${id}/`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching claim details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/claim/report/${id}/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Claim_Report_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-clay-bg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Retrieving Claim Data...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-20 text-center font-black text-red-500">Claim data unavailable.</div>;

    const { claim, policy, payments, documents } = data;

    return (
        <div className="min-h-screen bg-clay-bg p-8 flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <header className="flex justify-between items-center mb-12">
                    <button onClick={() => navigate(-1)} className="clay px-6 py-3 flex items-center gap-2 font-black text-gray-600 hover:text-blue-600 transition">
                        <ArrowLeft className="w-5 h-5" /> Back to Terminal
                    </button>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleDownloadReport}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Download PDF Report
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    {/* Left Panel: Status & Overview */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="clay p-8 bg-white shadow-2xl overflow-hidden relative border-t-8 border-blue-600">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case ID</p>
                                    <h1 className="text-3xl font-black text-gray-800">#{claim.id}</h1>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {claim.status}
                                </span>
                             </div>
                             
                             <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 clay-inset bg-gray-50/50">
                                    <AlertCircle className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Case Type</p>
                                        <p className="text-sm font-black text-gray-700">{claim.claim_type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 clay-inset bg-gray-50/50">
                                    <CreditCard className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Claim Amount</p>
                                        <p className="text-sm font-black text-gray-700">₹{claim.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                             </div>
                        </motion.div>

                        <div className="clay p-8 bg-gray-900 text-white shadow-2xl relative overflow-hidden">
                            <Shield className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-blue-400" /> Data Integrity
                                </h3>
                                <div className="space-y-2 text-[10px] font-bold text-gray-400">
                                    <p>CREATED: {new Date(claim.created_at).toLocaleString()}</p>
                                    <p>ENCRYPTION: AES-256 Enabled</p>
                                    <p>AUDIT TRAIL: Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Details & Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Timeline */}
                        <div className="clay p-10 bg-white shadow-2xl">
                            <h3 className="text-xl font-black text-gray-800 mb-10 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-blue-600" /> Settlement Timeline
                            </h3>
                            <div className="relative border-l-4 border-blue-50 ml-6 space-y-12">
                                <div className="relative pl-10">
                                    <div className="absolute -left-[14px] top-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg" />
                                    <p className="text-sm font-black text-gray-800">Claim Requested</p>
                                    <p className="text-xs text-gray-400 font-bold">{new Date(claim.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="relative pl-10">
                                    <div className={`absolute -left-[14px] top-0 w-6 h-6 ${claim.agent_status !== 'Pending' ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full border-4 border-white shadow-lg`} />
                                    <p className="text-sm font-black text-gray-800">Field Audit & Verification</p>
                                    <p className="text-xs text-gray-400 font-bold">{claim.agent_status === 'Pending' ? 'In Progress' : 'Completed'}</p>
                                </div>
                                <div className="relative pl-10">
                                    <div className={`absolute -left-[14px] top-0 w-6 h-6 ${claim.status === 'Approved' ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full border-4 border-white shadow-lg`} />
                                    <p className="text-sm font-black text-gray-800">Executive Finalization</p>
                                    <p className="text-xs text-gray-400 font-bold">{claim.status === 'Approved' ? 'Settled' : 'Pending Review'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Context */}
                        <div className="clay p-10 bg-white shadow-2xl">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-600" /> Linked Policy Insight
                            </h3>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="p-4 clay-inset">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Protection Plan</p>
                                    <p className="text-sm font-black text-blue-600">{policy.name}</p>
                                </div>
                                <div className="p-4 clay-inset">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Expiry Date</p>
                                    <p className="text-sm font-black text-rose-600">{policy.expiry_date ? new Date(policy.expiry_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed bg-gray-50 p-4 rounded-xl border-l-4 border-blue-400 italic">
                                "{policy.description}"
                            </p>
                        </div>

                        {/* Transaction History */}
                        <div className="clay p-10 bg-white shadow-2xl">
                            <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-emerald-600" /> Premium Payment Ledger
                            </h3>
                            <div className="space-y-4">
                                {payments.length > 0 ? payments.map((pmt, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-5 clay-inset hover:bg-white transition">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-800">{pmt.method} Payment</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(pmt.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-gray-800">₹{pmt.amount.toLocaleString()}</p>
                                    </div>
                                )) : (
                                    <p className="text-center py-8 text-gray-400 font-black text-xs italic">No transaction records found for this policy cluster.</p>
                                )}
                            </div>
                        </div>

                        {/* Evidence Hub */}
                        <div className="clay p-10 bg-white shadow-2xl">
                             <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                <HardDrive className="w-6 h-6 text-indigo-600" /> Evidence Repository
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {documents.length > 0 ? documents.map((doc, idx) => (
                                    <a key={idx} href={`http://127.0.0.1:8000${doc.url}`} target="_blank" rel="noreferrer" className="clay p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 transition border border-indigo-100">
                                        <FileText className="w-8 h-8 text-indigo-400" />
                                        <p className="text-[10px] font-black text-gray-600 truncate w-full text-center">{doc.name}</p>
                                    </a>
                                )) : (
                                    <div className="col-span-full py-10 text-center clay-inset bg-gray-50/50">
                                        <HardDrive className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400 font-black italic">No case evidence uploaded.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
