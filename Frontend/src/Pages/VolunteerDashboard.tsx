import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, PackageCheck, Bike, Navigation } from "lucide-react";
import Navbar from "@/components/common/Navbar";

const tasks = [
  { id: "PU-1042", from: "Marina Kitchens",     to: "Annapurna Trust",  eta: "12 min",  km: "1.8",  cat: "Food",        priority: "high"   },
  { id: "PU-1041", from: "Northwind Offices",   to: "E-Cycle Partners", eta: "22 min",  km: "3.4",  cat: "Electronics", priority: "normal" },
  { id: "PU-1040", from: "Habitat Furnishings", to: "HopeCare NGO",     eta: "41 min",  km: "6.2",  cat: "Furniture",   priority: "normal" },
];

const prio = (p: string) => p === "high" ? "text-amber-300 border-amber-500/25 bg-amber-500/10" : "text-brand-300 border-brand-500/25 bg-brand-500/10";

const VolunteerDashboard: React.FC = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="chip"><Bike className="h-3.5 w-3.5 text-brand-300" /> Volunteer</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Your routed pickups</h1>
          <p className="text-sm text-foreground/60">Tasks assigned by ReLoop AI based on your area, vehicle, and availability.</p>
        </div>
        <button className="btn-primary">Toggle active</button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="card-glass p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-foreground/60">{t.id}</div>
              <span className={`inline-flex h-6 items-center rounded-full border px-2 text-xs ${prio(t.priority)}`}>
                {t.priority}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="mt-1 rounded-lg border border-white/10 bg-white/[0.04] p-1.5"><MapPin className="h-4 w-4 text-brand-300" /></div>
              <div className="text-sm">
                <div className="text-foreground/60">Pick up</div>
                <div>{t.from}</div>
                <div className="mt-2 text-foreground/60">Drop off</div>
                <div>{t.to}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-foreground/70">
              <span className="chip"><Clock className="h-3 w-3" /> {t.eta}</span>
              <span className="chip">{t.km} km</span>
              <span className="chip">{t.cat}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button className="btn-primary"><Navigation className="h-4 w-4" /> Start route</button>
              <button className="btn-ghost"><PackageCheck className="h-4 w-4" /> Mark complete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default VolunteerDashboard;
