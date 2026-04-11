import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserPlus, FileText, BarChart3, LogOut, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole("");
    window.location.href = "/";
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-clay-bg w-full p-8 flex flex-col items-center">
        <header className="flex justify-between items-center clay p-6 mb-16 w-full max-w-6xl shadow-xl glass">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-10 h-10 text-blue-600" />
             <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Pro Insurance</h1>
          </div>
          <nav className="flex items-center gap-8">
            <a href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Get Started
            </a>
          </nav>
        </header>

        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20 max-w-3xl"
        >
          <h2 className="text-7xl font-black text-gray-800 mb-8 tracking-tighter leading-none">
            Digital Asset <span className="text-blue-600">Protection.</span>
          </h2>
          <p className="text-gray-500 text-2xl font-medium leading-relaxed">
            The world's first role-based insurance ecosystem for the modern enterprise. Instant claims, real-time analytics, and native mobile access.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          {[
              { title: "Administrator", role: "admin", color: "blue", icon: <ShieldCheck className="w-10 h-10" /> },
              { title: "Policy Holder", role: "user", color: "green", icon: <FileText className="w-10 h-10" /> },
              { title: "Verification", role: "agent", color: "purple", icon: <BarChart3 className="w-10 h-10" /> }
          ].map((card, idx) => (
             <motion.a 
                key={card.role}
                href={`/${card.role}`} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="clay group p-12 text-center flex flex-col items-center border border-white/40"
             >
                <div className={`w-20 h-20 bg-${card.color}-100 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-${card.color}-600 transition-all duration-500 shadow-inner`}>
                    <div className={`text-${card.color}-600 group-hover:text-white transition-colors`}>{card.icon}</div>
                </div>
                <span className="font-black text-2xl text-gray-800 tracking-tight uppercase">{card.title}</span>
                <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Portal <ChevronRight className="w-4 h-4" />
                </div>
             </motion.a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg w-full p-10 flex flex-col items-center">
      <header className="flex justify-between items-center clay p-6 mb-16 w-full max-w-6xl shadow-xl glass">
        <div className="flex items-center gap-3">
             <ShieldCheck className="w-10 h-10 text-blue-600" />
             <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Executive Portal</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Secure Logout
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="clay p-16 w-full max-w-5xl shadow-3xl text-center border border-white/50"
      >
        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Dashboard Access Verified</span>
        <h2 className="text-7xl font-black mb-10 text-gray-800 tracking-tighter leading-none">
          Welcome back,<br/><span className="text-blue-600 capitalize underline decoration-8 decoration-white/50 underline-offset-8">{role}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <motion.a 
                href="/policies"
                whileHover={{ scale: 1.05 }}
                className="clay p-8 bg-white/50 border border-white flex items-center justify-between group"
            >
                <div className="text-left">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Solutions</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">Browse Policies</p>
                </div>
                <ChevronRight className="w-8 h-8 text-blue-600 group-hover:translate-x-2 transition-transform" />
            </motion.a>
            
            <motion.a 
                href={role === 'admin' || role === 'agent' ? "/admin-dashboard" : "/claim"}
                whileHover={{ scale: 1.05 }}
                className="clay p-8 bg-white/50 border border-white flex items-center justify-between group"
            >
                 <div className="text-left">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Operations</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">
                        {role === 'admin' || role === 'agent' ? "System Oversight" : "File a Claim"}
                    </p>
                </div>
                <ChevronRight className="w-8 h-8 text-blue-600 group-hover:translate-x-2 transition-transform" />
            </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
