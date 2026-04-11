import axios from "axios";
import { useState } from "react";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", { email, password });
      if (res.data.role !== "user") {
        alert("Access Denied: Please use the correct login page for your role.");
        return;
      }
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.role);
      alert(res.data.msg);
      window.location.href = "/";
    } catch (error) {
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 w-full animate-in fade-in duration-700">
      <div className="clay p-10 w-96 shadow-2xl">
        <h2 className="text-3xl font-black mb-8 text-center text-gray-800 tracking-tight">User Login</h2>
        <div className="space-y-4">
            <input 
              className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-green-400 outline-none transition-all placeholder:text-gray-400 font-medium" 
              placeholder="User Email" 
              value={email}
              onChange={e=>setEmail(e.target.value)} 
            />
            <input 
              className="w-full p-4 rounded-2xl bg-white/50 border border-white/20 shadow-inner focus:ring-4 focus:ring-green-400 outline-none transition-all placeholder:text-gray-400 font-medium" 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e=>setPassword(e.target.value)} 
            />
        </div>
        <button 
          className="w-full bg-green-600 text-white font-black p-4 mt-8 rounded-2xl hover:bg-green-700 hover:shadow-green-200 transition-all shadow-xl active:scale-95" 
          onClick={handleLogin}
        >
          Portal Entry
        </button>
        <div className="mt-8 text-center border-t border-gray-300 pt-6">
            <a href="/" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to Portal
            </a>
        </div>
      </div>
    </div>
  );
}
