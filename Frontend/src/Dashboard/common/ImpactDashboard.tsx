import React from "react";
import { motion } from "framer-motion";
import {
  Leaf, Utensils, Trash2, Building2, Users, TrendingUp, Cpu, Truck,
  ArrowUpRight, Sparkles, Bot, Zap,
} from "lucide-react";
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
  const sparkA = [8, 12, 10, 18, 22, 20, 28, 32, 30, 40, 44, 52];
  const sparkB = [22, 18, 26, 30, 34, 30, 42, 38, 46, 50, 56, 62];

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
          <button className="btn-ghost"><Bot className="h-4 w-4" /> Ask ReLoop</button>
          <button className="btn-primary"><Zap className="h-4 w-4" /> New listing</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
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
            <a href="#" className="text-xs text-foreground/60 inline-flex items-center gap-1 hover:text-foreground">
              Full analytics <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
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
                {recentPickups.map((p) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-widest text-foreground/55">Category mix</div>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c, i) => {
              const pct = [42, 18, 12, 8, 10, 6, 4][i] || 5;
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
    </div>
  );
};

export default ImpactDashboard;
