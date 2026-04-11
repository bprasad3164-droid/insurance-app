import { motion } from "framer-motion";
import { ShieldCheck, User, UserCog, ChevronRight, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e0e5ec] flex flex-col items-center justify-center p-8 w-full">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <ShieldCheck className="w-14 h-14 text-blue-600" />
        </div>
        <h1 className="text-6xl font-black text-gray-800 tracking-tighter mb-4">
          Pro Insurance
        </h1>
        <p className="text-gray-500 font-medium text-xl">
          Select your portal to continue
        </p>
      </motion.div>

      {/* Login Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Admin Card */}
        <motion.a
          href="/admin"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.03 }}
          className="clay p-10 flex flex-col items-center text-center group cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all duration-300 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">
            Administrator
          </h2>
          <p className="text-gray-400 font-medium text-sm mb-6">
            Manage policies, approve claims, and view analytics
          </p>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Admin Login <ChevronRight className="w-4 h-4" />
          </div>
        </motion.a>

        {/* User Card */}
        <motion.a
          href="/user"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.03 }}
          className="clay p-10 flex flex-col items-center text-center group cursor-pointer border-2 border-transparent hover:border-green-400 transition-all"
        >
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-all duration-300 shadow-inner">
            <User className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">
            Policy Holder
          </h2>
          <p className="text-gray-400 font-medium text-sm mb-6">
            View your policies, file claims, and download certificates
          </p>
          <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            User Login <ChevronRight className="w-4 h-4" />
          </div>
        </motion.a>

        {/* Agent Card */}
        <motion.a
          href="/agent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.03 }}
          className="clay p-10 flex flex-col items-center text-center group cursor-pointer border-2 border-transparent hover:border-purple-400 transition-all"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-all duration-300 shadow-inner">
            <UserCog className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">
            Field Agent
          </h2>
          <p className="text-gray-400 font-medium text-sm mb-6">
            Verify documents and process claim approvals
          </p>
          <div className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Agent Login <ChevronRight className="w-4 h-4" />
          </div>
        </motion.a>
      </div>

      {/* Register CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-14 text-center"
      >
        <p className="text-gray-400 font-medium mb-4">New to Pro Insurance?</p>
        <a
          href="/register"
          className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-1 text-lg"
        >
          <UserPlus className="w-6 h-6" />
          Create Account
        </a>
      </motion.div>

      {/* Footer */}
      <p className="mt-16 text-gray-300 font-black text-xs uppercase tracking-[0.4em]">
        Pro Insurance © 2026 — Enterprise Digital Ledger
      </p>
    </div>
  );
}
