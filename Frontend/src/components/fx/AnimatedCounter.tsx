import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

type Props = { value: number; suffix?: string; prefix?: string; duration?: number; className?: string };

const AnimatedCounter: React.FC<Props> = ({ value, suffix = "", prefix = "", duration = 1.6, className = "" }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  const decimals = value % 1 === 0 ? 0 : 1;
  const fmt = decimals === 0 ? Math.round(display).toLocaleString() : display.toFixed(decimals);
  return <span ref={ref} className={className}>{prefix}{fmt}{suffix}</span>;
};

export default AnimatedCounter;
