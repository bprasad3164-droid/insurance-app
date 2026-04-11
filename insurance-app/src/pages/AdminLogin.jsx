import axios from "axios";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/admin/login/", { email, password });
      alert(res.data.msg);
    } catch (error) {
      alert("Login failed. Make sure the backend is running.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 w-full">
      <div className="clay p-8 w-80">
        <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
        <input 
          className="w-full p-3 mb-4 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-400 outline-none" 
          placeholder="Email" 
          value={email}
          onChange={e=>setEmail(e.target.value)} 
        />
        <input 
          className="w-full p-3 mb-6 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-400 outline-none" 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e=>setPassword(e.target.value)} 
        />
        <button 
          className="w-full bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg" 
          onClick={handleLogin}
        >
          Login
        </button>
        <div className="mt-4 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-blue-600">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
