import React from "react";
import { motion } from "framer-motion";

const blob1Style: React.CSSProperties = {
  background: "radial-gradient(closest-side, rgba(124,92,255,0.55), transparent 70%)",
  filter: "blur(60px)",
};
const blob1Anim = { x: [0, 60, -20, 0], y: [0, 30, -30, 0], scale: [1, 1.1, 0.95, 1] };
const blob1Trans = { duration: 22, repeat: Infinity, ease: "easeInOut" as const };

const blob2Style: React.CSSProperties = {
  background: "radial-gradient(closest-side, rgba(34,211,177,0.5), transparent 70%)",
  filter: "blur(60px)",
};
const blob2Anim = { x: [0, -50, 30, 0], y: [0, -40, 20, 0], scale: [1, 1.05, 1.08, 1] };
const blob2Trans = { duration: 26, repeat: Infinity, ease: "easeInOut" as const };

const blob3Style: React.CSSProperties = {
  background: "radial-gradient(closest-side, rgba(79,124,255,0.5), transparent 70%)",
  filter: "blur(60px)",
};
const blob3Anim = { x: [0, 40, -30, 0], y: [0, 20, 40, 0], scale: [1, 1.12, 0.98, 1] };
const blob3Trans = { duration: 30, repeat: Infinity, ease: "easeInOut" as const };

const GradientBlobs: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <motion.div
      className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-60"
      style={blob1Style}
      animate={blob1Anim}
      transition={blob1Trans}
    />
    <motion.div
      className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-50"
      style={blob2Style}
      animate={blob2Anim}
      transition={blob2Trans}
    />
    <motion.div
      className="absolute bottom-[-8rem] left-1/3 h-[440px] w-[440px] rounded-full opacity-40"
      style={blob3Style}
      animate={blob3Anim}
      transition={blob3Trans}
    />
  </div>
);

export default GradientBlobs;
