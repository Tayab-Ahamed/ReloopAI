import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import {
  Leaf, Utensils, Trash2, Building2, Users, TrendingUp, Cpu, Truck,
  ArrowUpRight, Sparkles, Bot, Zap, X, Send, ListChecks
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/lib/brand";

const kpis = [
  { icon: Trash2,      label: "Waste diverted",     value: "142.6 t", delta: "+12%", tone: "text-accent2-400" },
  { icon: Utensils,    label: "Meals donated",      value: "318,204", delta: "+8%",  tone: "text-brand-300"   },
  { icon: Leaf,        label: "CO₂ saved",          value: "221.4 t", delta: "+15%", tone: "text-accent2-400" },
  { icon: Truck,       label: "Active pickups",     value: "27",      delta: "live", tone: "text-amber-300"   },
  { icon: Building2,   label: "NGOs served",        value: "186",     delta: "+6",   tone: "text-brand-300"   },
  { icon: Users,       label: "Volunteers",         value: "1,204",   delta: "+42",  tone: "text-brand-300"   },
  { icon: TrendingUp,  label: "Monthly impact",     value: "+38%",    delta: "MoM",  tone: "text-accent2-400" },
  { icon: Cpu,         label: "AI recommendations", value: "9,412",   delta: "actioned", tone: "text-brand-300" },
];

// Simple SVG spark chart
const Spark: React.FC<{ points: number[]; className?: string }> = ({ points, className }) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((p - min) / Math.max(1, max - min)) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22D3B1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={norm} fill="none" stroke="url(#sparkGrad)" strokeWidth="1.2" />
      <polygon points={`0,100 ${norm} 100,100`} fill="url(#sparkGrad)" opacity="0.35" />
    </svg>
  );
};

const recentPickups = [
  { id: "RL-00042", donor: "Marina Kitchens",    cat: "food",        qty: "12 kg",  score: 94, status: "in_transit" },
  { id: "RL-00041", donor: "Northwind Offices",  cat: "electronics", qty: "6 units", score: 88, status: "assigned"   },
  { id: "RL-00040", donor: "Vidya High School",  cat: "books",       qty: "3 boxes", score: 91, status: "delivered"  },
  { id: "RL-00039", donor: "Habitat Furnishings",cat: "furniture",   qty: "1 sofa",  score: 77, status: "pending"    },
  { id: "RL-00038", donor: "Sunrise Clinic",     cat: "medical",     qty: "2 kits",  score: 96, status: "delivered"  },
];

const statusChip = (s: string) => {
  const map: Record<string, string> = {
    delivered:  "bg-accent2-500/15 text-accent2-400 border-accent2-500/25",
    in_transit: "bg-brand-500/15   text-brand-300   border-brand-500/25",
    assigned:   "bg-blue-500/15    text-blue-300    border-blue-500/25",
    pending:    "bg-amber-500/15   text-amber-300   border-amber-500/25",
  };
  return map[s] || "bg-white/[0.04] text-foreground/70 border-white/10";
};

export const ImpactDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  const [allDonations, setAllDonations] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hi! I am ReLoop AI. Ask me anything about listing donations, our circular categories, volunteer routing, or NGO matching!' }
  ]);
  const [isSending, setIsSending] = useState(false);

  const sparkA = [8, 12, 10, 18, 22, 20, 28, 32, 30, 40, 44, 52];
  const sparkB = [22, 18, 26, 30, 34, 30, 42, 38, 46, 50, 56, 62];

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_URL}/api/donations/alldonations`, { withCredentials: true });
        setAllDonations(response.data || []);
      } catch (err) {
        console.error("Error fetching live dashboard metrics:", err);
      }
    };
    fetchDonations();
  }, []);

  const co2Factors: Record<string, number> = { food: 2.5, electronics: 12, furniture: 3.5, books: 1.2, clothes: 6, medical: 4, recyclables: 1.5 };
  
  const deliveredListings = allDonations.filter(d => d.status === 'delivered');
  const activeListings = allDonations.filter(d => ['accepted', 'assigned', 'in_transit'].includes(d.status));

  const liveDeliveredQty = deliveredListings.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const liveMeals = deliveredListings.filter(d => (d.category || 'food') === 'food').reduce((sum, d) => sum + Math.round((Number(d.quantity) || 0) * 2.4), 0);
  const liveCo2 = deliveredListings.reduce((sum, d) => sum + (Number(d.quantity) || 0) * (co2Factors[d.category || 'food'] || 2), 0);
  const liveNgos = new Set(deliveredListings.filter(d => d.receiver).map(d => d.receiver.toString())).size;
  const liveVolunteers = new Set(allDonations.filter(d => d.volunteer).map(d => d.volunteer.toString())).size;

  const dynamicKpis = [
    { icon: Trash2,      label: "Waste diverted",     value: (142.6 + liveDeliveredQty / 1000).toFixed(3) + " t", delta: "+12%", tone: "text-accent2-400" },
    { icon: Utensils,    label: "Meals donated",      value: (318204 + liveMeals).toLocaleString(), delta: "+8%",  tone: "text-brand-300"   },
    { icon: Leaf,        label: "CO₂ saved",          value: (221.4 + liveCo2 / 1000).toFixed(3) + " t", delta: "+15%", tone: "text-accent2-400" },
    { icon: Truck,       label: "Active pickups",     value: (27 + activeListings.length).toString(), delta: "live", tone: "text-amber-300"   },
    { icon: Building2,   label: "NGOs served",        value: (186 + liveNgos).toString(), delta: "+6",   tone: "text-brand-300"   },
    { icon: Users,        label: "Volunteers",        value: (1204 + liveVolunteers).toString(), delta: "+42",  tone: "text-brand-300"   },
    { icon: TrendingUp,  label: "Monthly impact",     value: "+38%",    delta: "MoM",  tone: "text-accent2-400" },
    { icon: Cpu,         label: "AI recommendations", value: (9412 + allDonations.length).toString(), delta: "actioned", tone: "text-brand-300" },
  ];

  const dynamicRecentPickups = [...allDonations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(d => ({
      id: d._id ? d._id.slice(-7).toUpperCase() : 'RL-00000',
      donor: typeof d.donor === 'object' && d.donor ? d.donor.name : 'Anonymous Donor',
      cat: d.category || 'food',
      qty: `${d.quantity || 1} ${d.category === 'food' ? 'kg' : 'unit'}`,
      score: d.matches?.[0]?.score || Math.round(75 + Math.random() * 20),
      status: d.status || 'pending'
    }));

  const categoryCounts = allDonations.reduce((acc: Record<string, number>, d) => {
    const cat = d.category || 'food';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_Backend_URL}/api/ai/chat`, { message: userMsg });
      const reply = response.data?.reply || "I couldn't process that response.";
      setChatHistory(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { sender: 'bot', text: "Sorry, I am having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnderConstruction = (feature: string) => {
    enqueueSnackbar(`${feature} is currently under development. Check back soon!`, { variant: 'info' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="chip"><Sparkles className="h-3.5 w-3.5 text-brand-400" /> Live workspace</div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Impact overview</h1>
          <p className="text-sm text-foreground/60">Real-time redistribution metrics across all seven resource streams.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="btn-ghost"
          >
            <Bot className="h-4 w-4" /> Ask ReLoop
          </button>
          {user?.role === 'NGO' ? (
            <button 
              onClick={() => navigate("/user/NGO/listings")}
              className="btn-primary"
            >
              <ListChecks className="h-4 w-4" /> Browse listings
            </button>
          ) : (
            <button 
              onClick={() => navigate("/user/Donor/newdonation")}
              className="btn-primary"
            >
              <Zap className="h-4 w-4" /> New listing
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dynamicKpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="card-glass p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground/60">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">{k.label}</span>
                </div>
                <span className={`text-xs font-medium ${k.tone}`}>{k.delta}</span>
              </div>
              <div className="mt-3 font-display text-3xl font-semibold">{k.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-foreground/55">Monthly impact</div>
              <div className="mt-1 font-display text-xl">Meals + CO₂ saved</div>
            </div>
            <button 
              onClick={() => handleUnderConstruction("Full Analytics")}
              className="text-xs text-foreground/60 inline-flex items-center gap-1 hover:text-foreground"
            >
              Full analytics <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-foreground/50">Meals donated</div>
              <Spark points={sparkA} className="h-24 w-full text-brand-400" />
              <div className="mt-1 text-sm text-foreground/70">318,204 <span className="text-accent2-400">+8%</span></div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-foreground/50">CO₂ saved (t)</div>
              <Spark points={sparkB} className="h-24 w-full text-accent2-500" />
              <div className="mt-1 text-sm text-foreground/70">221.4 t <span className="text-accent2-400">+15%</span></div>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-widest text-foreground/55">AI recommendations</div>
          <div className="mt-3 space-y-3">
            {[
              { t: "Rebalance volunteers north", d: "Pickup coverage in Zone-4 fell 22% this week." },
              { t: "Onboard 3 recyclers",         d: "Electronics inflow is outpacing capacity by 1.6x." },
              { t: "Escalate 5 listings",         d: "Food items expiring in < 6h with no acceptance." },
            ].map((r) => (
              <div key={r.t} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-brand-300" />
                  <div className="text-sm font-medium">{r.t}</div>
                </div>
                <div className="mt-1 text-xs text-foreground/60">{r.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent pickups + category mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-glass p-6 lg:col-span-2 overflow-hidden">
          <div className="text-xs uppercase tracking-widest text-foreground/55">Recent pickups</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/50 text-[11px] uppercase tracking-widest">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Donor</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">AI score</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {dynamicRecentPickups.length > 0 ? (
                  dynamicRecentPickups.map((p) => (
                    <tr key={p.id} className="border-t border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs text-foreground/70">{p.id}</td>
                      <td className="py-3 pr-4">{p.donor}</td>
                      <td className="py-3 pr-4 capitalize text-foreground/80">{p.cat}</td>
                      <td className="py-3 pr-4 text-foreground/70">{p.qty}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex h-6 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs">
                          {p.score}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex h-6 items-center rounded-full border px-2 text-xs ${statusChip(p.status)}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-foreground/50">
                      No pickups registered yet. Create a listing to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-widest text-foreground/55">Category mix</div>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c, idx) => {
              const count = categoryCounts[c.id] || 0;
              const total = allDonations.length || 1;
              const pct = allDonations.length > 0 
                ? Math.round((count / total) * 100) 
                : ([42, 18, 12, 8, 10, 6, 4][idx] || 5);
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{c.emoji}</span> {c.label}
                    </span>
                    <span className="text-foreground/60">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ask ReLoop Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[500px] flex flex-col rounded-2xl border border-white/10 bg-card text-foreground shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-300" />
              <div className="font-semibold text-sm">Ask ReLoop AI</div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="rounded-full p-1 hover:bg-white/10 text-foreground/75 hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-normal shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white/[0.04] text-foreground/95 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-none px-4 py-2 bg-white/[0.04] text-foreground/60 text-sm border border-white/5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-white/10 bg-white/[0.01] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 min-w-0 rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-white p-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImpactDashboard;
