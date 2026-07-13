import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const style = { scaleX };
  return (
    <motion.div
      aria-hidden
      style={style}
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-gradient-to-r from-brand-500 via-blue-500 to-accent2-500"
    />
  );
};

export default ScrollProgress;
