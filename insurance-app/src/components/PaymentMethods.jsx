import React from "react";
import { CreditCard, Smartphone, Landmark, Wallet, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentMethods({ amount, onSelect }) {
  const methods = [
    { id: "upi", label: "Unified Payments (UPI)", icon: <Smartphone className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-100" },
    { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "netbanking", label: "Net Banking", icon: <Landmark className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-100" },
    { id: "wallet", label: "Digital Wallets", icon: <Wallet className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Secure Payment Method</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method.id)}
            className="w-full clay-inset p-5 rounded-2xl flex items-center justify-between group hover:bg-white/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${method.bg} ${method.color} shadow-inner`}>
                {method.icon}
              </div>
              <span className="font-black text-gray-700 text-sm">{method.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100/50 rounded-2xl border border-dashed border-gray-300">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Payable Amount</span>
            <span className="text-lg font-black text-blue-900">₹{amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
