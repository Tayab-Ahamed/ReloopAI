import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import Logo from "@/components/brand/Logo";

interface NavbarProps { className?: string; }

const NAV_LINKS = [
  { to: "/#product",    label: "Product" },
  { to: "/#ai",         label: "AI" },
  { to: "/#automation", label: "Automation" },
  { to: "/#impact",     label: "Impact" },
  { to: "/#faq",        label: "FAQ" },
];

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { user, isLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-colors",
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-white/5"
          : "bg-transparent",
        className
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <ul className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <a href={l.to} className="hover:text-foreground transition-colors">{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {!isLogin ? (
            <>
              <Link to="/user/login">
                <button className="btn-ghost">Sign in</button>
              </Link>
              <Link to="/user/signup">
                <button className="btn-primary">
                  <Sparkles className="h-4 w-4" /> Get started
                </button>
              </Link>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate(`/user/${user?.role || "Donor"}`)}>
              Open dashboard
            </button>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-foreground"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 bg-ink-900 border-l border-white/5">
              <div className="mb-6"><Logo /></div>
              <ul className="flex flex-col gap-4 text-base text-foreground/80">
                {NAV_LINKS.map((l) => (
                  <li key={l.to}>
                    <a href={l.to} onClick={() => setIsOpen(false)} className="hover:text-foreground">{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                {!isLogin ? (
                  <>
                    <Link to="/user/login" onClick={() => setIsOpen(false)}><button className="btn-ghost w-full">Sign in</button></Link>
                    <Link to="/user/signup" onClick={() => setIsOpen(false)}><button className="btn-primary w-full">Get started</button></Link>
                  </>
                ) : (
                  <button className="btn-primary w-full" onClick={() => { setIsOpen(false); navigate(`/user/${user?.role || "Donor"}`); }}>
                    Open dashboard
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
