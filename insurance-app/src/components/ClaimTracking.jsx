import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, Tag, IndianRupee } from "lucide-react";

export default function ClaimTracking({ claims }) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="space-y-12">
      {claims.map((claim, idx) => (
        <motion.div 
            key={claim.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="clay p-8 relative overflow-hidden group hover:translate-y-[-5px] transition-all"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="clay-inset p-3 rounded-2xl text-blue-600">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Claim #{claim.id}</h3>
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Filed on {new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="clay-inset px-6 py-3 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Requested</p>
                        <p className="text-lg font-black text-gray-800">₹{claim.amount?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Step 1: User Submission */}
                <div className="flex items-center gap-4">
                    <div className="clay p-3 rounded-full text-green-500 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-800 uppercase">Case Raised</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Documents Received</p>
                    </div>
                </div>

                {/* Step 2: Agent Review */}
                <div className="flex items-center gap-4">
                    <div className={`clay p-3 rounded-full shadow-sm ${claim.agent_status === 'Approved' ? 'text-green-500' : 'text-orange-500 animate-pulse'}`}>
                        {claim.agent_status === 'Approved' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={`text-xs font-black uppercase ${claim.agent_status === 'Approved' ? 'text-gray-800' : 'text-orange-600'}`}>Agent Audit</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{claim.agent_status === 'Approved' ? 'Verification Complete' : 'Manual Audit In Progress'}</p>
                    </div>
                </div>

                {/* Step 3: Admin Finality */}
                <div className="flex items-center gap-4">
                    <div className={`clay p-3 rounded-full shadow-sm ${claim.status === 'Approved' ? 'text-green-500' : claim.status === 'Rejected' ? 'text-red-500' : 'text-gray-300'}`}>
                        {claim.status === 'Approved' ? <ShieldCheck className="w-5 h-5" /> : claim.status === 'Rejected' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-800 uppercase">Settlement</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{claim.status === 'Approved' ? 'Funds Cleared' : claim.status === 'Rejected' ? 'Request Declined' : 'Awaiting Finality'}</p>
                    </div>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <ShieldCheck className="w-48 h-48" />
            </div>
        </motion.div>
      ))}
    </div>
  );
}
