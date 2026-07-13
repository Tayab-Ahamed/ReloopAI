import React from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/brand";
import { Recycle } from "lucide-react";
import TiltCard from "@/components/fx/TiltCard";
import Reveal from "@/components/fx/Reveal";

const cardInitial = { opacity: 0, y: 16 };
const cardWhileInView = { opacity: 1, y: 0 };
const cardViewport = { once: true, margin: "-60px" };

export const FeatureSection: React.FC = () => {
  return (
    <section id="product" className="relative py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip"><Recycle className="h-3.5 w-3.5 text-accent2-500" /> Any surplus, one workflow</span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold">
            Seven resource streams. <span className="gradient-text">One AI pipeline.</span>
          </h2>
          <p className="mt-4 text-foreground/70">
            ReLoop AI unifies redistribution across every category of surplus, not just food.
            Upload a photo — our models identify, price, and route it in seconds.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => {
            const cardTransition = { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
            return (
              <motion.div
                key={c.id}
                initial={cardInitial}
                whileInView={cardWhileInView}
                transition={cardTransition}
                viewport={cardViewport}
              >
                <TiltCard className="card-glass p-5 hover:shadow-glow transition-shadow duration-300 h-full" intensity={8}>
                  <div className="text-3xl">{c.emoji}</div>
                  <div className="mt-3 font-display text-lg font-semibold">{c.label}</div>
                  <p className="mt-1 text-sm text-foreground/65">{c.blurb}</p>
                </TiltCard>
              </motion.div>
            );
          })}
          <TiltCard className="card-glass p-5 bg-brand-gradient/10 border-brand-500/20" intensity={8}>
            <div className="text-3xl">✨</div>
            <div className="mt-3 font-display text-lg font-semibold">Anything else?</div>
            <p className="mt-1 text-sm text-foreground/70">
              The LLM classifier learns new categories from your workspace — no engineering needed.
            </p>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
