import React from "react";
import { motion } from "framer-motion";

type Props = { items: React.ReactNode[]; duration?: number; reverse?: boolean; className?: string };

const Marquee: React.FC<Props> = ({ items, duration = 30, reverse = false, className = "" }) => {
  const seq = [...items, ...items];
  const animate = { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] };
  const transition = { duration, repeat: Infinity, ease: "linear" as const };
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <motion.div className="flex min-w-max gap-10" animate={animate} transition={transition}>
        {seq.map((it, i) => (
          <div key={i} className="shrink-0">{it}</div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
