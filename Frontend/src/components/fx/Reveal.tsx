import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = React.PropsWithChildren<{
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "span";
}>;

const Reveal: React.FC<Props> = ({ children, delay = 0, y = 24, className = "", as = "div" }) => {
  const reduce = useReducedMotion();
  const Tag: any = (motion as any)[as] || motion.div;
  const initial = reduce ? undefined : { opacity: 0, y };
  const whileInView = reduce ? undefined : { opacity: 1, y: 0 };
  const viewport = { once: true, amount: 0.2 };
  const transition = { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  return (
    <Tag className={className} initial={initial} whileInView={whileInView} viewport={viewport} transition={transition}>
      {children}
    </Tag>
  );
};

export default Reveal;
