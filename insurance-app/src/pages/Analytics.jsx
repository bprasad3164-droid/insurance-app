import { useEffect, useState } from "react";
import api from "../api/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ claims: 0, approved: 0, pending: 0, users: 0, policies: 0 });
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  const handleHome = () => navigate("/dashboard");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    api.get("/analytics/")
    .then(res => {
      const pendingClaims = res.data.claims - res.data.approved;
      setStats({ ...res.data, pending: pendingClaims });
      const chartData = [
        { name: "Approved", value: res.data.approved },
        { name: "Pending", value: pendingClaims }
      ];
      setData(chartData);
    }).catch(err => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) navigate("/login");
    });
  }, [navigate]);

  const COLORS = ["#10B981", "#F59E0B"];

  return (
    <div className="min-h-screen bg-gray-200 w-full p-8 flex flex-col items-center">
      <header className="flex justify-between items-center clay p-5 mb-10 w-full max-w-5xl shadow-xl">
        <div className="flex items-center gap-6">
            <div className="flex gap-2">
                <button onClick={handleBack} className="clay p-2 hover:text-blue-600 transition rounded-xl shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={handleHome} className="clay p-2 hover:text-blue-600 transition rounded-xl shadow-sm" title="Home">
                    <Home className="w-5 h-5" />
                </button>
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Business Intelligence</h1>
        </div>
        <div />
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
                <p className="text-6xl font-black text-gray-800 mt-2">{stats.claims}</p>
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
