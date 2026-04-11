import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_claims: 0, approved: 0, pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/analytics/").then(res => {
      setStats(res.data);
      const chartData = [
        { name: "Approved", value: res.data.approved },
        { name: "Pending", value: res.data.pending }
      ];
      setData(chartData);
    });
  }, []);

  const COLORS = ["#10B981", "#F59E0B"];

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center">
      <header className="flex justify-between items-center clay p-5 mb-10 w-full max-w-5xl shadow-xl">
        <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="clay p-2 hover:text-blue-600 transition rounded-xl shadow-sm">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Business Intelligence</h1>
        </div>
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Home</a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
        <div className="clay p-10 flex flex-col items-center justify-center shadow-2xl">
          <h2 className="text-2xl font-black mb-8 text-gray-700 uppercase tracking-widest">Claim Distribution</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
            <div className="clay p-10 shadow-xl border-l-8 border-blue-500 transform hover:scale-102 transition-transform">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Claims Volume</span>
                <p className="text-6xl font-black text-gray-800 mt-2">{stats.total_claims}</p>
            </div>
            <div className="clay p-10 shadow-xl border-l-8 border-green-500 transform hover:scale-102 transition-transform">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Approved for Settlement</span>
                <p className="text-6xl font-black text-green-600 mt-2">{stats.approved}</p>
            </div>
            <div className="clay p-10 shadow-xl border-l-8 border-yellow-500 transform hover:scale-102 transition-transform">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Verification</span>
                <p className="text-6xl font-black text-yellow-600 mt-2">{stats.pending}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
