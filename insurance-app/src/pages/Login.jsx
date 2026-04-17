import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, Briefcase, Mail, Lock, ArrowRight, Home, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";

const roles = [
  {
    id: "user",
    label: "Customer Portal",
    icon: <Users className="w-5 h-5" />,
    color: "#16a34a",
    description: "Policy Holder Access",
    action: "Enter Portal"
  },
  {
    id: "agent",
    label: "Agent Portal",
    icon: <Briefcase className="w-5 h-5" />,
    color: "#7c3aed",
    description: "Verification Officer Portal",
    action: "Agent Access"
  },
  {
    id: "admin",
    label: "Admin Portal",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "#2563eb",
    description: "Executive Access Portal",
    action: "Secure Login"
  }
];

export default function Login() {
  const { login, isAuthenticated, loading } = useAuthStore();
  const [activeRole, setActiveRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    return (roleParam && roles.find(r => r.id === roleParam)) ? roleParam : "user";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);


  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    try {
      await login(email, password);
      // Success is handled by the useEffect redirecting to dashboard
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.msg ||
        "Login failed. Please check your credentials."
      );
    }
  };


  const currentRoleConfig = roles.find(r => r.id === activeRole);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#e0e5ec] transition-colors duration-500">
      <div className="flex flex-col w-full max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-3xl clay mb-6"
            style={{ color: currentRoleConfig.color }}
          >
            {currentRoleConfig.icon}
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-2">Pro Insurance</h1>
          <p className="text-black font-bold uppercase tracking-widest text-xs">Unified Access Hub</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
          
          {/* Role Selection Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <p className="text-black font-black text-xs uppercase ml-4 mb-2 tracking-widest">Select Portal</p>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`relative group w-full p-6 flex items-center gap-4 rounded-3xl transition-all duration-300 ${
                  activeRole === role.id ? 'clay translate-x-3' : 'opacity-60 hover:opacity-100 translate-x-0'
                }`}
              >
                <div 
                  className="p-3 rounded-2xl shadow-lg transition-transform" 
                  style={{ background: activeRole === role.id ? role.color : '#bdc3c7', color: 'white' }}
                >
                  {role.icon}
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-800 text-lg leading-none mb-1">{role.label}</p>
                  <p className="text-xs text-black font-bold">{role.description}</p>
                </div>
                {activeRole === role.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-6"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Login Form Card */}
          <div className="w-full lg:w-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="clay p-10 w-full"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{currentRoleConfig.label}</h2>
                  <p className="text-sm font-medium text-black">Please provide your credentials</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-2"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        className="w-full p-4 pl-12 rounded-2xl outline-none font-bold text-gray-800 placeholder:text-black transition-all shadow-inner"
                        style={{ background: "#e0e5ec", boxShadow: "inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff" }}
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        className="w-full p-4 pl-12 pr-12 rounded-2xl outline-none font-bold text-gray-800 placeholder:text-black transition-all shadow-inner"
                        style={{ background: "#e0e5ec", boxShadow: "inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff" }}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-black p-5 mt-4 rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group overflow-hidden relative"
                    style={{ background: loading ? "#bdc3c7" : currentRoleConfig.color }}
                  >
                    <span className="relative z-10">
                      {loading ? "Verifying..." : currentRoleConfig.action}
                    </span>
                    {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" /> }
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-200/50 flex flex-col gap-4 text-center">
                  {activeRole === "user" && (
                    <p className="text-sm font-bold text-black">
                      New here? <a href="/register" className="text-blue-600 hover:underline">Create Account</a>
                    </p>
                  )}
                  <a href="/home" className="flex items-center justify-center gap-2 text-sm font-black text-black hover:text-gray-600 transition-colors">
                    <Home className="w-4 h-4" /> Back to Home
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
