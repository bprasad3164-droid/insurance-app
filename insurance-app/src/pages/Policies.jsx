import { useEffect, useState } from "react";
import axios from "axios";

export default function Policies() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/policies/").then(res => setData(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center animate-in fade-in duration-500">
      <header className="flex justify-between clay p-5 mb-10 w-full max-w-5xl shadow-xl">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Available Policies</h1>
        <a href="/" className="bg-white/60 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white transition-colors">Dashboard</a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {data.length > 0 ? (
          data.map(p => (
            <div key={p.id} className="clay p-8 flex flex-col hover:scale-105 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{p.name}</h2>
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed font-medium">{p.description}</p>
              <div className="mt-auto pt-6 border-t border-gray-300 flex justify-between items-center">
                <span className="text-2xl font-black text-blue-700">₹ {p.premium.toLocaleString()}</span>
                <a href="/claim" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md">Apply</a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full clay p-12 text-center">
            <h3 className="text-xl font-bold text-gray-500">No policies available at the moment.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
