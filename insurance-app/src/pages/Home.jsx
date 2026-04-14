import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck, Heart, Car, Zap, Star, ChevronRight,
  ArrowRight, Phone, Mail, TrendingUp, Users, Award,
  CheckCircle, Menu, X
} from "lucide-react";

/* ── Floating animation keyframes injected once ── */
const floatStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-18px) rotate(1deg); }
    66%      { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes floatSlow {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-24px); }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 40px rgba(99,102,241,.35); }
    50%      { box-shadow: 0 0 80px rgba(99,102,241,.6), 0 0 120px rgba(139,92,246,.4); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .float-1 { animation: float 6s ease-in-out infinite; }
  .float-2 { animation: floatSlow 8s ease-in-out infinite 1s; }
  .float-3 { animation: float 7s ease-in-out infinite 2s; }
  .float-4 { animation: floatSlow 9s ease-in-out infinite 0.5s; }
  .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .shimmer-text {
    background: linear-gradient(90deg,#fff 0%,#c7d2fe 40%,#fff 60%,#c7d2fe 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  .hover-lift { transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease; }
  .hover-lift:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 30px 60px rgba(0,0,0,.25); }
  .glass-card {
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .clay-light {
    background: #f0f4ff;
    border-radius: 24px;
    box-shadow: 8px 8px 20px #c8d0e7, -8px -8px 20px #ffffff;
  }
  .nav-glass {
    background: rgba(15,15,30,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
`;

/* ── Data ── */
const plans = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Health Shield",
    subtitle: "Complete Medical Coverage",
    price: "₹499",
    period: "/month",
    color: "from-rose-500 to-pink-600",
    glow: "rgba(244,63,94,.4)",
    features: ["₹10L Coverage", "500+ Hospitals", "No Claim Bonus", "Dental & Vision"],
    tag: "Most Popular",
    href: "/login",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Life Secure",
    subtitle: "Long-Term Life Protection",
    price: "₹299",
    period: "/month",
    color: "from-violet-500 to-indigo-600",
    glow: "rgba(139,92,246,.4)",
    features: ["₹50L Term Plan", "Tax Benefits", "Critical Illness", "Premium Waiver"],
    tag: "Best Value",
    href: "/login",
  },
  {
    icon: <Car className="w-8 h-8" />,
    title: "Motor Guard",
    subtitle: "360° Vehicle Protection",
    price: "₹199",
    period: "/month",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,.4)",
    features: ["Zero Depreciation", "Roadside Assist", "Engine Protect", "Cashless Repairs"],
    tag: "Instant Issuance",
    href: "/login",
  },
];

const features = [
  { icon: <Zap className="w-7 h-7" />, title: "60-Second Issuance", desc: "Buy any plan and receive your digital certificate instantly — no paperwork, no waiting.", color: "#6366f1" },
  { icon: <ShieldCheck className="w-7 h-7" />, title: "KYC Verified Claims", desc: "Industry-standard identity verification ensures your claims are processed without friction.", color: "#10b981" },
  { icon: <TrendingUp className="w-7 h-7" />, title: "AI-Powered Pricing", desc: "Our engine calculates the most competitive premium based on your profile in real time.", color: "#f59e0b" },
  { icon: <Users className="w-7 h-7" />, title: "Dedicated Agents", desc: "A network of verified field agents ready to assist you through every step of your claim.", color: "#ec4899" },
];

const testimonials = [
  { name: "Arjun Mehta", role: "Software Engineer, Bengaluru", text: "Filed a health claim after an emergency. The entire process was done in 2 hours. Literally a lifesaver.", rating: 5, avatar: "AM" },
  { name: "Priya Sharma", role: "Entrepreneur, Mumbai", text: "Comparing 3 vehicle plans side by side before buying was a game-changer. Saved ₹4,000 on premium.", rating: 5, avatar: "PS" },
  { name: "Vikram Nair", role: "Doctor, Chennai", text: "The PDF certificate was in my inbox before I even closed the browser. Absolutely stellar experience.", rating: 5, avatar: "VN" },
];

const stats = [
  { value: "2.4M+", label: "Policies Issued" },
  { value: "₹840Cr+", label: "Claims Settled" },
  { value: "99.2%", label: "Satisfaction Rate" },
  { value: "60 sec", label: "Avg. Issuance Time" },
];

/* ── Component ── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <>
      <style>{floatStyle}</style>

      <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 12, padding: 8 }}>
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px" }}>Pro<span style={{ color: "#818cf8" }}>Insurance</span></span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {["Plans", "Features", "Testimonials"].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`}
                  style={{ color: "rgba(255,255,255,.6)", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "color .2s" }}
                  onMouseOver={e => e.target.style.color = "#fff"}
                  onMouseOut={e => e.target.style.color = "rgba(255,255,255,.6)"}
                >{link}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
                  <a href="/login"
                    style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", padding: "16px 36px", borderRadius: 14, display: "inline-flex", alignItems: "center", gap: 10, backdropFilter: "blur(10px)" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,.14)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
                  >
                    Sign In
                  </a>
              <a href="/register" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", padding: "10px 22px", borderRadius: 12, boxShadow: "0 4px 20px rgba(99,102,241,.4)" }}>
                Get Started →
              </a>
            </div>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden" style={{ paddingTop: 16, paddingBottom: 16, borderTop: "1px solid rgba(255,255,255,.1)", marginTop: 12 }}>
              {["Plans", "Features", "Testimonials"].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                  style={{ display: "block", color: "rgba(255,255,255,.7)", fontWeight: 600, padding: "10px 0", textDecoration: "none" }}
                >{link}</a>
              ))}
              <a href="/register" style={{ display: "inline-block", marginTop: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, padding: "10px 24px", borderRadius: 12, textDecoration: "none" }}>
                Get Started
              </a>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <motion.section
          style={{ opacity: heroOpacity, y: heroY, position: "relative", paddingTop: 160, paddingBottom: 120, overflow: "hidden" }}
        >
          {/* Background orbs */}
          <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 100, right: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,.2) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.15) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1 }}>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.4)", borderRadius: 100, padding: "8px 18px", marginBottom: 32 }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6ee7b7", boxShadow: "0 0 8px #6ee7b7" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#c7d2fe", letterSpacing: "0.05em" }}>INDIA'S FASTEST GROWING INSURETECH</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontSize: "clamp(42px,8vw,88px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, maxWidth: 900 }}
            >
              Protection that{" "}
              <span className="shimmer-text">moves as fast</span>
              {" "}as your life.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ fontSize: 20, color: "rgba(255,255,255,.55)", maxWidth: 600, lineHeight: 1.65, marginBottom: 48, fontWeight: 500 }}
            >
              Buy, manage, and claim insurance in minutes. No agents, no queues — just a world-class digital experience built for India.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
            >
              <a href="/register"
                className="hover-lift pulse-glow"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 17, textDecoration: "none", padding: "18px 40px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 10 }}
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#plans"
                style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontWeight: 700, fontSize: 17, textDecoration: "none", padding: "18px 40px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 10, backdropFilter: "blur(10px)", transition: "background .2s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,.07)"}
              >
                Explore Plans
              </a>
            </motion.div>

            {/* Floating cards preview */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ position: "relative", marginTop: 80, width: "100%", maxWidth: 800, height: 220 }}
            >
              {/* Card 1 */}
              <div className="float-1 glass-card" style={{ position: "absolute", left: "5%", top: 20, width: 200, padding: 20, borderRadius: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)", borderRadius: 10, padding: 8 }}><Heart className="w-5 h-5 text-white" /></div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Health Shield</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#f472b6" }}>₹499<span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>/mo</span></div>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.5)" }}>₹10L Coverage</div>
              </div>

              {/* Card 2 - center, raised */}
              <div className="float-2 glass-card pulse-glow" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: -20, width: 220, padding: 24, borderRadius: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 12, padding: 10 }}><Zap className="w-5 h-5 text-white" /></div>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>Life Secure</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#a5b4fc" }}>₹299<span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>/mo</span></div>
                <div style={{ marginTop: 8, display: "inline-block", background: "rgba(99,102,241,.25)", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#c7d2fe" }}>BEST VALUE</div>
              </div>

              {/* Card 3 */}
              <div className="float-3 glass-card" style={{ position: "absolute", right: "5%", top: 30, width: 200, padding: 20, borderRadius: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", borderRadius: 10, padding: 8 }}><Car className="w-5 h-5 text-white" /></div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Motor Guard</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#67e8f9" }}>₹199<span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>/mo</span></div>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.5)" }}>Zero Depreciation</div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ── STATS STRIP ── */}
        <section style={{ background: "rgba(255,255,255,.03)", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "40px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32, textAlign: "center" }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PLANS ── */}
        <section id="plans" style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", letterSpacing: "0.15em", marginBottom: 12 }}>INSURANCE PLANS</div>
              <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16 }}>Coverage for every chapter of life</h2>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 18, maxWidth: 500, margin: "0 auto" }}>One platform, infinite protection. Compare and buy in under 60 seconds.</p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 }}>
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -16, scale: 1.03 }}
                  style={{ position: "relative", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, padding: 36, cursor: "pointer", transition: "box-shadow .3s" }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = `0 30px 60px ${plan.glow}`}
                  onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                >
                  {/* Tag */}
                  <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", padding: "4px 12px", borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,.7)" }}>{plan.tag}</div>

                  {/* Icon */}
                  <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, marginBottom: 20 }}>
                    <div style={{ background: `linear-gradient(135deg,${plan.color.includes('rose') ? '#f43f5e,#ec4899' : plan.color.includes('violet') ? '#8b5cf6,#6366f1' : '#06b6d4,#3b82f6'})`, borderRadius: 14, padding: 12, color: "#fff" }}>{plan.icon}</div>
                  </div>

                  <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{plan.title}</h3>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>{plan.subtitle}</p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 28 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, background: `linear-gradient(135deg,${plan.color.includes('rose') ? '#f472b6,#fb7185' : plan.color.includes('violet') ? '#a5b4fc,#c4b5fd' : '#67e8f9,#60a5fa'})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{plan.price}</span>
                    <span style={{ color: "rgba(255,255,255,.35)", fontWeight: 600 }}>{plan.period}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle className="w-4 h-4" style={{ color: "#6ee7b7", flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href={plan.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", padding: "14px 24px", borderRadius: 14, transition: "background .2s" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,.15)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
                  >
                    Get Covered <ChevronRight className="w-5 h-5" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: "100px 24px", background: "rgba(99,102,241,.04)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", letterSpacing: "0.15em", marginBottom: 12 }}>WHY CHOOSE US</div>
              <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16 }}>Built for the digital era</h2>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: 18, maxWidth: 500, margin: "0 auto" }}>Every feature is engineered to remove friction from your insurance journey.</p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 32, cursor: "default" }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 20 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, lineHeight: 1.65, fontWeight: 400 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", letterSpacing: "0.15em", marginBottom: 12 }}>TESTIMONIALS</div>
              <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: "-1px" }}>Trusted by millions across India</h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 32 }}
                >
                  <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                    {[...Array(t.rating)].map((_, si) => (
                      <Star key={si} className="w-5 h-5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,.7)", marginBottom: 24, fontWeight: 400, fontStyle: "italic" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section style={{ padding: "80px 24px 100px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.25))", border: "1px solid rgba(99,102,241,.4)", borderRadius: 32, padding: "60px 48px", textAlign: "center", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.3) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.3) 0%,transparent 70%)", pointerEvents: "none" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.2)", border: "1px solid rgba(99,102,241,.5)", borderRadius: 100, padding: "8px 18px", marginBottom: 24 }}>
                  <Award className="w-4 h-4" style={{ color: "#a5b4fc" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#c7d2fe", letterSpacing: "0.1em" }}>INDIA'S #1 DIGITAL INSURER</span>
                </div>

                <h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.1 }}>
                  Your first step to complete protection starts here.
                </h2>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 18, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.6 }}>
                  Join 2.4 million Indians who chose Pro Insurance for speed, trust, and simplicity.
                </p>

                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="/register"
                    className="hover-lift"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 16, textDecoration: "none", padding: "16px 36px", borderRadius: 14, display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(99,102,241,.5)" }}
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href="/login"
                    style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", padding: "16px 36px", borderRadius: 14, display: "inline-flex", alignItems: "center", gap: 10, backdropFilter: "blur(10px)" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,.14)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
                  >
                    Sign In
                  </a>
                </div>

                <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
                  {[
                    { icon: <Phone className="w-4 h-4" />, label: "24/7 Support" },
                    { icon: <ShieldCheck className="w-4 h-4" />, label: "100% Secure" },
                    { icon: <Zap className="w-4 h-4" />, label: "Instant Issuance" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.5)", fontSize: 14, fontWeight: 600 }}>
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, padding: 7 }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18 }}>Pro<span style={{ color: "#818cf8" }}>Insurance</span></span>
          </div>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, fontWeight: 500 }}>
            © 2026 Pro Insurance Digital Ledger. IRDAI Licensed. All rights reserved.
          </p>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Use", "Grievance", "Contact"].map(link => (
              <a key={link} href="#" style={{ color: "rgba(255,255,255,.35)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                onMouseOver={e => e.target.style.color = "rgba(255,255,255,.7)"}
                onMouseOut={e => e.target.style.color = "rgba(255,255,255,.35)"}
              >{link}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}
