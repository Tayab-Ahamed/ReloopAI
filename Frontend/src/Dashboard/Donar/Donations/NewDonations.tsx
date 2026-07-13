import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ScanLine, Cpu, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/brand";

const slides = [
  {
    label: "AI writes the listing for you",
    description: "Upload a photo. Vision AI + OCR + LLM generate the title, description, category and instructions automatically.",
    accent: "from-brand-500 to-accent2-500",
  },
  {
    label: "Matched, not just nearest",
    description: "Recipients are scored on distance, urgency, storage, categories and pickup availability.",
    accent: "from-brand-500 to-blue-500",
  },
  {
    label: "Automated end-to-end",
    description: "n8n orchestrates approval, volunteer assignment, routing, reminders and impact reporting.",
    accent: "from-accent2-500 to-brand-500",
  },
];

const slideInitial = { opacity: 0, y: 12 };
const slideAnimate = { opacity: 1, y: 0 };
const slideTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const NewDonations: React.FC = () => {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const handleStart = () => navigate("/user/Donor/donationForm");

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const s = slides[i];

  return (
    <div className="container-page py-8">
      <div className="chip"><Sparkles className="h-3.5 w-3.5 text-brand-400" /> New listing</div>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Start an AI-assisted donation</h1>
      <p className="mt-1 text-foreground/60 max-w-2xl">
        Snap a photo and ReLoop AI does the rest — detection, matching, routing and impact reporting.
      </p>

      <motion.div
        key={i}
        initial={slideInitial}
        animate={slideAnimate}
        transition={slideTransition}
        className={`relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.accent} p-8 md:p-10 text-white shadow-glow`}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur">
            <ScanLine className="h-3.5 w-3.5" /> AI-assisted
          </div>
          <h2 className="mt-3 font-display text-2xl md:text-3xl font-semibold">{s.label}</h2>
          <p className="mt-2 text-white/85 max-w-xl">{s.description}</p>
          <button
            onClick={handleStart}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-glow hover:brightness-110"
          >
            <Cpu className="h-4 w-4" /> Start with AI <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
      </motion.div>

      <div className="mt-8">
        <div className="text-xs uppercase tracking-widest text-foreground/55">Or list a specific category</div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={handleStart}
              className="card-glass p-4 text-left hover:border-brand-500/40 transition"
            >
              <div className="text-2xl">{c.emoji}</div>
              <div className="mt-1 font-medium">{c.label}</div>
              <div className="text-xs text-foreground/60">{c.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewDonations;
