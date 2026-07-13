import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionStyle } from "framer-motion";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  strength?: number;
  as?: "button" | "a";
  href?: string;
};

const MagneticButton: React.FC<Props> = ({ children, className = "", strength = 18, as = "button", href, ...rest }) => {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });
  const rx = useTransform(sy, [-strength, strength], [8, -8]);
  const ry = useTransform(sx, [-strength, strength], [-8, 8]);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * (strength * 2));
    y.set(((e.clientY - r.top) / r.height - 0.5) * (strength * 2));
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const style: MotionStyle = { x: sx, y: sy, rotateX: rx, rotateY: ry, transformPerspective: 600 };

  if (as === "a") {
    return (
      <motion.a ref={ref as any} href={href} style={style} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref as any} style={style} onMouseMove={onMove} onMouseLeave={onLeave} className={className} {...(rest as any)}>
      {children}
    </motion.button>
  );
};

export default MagneticButton;
