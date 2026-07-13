import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

export default function LoginRegister() {
  const location = useLocation();
  const isSignUp = location.pathname === "/user/register";

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground">
      {/* Left — branded gradient panel */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-500 to-accent2-500" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-6rem] h-96 w-96 rounded-full bg-accent2-400/40 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col p-12">
          <Logo variant="full" className="h-9 w-auto text-white" />

          <div className="mt-auto max-w-md text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur">
              {isSignUp ? "Join the loop" : "Welcome back"}
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
              {isSignUp
                ? "Redistribute surplus. Automatically."
                : "Sign in to keep the loop running."}
            </h1>
            <p className="mt-3 text-white/80">{BRAND.tagline}</p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "318k", v: "meals" },
                { k: "221 t", v: "CO₂ saved" },
                { k: "186",   v: "partners" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                  <div className="font-display text-xl">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/70">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — auth form */}
      <ScrollArea className="w-full h-screen">
        <div className="flex min-h-svh flex-col gap-6 p-6 md:p-12">
          <div className="flex items-center justify-between">
            <Logo variant="full" className="h-8 w-auto" />
            <a href="/" className="text-xs text-foreground/60 hover:text-foreground">Back to site</a>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md card-glass p-6">
              <Outlet />
            </div>
          </div>

          <div className="text-center text-xs text-foreground/50">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
