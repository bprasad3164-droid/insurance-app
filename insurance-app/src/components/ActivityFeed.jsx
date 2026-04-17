import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Activity, CreditCard, ShieldCheck, UserCheck, AlertCircle, FileText } from 'lucide-react';

const ACTION_ICONS = {
    CLAIM:   { icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-100" },
    PAYMENT: { icon: <CreditCard  className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-100" },
    POLICY:  { icon: <ShieldCheck className="w-4 h-4" />, color: "text-blue-500",    bg: "bg-blue-100" },
    KYC:     { icon: <UserCheck   className="w-4 h-4" />, color: "text-indigo-500",  bg: "bg-indigo-100" },
    ASSIGN:  { icon: <FileText    className="w-4 h-4" />, color: "text-purple-500",  bg: "bg-purple-100" },
    APPROVE: { icon: <Activity    className="w-4 h-4" />, color: "text-rose-500",    bg: "bg-rose-100" },
};

export default function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await api.get('/activities/');
                setActivities(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch activity feed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 15000); // Pulse every 15s
        return () => clearInterval(interval);
    }, []);

    if (loading && activities.length === 0) {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Live Stream
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {activities.length > 0 ? activities.map((act) => {
                        const style = ACTION_ICONS[act.action_type] || { icon: <Activity className="w-4 h-4" />, color: "text-gray-500", bg: "bg-gray-100" };
                        return (
                            <motion.div
                                key={act.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="clay-mini p-4 flex gap-4 items-start hover:bg-white/50 transition-colors cursor-default"
                            >
                                <div className={`p-2 rounded-xl ${style.bg} ${style.color}`}>
                                    {style.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-800 leading-snug">
                                        {act.description}
                                    </p>
                                    <p className="text-[10px] font-black text-black mt-1 uppercase">
                                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="text-center py-10">
                            <p className="text-xs font-bold text-black italic">Static Quiet...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
