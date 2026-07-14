import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ScanLine, Bot, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { BRAND, CATEGORIES } from "@/lib/brand";
import Scene3D from "@/components/fx/Scene3D";
import MagneticButton from "@/components/fx/MagneticButton";
import GradientBlobs from "@/components/fx/GradientBlobs";

interface HeroProps { className?: string; }

const headInit = { opacity: 0, y: 16 };
const headAnim = { opacity: 1, y: 0 };
const headTrans = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const mockInit = { opacity: 0, y: 30 };
const mockAnim = { opacity: 1, y: 0 };
const mockTrans = { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const scanInit = { y: "0%" };
const scanAnim = { y: ["0%", "100%", "0%"] };
const scanTrans = { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const };

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <section id="top" className={cn("relative isolate overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32", className)}>
      {/* Ambient */}
      <div className="absolute inset-0 -z-10 bg-radial-glow" />
      <div className="absolute inset-0 -z-10 grid-bg" />
      <GradientBlobs className="-z-10" />

      {/* 3D scene, mounted absolute so it doesn't affect layout on small screens */}
      <div className="pointer-events-none absolute inset-0 -z-[5] flex items-center justify-center opacity-70">
        <Scene3D className="h-[520px] w-[520px] md:h-[720px] md:w-[720px]" />
      </div>

      <div className="container-page relative">
        <motion.div
          initial={headInit}
          animate={headAnim}
          transition={headTrans}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>{BRAND.descriptor}</span>
            <span className="mx-1 h-1 w-1 rounded-full bg-white/20" />
            <span className="text-accent2-400">SDG 12</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight">
            The circular economy,{" "}
            <span className="gradient-text">automated by AI.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-foreground/70">
            {BRAND.name} turns any photo of surplus food, electronics, furniture, clothes,
            books, or medical supplies into a routed pickup — matched to the right
            recipient, dispatched to a volunteer, and reported with a live impact score.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/user/signup">
              <MagneticButton className="btn-primary group inline-flex items-center gap-2">
                Start redistributing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </MagneticButton>
            </Link>
            <MagneticButton as="a" href="#automation" className="btn-ghost inline-flex items-center gap-2">
              See the automation
            </MagneticButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-foreground/60">
            <span className="chip"><Bot className="h-3.5 w-3.5 text-brand-400" /> Vision AI</span>
            <span className="chip"><ScanLine className="h-3.5 w-3.5 text-accent2-500" /> OCR</span>
            <span className="chip"><Sparkles className="h-3.5 w-3.5 text-brand-400" /> LLM autogen</span>
            <span className="chip"><Zap className="h-3.5 w-3.5 text-accent2-500" /> n8n workflows</span>
          </div>
        </motion.div>

        {/* Product mock */}
        <motion.div
          initial={mockInit}
          animate={mockAnim}
          transition={mockTrans}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="card-glass overflow-hidden shadow-2xl shadow-brand-500/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs text-foreground/60 font-mono">reloop.ai / new-listing</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-6 border-r border-white/5">
                <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-brand-500/25 via-blue-500/15 to-accent2-500/25 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-white/[0.04]" />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-40 w-40 rounded-full bg-brand-500/30 blur-3xl" />
                    <div className="relative flex flex-col items-center gap-2 text-center">
                      <div className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur">
                        <ScanLine className="h-8 w-8 text-brand-300" />
                      </div>
                      <div className="font-mono text-[11px] text-foreground/70">analyzing image…</div>
                    </div>
                  </div>
                  <motion.div
                    initial={scanInit}
                    animate={scanAnim}
                    transition={scanTrans}
                    className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-brand-400/40 to-transparent"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {CATEGORIES.slice(0, 5).map((c) => (
                    <span key={c.id} className="chip">
                      <span>{c.emoji}</span> {c.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-foreground/50">AI detection</div>
                  <div className="mt-1 font-display text-2xl">Cooked rice & lentils, ~4.2 kg</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-foreground/50">Category</div>
                    <div className="mt-1">Food • Cooked</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-foreground/50">Condition</div>
                    <div className="mt-1 text-accent2-400">Fresh</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-foreground/50">Expires</div>
                    <div className="mt-1 text-amber-300">in 5h 40m</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Best-match recipient</div>
                    <span className="chip">AI score 94</span>
                  </div>
                  <div className="mt-2 text-sm text-foreground/80">Annapurna Trust • 1.8 km • accepts cooked food</div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="btn-primary !py-2 !px-4">Dispatch pickup</button>
                    <span className="text-xs text-foreground/60">n8n → volunteer → route → receipt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-14 text-center text-xs uppercase tracking-[0.25em] text-foreground/45">
          Built for the circular economy • Aligned to UN SDG 12
        </div>
      </div>
    </section>
  );
};

export default Hero;
