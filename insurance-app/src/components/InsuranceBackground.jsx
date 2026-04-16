import { motion } from "framer-motion";
import { Shield, Umbrella, Heart, Zap } from "lucide-react";

const icons = [
    { Icon: Shield, color: "text-blue-500" },
    { Icon: Umbrella, color: "text-green-500" },
    { Icon: Heart, color: "text-red-500" },
    { Icon: Zap, color: "text-orange-500" },
];

export default function InsuranceBackground() {
    // Generate static positions to avoid "hydration mismatch" if SSR was enabled, 
    // but here we just want deterministic-looking randomness.
    const items = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        iconObj: icons[i % icons.length],
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: 20 + Math.random() * 40,
        delay: Math.random() * -20,
        size: 20 + Math.random() * 60,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ 
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        opacity: [0.03, 0.08, 0.03],
                        rotate: [0, 360]
                    }}
                    transition={{ 
                        duration: item.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: item.delay
                    }}
                    style={{
                        position: 'absolute',
                        top: item.top,
                        left: item.left,
                    }}
                >
                    <item.iconObj.Icon 
                        size={item.size} 
                        className={`${item.iconObj.color} opacity-20`}
                        strokeWidth={1}
                    />
                </motion.div>
            ))}
            
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/5 via-transparent to-[#22c55e]/5" />
        </div>
    );
}
