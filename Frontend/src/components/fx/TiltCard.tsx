import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionStyle } from "framer-motion";

type Props = React.HTMLAttributes<HTMLDivElement> & { intensity?: number };

const TiltCard: React.FC<Props> = ({ children, className = "", intensity = 10, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-0.5, 0.5], [intensity, -intensity]);
  const ry = useTransform(mx, [-0.5, 0.5], [-intensity, intensity]);
  const sx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sy = useSpring(ry, { stiffness: 220, damping: 18 });
  const bgX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const bgY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const cardStyle: MotionStyle = { rotateX: sx, rotateY: sy, transformStyle: "preserve-3d", transformPerspective: 900 };
  const sheenStyle: MotionStyle = {
    background: "radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.14), transparent 60%)",
    ['--x' as any]: bgX,
    ['--y' as any]: bgY,
  };

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={cardStyle}
      className={`relative ${className}`}
      {...(rest as any)}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 mix-blend-overlay"
        style={sheenStyle}
      />
    </motion.div>
  );
};

export default TiltCard;
