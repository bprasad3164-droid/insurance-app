import { motion } from "framer-motion";
import { Shield, Zap, Heart, Car, Star, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-clay-bg min-h-screen text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-black tracking-tighter uppercase">Pro Insurance</h1>
        </div>
        <div className="flex gap-8 items-center font-bold">
            <a href="/policies" className="hover:text-blue-600 transition-colors">Compare Plans</a>
            <a href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-xl hover:bg-blue-700 transition flex items-center gap-2">
                Join Ecosystem <ChevronRight className="w-5 h-5" />
            </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
        >
          <div className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full w-max font-black text-xs uppercase tracking-widest mb-8">
            Digital-First Protection
          </div>
          <h2 className="text-8xl font-black leading-none tracking-tighter mb-10">
            Insurance <br/>
            Redesigned <br/>
            for <span className="text-blue-600">Humans.</span>
          </h2>
          <p className="text-2xl text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
            A real-time, role-based ecosystem where policies are issued in seconds and claims are settled in minutes. No paperwork, just protection.
          </p>
          <div className="flex gap-6">
              <a href="/register" className="clay p-6 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3">
                  Get Covered Now <Zap className="w-6 h-6 fill-white" />
              </a>
              <a href="/user" className="clay p-6 bg-white font-black text-xl rounded-2xl shadow-xl hover:bg-gray-50 transition-all">
                  Existing User
              </a>
          </div>
        </motion.div>

        <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex-1 w-full"
        >
            <div className="clay p-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                <div className="relative z-10 grid grid-cols-2 gap-8 text-left">
                    <div className="p-8 clay bg-white/50">
                        <Heart className="w-12 h-12 text-red-500 mb-4" />
                        <p className="font-black text-2xl">Health</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Starting at $12/mo</p>
                    </div>
                    <div className="p-8 clay bg-white/50">
                        <Zap className="w-12 h-12 text-yellow-500 mb-4" />
                        <p className="font-black text-2xl">Term</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Fast Approval</p>
                    </div>
                    <div className="p-8 clay bg-white/50">
                        <Car className="w-12 h-12 text-blue-500 mb-4" />
                        <p className="font-black text-2xl">Vehicle</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Full Coverage</p>
                    </div>
                    <div className="p-8 clay bg-blue-600 text-white">
                        <Star className="w-12 h-12 text-white mb-4 fill-white" />
                        <p className="font-black text-2xl">Family</p>
                        <p className="opacity-70 font-bold uppercase text-[10px] tracking-widest text-white">Most Trusted</p>
                    </div>
                </div>
            </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-900 py-32 text-white">
          <div className="max-w-7xl mx-auto px-8 text-center">
              <h3 className="text-5xl font-black mb-16 tracking-tight">Trusted by over 10K+ Global Ecosystems</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-gray-400 font-black text-2xl opacity-50 italic">
                  <span>METASHIELD</span>
                  <span>QUANTUM CO.</span>
                  <span>BLOCKVINE</span>
                  <span>NEXUS CORP</span>
              </div>
          </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-32 max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { title: "Instant Issuance", desc: "Buy a policy and get your digital certificate issued in under 60 seconds." },
                { title: "KYC Verified", desc: "Industry-standard identity verification for seamless, secure claim settlements." },
                { title: "24/7 Oversight", desc: "Dedicated Agent and Admin workflows ensuring every claim gets the attention it deserves." }
            ].map((f, i) => (
                <div key={i} className="clay p-12 hover:bg-white transition-colors duration-500">
                    <CheckCircle2 className="w-12 h-12 text-blue-600 mb-6" />
                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{f.title}</h4>
                    <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
            ))}
          </div>
      </section>

      <footer className="p-20 text-center opacity-40 font-black text-xs uppercase tracking-[0.5em]">
          Powered by Pro Insurance Advanced Digital Ledger © 2026
      </footer>
    </div>
  );
}
