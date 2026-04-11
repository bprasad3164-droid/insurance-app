import { useEffect, useState } from "react";

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
      <div className="min-h-screen bg-gray-200 w-full p-6 flex flex-col items-center">
        <header className="flex justify-between clay p-4 mb-6 w-full max-w-4xl">
          <h1 className="text-xl font-bold font-serif text-gray-800 tracking-tight">Pro Insurance Portal</h1>
          <nav className="space-x-6">
            <a href="#" className="hover:text-blue-600 transition-colors font-semibold">Guidelines</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-semibold">Contact</a>
          </nav>
        </header>

        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">Your Protection, Our Priority</h2>
          <p className="text-gray-600 max-w-xl text-lg font-medium leading-relaxed">
            Experience the future of insurance management with our role-based portal. Secure, intuitive, and designed for efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl px-4">
          <a href="/admin" className="clay group p-12 text-center flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors text-blue-600 group-hover:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <span className="font-bold text-2xl text-gray-800">Admin</span>
          </a>
          <a href="/user" className="clay group p-12 text-center flex flex-col items-center hover:scale-105 transition-all duration-300">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors text-green-600 group-hover:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <span className="font-bold text-2xl text-gray-800">User</span>
          </a>
          <a href="/agent" className="clay group p-12 text-center flex flex-col items-center hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors text-purple-600 group-hover:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <span className="font-bold text-2xl text-gray-800">Agent</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center">
      <header className="flex justify-between clay p-5 mb-12 w-full max-w-5xl shadow-xl">
        <h1 className="text-2xl font-black text-blue-800">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md active:scale-95"
        >
          Logout
        </button>
      </header>

      <div className="clay p-12 w-full max-w-4xl text-center shadow-2xl animate-in fade-in zoom-in duration-500">
        <h2 className="text-5xl font-black mb-8 capitalize text-gray-800 tracking-tight">
          Welcome, {role}!
        </h2>
        <div className="bg-white/50 p-8 rounded-3xl border border-white/40 shadow-inner">
            <p className="text-xl text-gray-700 font-medium">
                You are currently logged in as an <span className="text-blue-600 font-bold underline decoration-wavy underline-offset-4">{role}</span>.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="clay p-6 font-bold text-gray-700 hover:bg-white/60 transition-colors cursor-pointer">View Active Policies</div>
                <div className="clay p-6 font-bold text-gray-700 hover:bg-white/60 transition-colors cursor-pointer">Process Claims</div>
            </div>
        </div>
      </div>
    </div>
  );
}
