import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Cpu, 
  Eye, 
  GitBranch, 
  Play, 
  FileCheck, 
  Clock, 
  Leaf, 
  Utensils, 
  TrendingUp, 
  Award,
  ChevronRight
} from 'lucide-react';

export const DetailedSections: React.FC = () => {
  return (
    <div className="space-y-32 py-16">
      {/* 1. AI Section */}
      <section id="ai" className="relative scroll-mt-24 container-page">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-transparent blur-3xl -z-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="chip bg-brand-500/10 text-brand-400 border-brand-500/20">
              <Brain className="h-3.5 w-3.5" /> Next-Gen Vision AI
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Instant analysis. <br />
              <span className="gradient-text">Zero manual data entry.</span>
            </h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">
              Upload any photo of your surplus goods. ReLoop AI runs our vision pipelines to extract text labels, read expiration dates using OCR, classify the resource into one of 7 circular streams, and pre-fill details instantly.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-brand-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Multi-modal Vision Models</h4>
                  <p className="text-sm text-foreground/60 mt-1">Identifies item composition, quantity, and grade from raw pixels.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-accent2-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Deep Text Parsing (OCR)</h4>
                  <p className="text-sm text-foreground/60 mt-1">Reads expiry tags, manufacturing codes, and nutritional metrics automatically.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-6 border-white/10 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="font-mono text-xs text-foreground/50">VISION_PIPELINE_OUTPUT</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-[10px] uppercase text-foreground/40">Detected Object</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">Surplus Office Chairs</div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30">Furniture</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] uppercase text-foreground/40">Condition Estimate</div>
                  <div className="text-sm font-semibold text-accent2-400 mt-0.5">Good (92% Score)</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] uppercase text-foreground/40">Weight / Qty</div>
                  <div className="text-sm font-semibold text-amber-300 mt-0.5">5 Units (~85 kg)</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[10px] uppercase text-foreground/40">Matching Recommendation</div>
                <div className="text-xs text-foreground/70 mt-1">
                  Matched with <span className="font-semibold text-foreground">Mumbai Shelter Network</span> (1.4 km) based on active furniture demand.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Automation Section */}
      <section id="automation" className="relative scroll-mt-24 container-page">
        <div className="absolute inset-0 bg-gradient-to-br from-accent2-500/5 to-transparent blur-3xl -z-10" />
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="chip bg-accent2-500/10 text-accent2-400 border-accent2-500/20">
            <GitBranch className="h-3.5 w-3.5" /> n8n Orchestration
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold">
            Autonomous workflows. <br />
            <span className="gradient-text">Zero administration.</span>
          </h2>
          <p className="mt-4 text-foreground/70">
            Three core n8n pipelines manage the entire lifecycle of a listing. They match NGOs, dispatch routes, escalate critical items, and generate carbon impact receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glass p-6 border-white/10 hover:border-brand-500/30 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/25 border border-brand-500/30 text-brand-300 mb-6">
              <Play className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">wf-01: Lifecycle</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Triggered instantly when a new listing is created. Maps geographical locations, verifies recipient matches, alerts local NGOs, and dispatches the task to available volunteers.
            </p>
          </div>

          <div className="card-glass p-6 border-white/10 hover:border-accent2-500/30 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent2-500/25 border border-accent2-500/30 text-accent2-400 mb-6">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">wf-02: Expiry Escalation</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Cron job that checks for perishable food listings under 6 hours from expiry. Escalates notification urgency, expands NGO match radius, and triggers high-priority volunteer calls.
            </p>
          </div>

          <div className="card-glass p-6 border-white/10 hover:border-brand-500/30 transition duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/25 border border-brand-500/30 text-brand-300 mb-6">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">wf-03: Impact Receipt</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Triggered upon pickup completion. Orchestrates the AI environmental report, renders a PDF receipt certificate, and emails the official ledger documentation to the donor.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Impact Section */}
      <section id="impact" className="relative scroll-mt-24 container-page">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-transparent blur-3xl -z-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-glass p-6 border-white/10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 mx-auto mb-4">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">2.5 kg to 12 kg</div>
                <p className="text-xs text-foreground/60 mt-1">CO₂ saved per kg offset</p>
              </div>
              <div className="card-glass p-6 border-white/10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent2-500/10 text-accent2-400 mx-auto mb-4">
                  <Utensils className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">1 kg = 2.4</div>
                <p className="text-xs text-foreground/60 mt-1">Nutritious meals converted</p>
              </div>
              <div className="card-glass p-6 border-white/10 text-center sm:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 mx-auto mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">100% Certified Ledger</div>
                <p className="text-xs text-foreground/60 mt-1">Auditable environmental impact certificates issued dynamically.</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="chip bg-brand-500/10 text-brand-400 border-brand-500/20">
              <TrendingUp className="h-3.5 w-3.5" /> Environmental Math
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Turn surplus into <br />
              <span className="gradient-text">verified impact data.</span>
            </h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">
              Every item redistributed is run through category-specific environmental carbon formulas. You get immediate, auditable proof of CO₂ reduction, landfill prevention, and community support in real-time.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Electronics redirection saves up to 1.6x more metal waste.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Food redirection directly fights local food insecurity.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
