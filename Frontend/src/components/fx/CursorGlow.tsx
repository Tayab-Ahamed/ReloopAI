import React, { useEffect, useRef } from "react";

const GLOW_STYLE: React.CSSProperties = {
  background:
    "radial-gradient(closest-side, rgba(124,92,255,0.55), rgba(34,211,177,0.18) 45%, transparent 70%)",
  filter: "blur(32px)",
  willChange: "transform",
};

const CursorGlow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[600px] w-[600px] rounded-full opacity-40 mix-blend-screen"
      style={GLOW_STYLE}
    />
  );
};

export default CursorGlow;
