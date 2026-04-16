import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, ShieldCheck, Tag, IndianRupee, Clock, CheckCircle2, 
    AlertCircle, FileText, Download, Calendar, ExternalLink, 
    CreditCard, History, ChevronRight, Bookmark, Info
} from "lucide-react";

export default function ClaimDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const token = localStorage.getItem("access");
            const res = await axios.get(`http://127.0.0.1:8000/api/claim-detail/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error("Fetch Details Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            window.open(`http://127.0.0.1:8000/api/claim/report/${id}/`, "_blank");
        } catch (error) {
            alert("Error generating report");
        } finally {
            setTimeout(() => setDownloading(false), 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec]">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
            />
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] flex-col gap-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <p className="font-black text-gray-400 uppercase tracking-widest">Claim Registry Not Found</p>
            <button onClick={() => navigate(-1)} className="clay px-8 py-3 rounded-2xl font-black text-blue-600 uppercase text-xs">Return to Dashboard</button>
        </div>
    );

    const { claim = {}, policy = {}, payments = [], documents = [] } = data;

    return (
        <div className="min-h-screen bg-[#e0e5ec] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="clay p-4 rounded-2xl hover:text-blue-600 transition-colors active:scale-90"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">Claim Hub</h1>
                                <div className="clay px-3 py-1 rounded-full bg-blue-50">
                                    <p className="text-[10px] font-black text-blue-600 uppercase">Track ID: #{claim.id}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-blue-600" /> Unified Mission Critical Data
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleDownload}
                        disabled={downloading}
                        className="clay px-8 py-5 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 group transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                    >
                        {downloading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                        )}
                        <span>{downloading ? "Processing..." : "Download PDF Audit"}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left Column: Tracking & Evidence */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Status Central */}
                        <div className="clay p-10 rounded-[3rem]">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="clay-inset p-3 rounded-2xl text-blue-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Settlement Real-time Timeline</h3>
                            </div>

                            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 px-4">
                                {/* Connection Line */}
                                <div className="hidden md:block absolute top-[22px] left-0 right-0 h-1 bg-gray-200 -z-10 mx-10" />
                                
                                {/* Step 1 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                    <div className="clay p-4 rounded-full bg-green-500 text-white shadow-lg ring-[10px] ring-white">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-gray-800 uppercase">Case Raised</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Initial Intake</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                    <div className={`clay p-4 rounded-full shadow-lg ring-[10px] ring-white ${claim.agent_status === 'Approved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
                                        {claim.agent_status === 'Approved' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-gray-800 uppercase">Agent Audit</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{claim.agent_status === 'Approved' ? 'Verified' : 'Manual Review'}</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                    <div className={`clay p-4 rounded-full shadow-lg ring-[10px] ring-white ${claim.status === 'Approved' ? 'bg-blue-600 text-white' : claim.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {claim.status === 'Approved' ? <ShieldCheck className="w-6 h-6" /> : claim.status === 'Rejected' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-gray-800 uppercase">Settlement</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{claim.status === 'Approved' ? 'Disbursed' : 'Awaiting Finality'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submitted Evidence */}
                        <div className="clay p-10 rounded-[3rem]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="clay-inset p-3 rounded-2xl text-blue-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Submitted Evidence</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {documents.length > 0 ? documents.map((doc, idx) => (
                                    <a 
                                        key={doc.id}
                                        href={`http://127.0.0.1:8000${doc.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="clay-inset p-6 rounded-3xl group flex items-center justify-between hover:bg-white/50 transition-all border border-transparent hover:border-blue-400/30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-700 uppercase truncate max-w-[150px]">{doc.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Audit Documentation</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-blue-600 opacity-50 group-hover:opacity-100" />
                                    </a>
                                )) : (
                                    <div className="col-span-2 text-center py-10 opacity-30">
                                        <p className="font-black text-xs uppercase tracking-widest">No Electronic Documents Found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="clay p-10 rounded-[3rem]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="clay-inset p-3 rounded-2xl text-purple-600">
                                    <History className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Payment Audit Trail</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                                            <th className="text-left pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                            <th className="text-right pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((pmt) => (
                                            <tr key={pmt.id} className="group">
                                                <td className="py-5">
                                                    <p className="text-xs font-black text-gray-800 uppercase">Premium Installment</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(pmt.timestamp).toDateString()}</p>
                                                </td>
                                                <td className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{pmt.method}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <p className="text-sm font-black text-gray-800">₹{pmt.amount.toLocaleString()}</p>
                                                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">SUCCESSFUL DATA</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Policy Insight */}
                    <div className="lg:col-span-4 space-y-10">
                        
                        {/* Policy Metadata Card */}
                        <div className="clay p-10 rounded-[3rem] bg-gradient-to-br from-[#e0e5ec] to-white/30 border-2 border-white/50">
                            <Tag className="w-12 h-12 text-blue-600 mb-8 opacity-20" />
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase mb-2">{policy.name}</h2>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{policy.category} Insurance Plan</p>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed font-bold mb-10 overflow-hidden line-clamp-6">
                                {policy.description}
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="clay-inset p-5 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Renewal Pulse</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-800">{policy?.renewal_date ? new Date(policy.renewal_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="clay-inset p-5 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Final Expiry</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-800">{policy?.expiry_date ? new Date(policy.expiry_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <button className="w-full clay p-5 rounded-2xl flex items-center justify-center gap-3 group">
                                <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Full T&C Audit</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Claim Financial Summary */}
                        <div className="clay p-10 rounded-[3rem] bg-blue-600 text-white relative overflow-hidden">
                            <IndianRupee className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Payout Disbursement</p>
                            <h3 className="text-5xl font-black tracking-tighter mb-2">₹{claim.amount.toLocaleString()}</h3>
                            <p className="text-xs font-bold opacity-80 mb-8 tracking-wide">Approved settlement for catastrophic incident recovery.</p>
                            
                            <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Filing Timestamp</p>
                                    <p className="text-xs font-bold">{new Date(claim.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-20" />
        </div>
    );
}
