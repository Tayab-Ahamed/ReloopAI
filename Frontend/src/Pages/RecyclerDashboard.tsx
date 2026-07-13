import React from "react";
import { motion } from "framer-motion";
import { Recycle, Cpu, Boxes, Weight } from "lucide-react";
import Navbar from "@/components/common/Navbar";

const inbound = [
  { id: "RC-2201", cat: "E-waste • laptops",   kg: 42, source: "Northwind Offices" },
  { id: "RC-2202", cat: "Plastics • PET",     kg: 78, source: "Marina Kitchens" },
  { id: "RC-2203", cat: "Metals • aluminium", kg: 24, source: "Habitat Furnishings" },
];

const RecyclerDashboard: React.FC = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <div className="container-page py-10">
      <div className="chip"><Recycle className="h-3.5 w-3.5 text-accent2-500" /> Recycler</div>
      <h1 className="mt-2 font-display text-3xl font-semibold">Inbound recyclables</h1>
      <p className="text-sm text-foreground/60">Non-reusable streams routed to your certified facility.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass p-5"><div className="flex items-center gap-2 text-foreground/60"><Boxes className="h-4 w-4" /><span className="text-xs uppercase tracking-widest">Open batches</span></div><div className="mt-3 font-display text-3xl">14</div></div>
        <div className="card-glass p-5"><div className="flex items-center gap-2 text-foreground/60"><Weight className="h-4 w-4" /><span className="text-xs uppercase tracking-widest">Received this week</span></div><div className="mt-3 font-display text-3xl">612 kg</div></div>
        <div className="card-glass p-5"><div className="flex items-center gap-2 text-foreground/60"><Cpu className="h-4 w-4" /><span className="text-xs uppercase tracking-widest">AI classified</span></div><div className="mt-3 font-display text-3xl">98%</div></div>
      </div>

      <div className="mt-6 card-glass p-6">
        <div className="text-xs uppercase tracking-widest text-foreground/55">Incoming batches</div>
        <table className="mt-3 min-w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/50 text-[11px] uppercase tracking-widest">
              <th className="py-2 pr-4">ID</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Weight</th><th className="py-2 pr-4">Source</th><th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {inbound.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="border-t border-white/5"
              >
                <td className="py-3 pr-4 font-mono text-xs text-foreground/70">{r.id}</td>
                <td className="py-3 pr-4">{r.cat}</td>
                <td className="py-3 pr-4">{r.kg} kg</td>
                <td className="py-3 pr-4 text-foreground/80">{r.source}</td>
                <td className="py-3 pr-4"><button className="btn-ghost !py-1.5 !px-3 text-xs">Log intake</button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default RecyclerDashboard;
