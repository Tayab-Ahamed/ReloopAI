import React from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  variant?: string;
}

const Logo: React.FC<LogoProps> = ({ className, showWordmark = true, size = 32 }) => {
  const boxStyle: React.CSSProperties = { width: size, height: size };
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="inline-flex items-center justify-center rounded-xl bg-ink-900 ring-1 ring-white/10"
        style={boxStyle}
        aria-hidden
      >
        <svg viewBox="0 0 64 64" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} fill="none">
          <defs>
            <linearGradient id="reloop-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C5CFF" />
              <stop offset="0.55" stopColor="#4F7CFF" />
              <stop offset="1" stopColor="#22D3B1" />
            </linearGradient>
          </defs>
          <path d="M20 32a12 12 0 0 1 20-8.8" stroke="url(#reloop-g)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M44 32a12 12 0 0 1-20 8.8" stroke="url(#reloop-g)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M39 20l3 3-3 3" stroke="url(#reloop-g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M25 44l-3-3 3-3" stroke="url(#reloop-g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="32" cy="32" r="3.2" fill="url(#reloop-g)" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
          {BRAND.short}
          <span className="ml-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wider text-foreground/80 align-middle">
            AI
          </span>
        </span>
      )}
    </div>
  );
};

export default Logo;
