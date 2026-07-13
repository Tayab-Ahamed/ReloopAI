import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        // ReLoop AI brand palette
        brand: {
          50: "#F3F1FF",
          100: "#E7E3FF",
          200: "#CFC6FF",
          300: "#B4A6FF",
          400: "#9683FF",
          500: "#7C5CFF",   // primary violet
          600: "#5F3EE8",
          700: "#4A2FB8",
          800: "#3A2590",
          900: "#241760",
          950: "#140A3A",
        },
        accent2: {
          400: "#5EE7C7",
          500: "#22D3B1",
          600: "#0EB597",
        },
        ink: {
          950: "#08080F",
          900: "#0B0B14",
          850: "#111121",
          800: "#171728",
          700: "#20213A",
          600: "#2A2C4B",
          500: "#3A3D66",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C5CFF 0%, #4F7CFF 55%, #22D3B1 100%)",
        "brand-soft": "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(34,211,177,0.12))",
        "grid": "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(80% 60% at 50% 0%, rgba(124,92,255,0.35), transparent 60%)",
      },
      backgroundSize: {
        "grid": "48px 48px",
      },
      boxShadow: {
        "glow": "0 0 0 1px rgba(124,92,255,0.35), 0 20px 60px -20px rgba(124,92,255,0.55)",
        "card": "0 1px 2px rgba(0,0,0,0.25), 0 8px 24px -12px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shine": {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shine": "shine 3s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(.4,0,.6,1) infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
