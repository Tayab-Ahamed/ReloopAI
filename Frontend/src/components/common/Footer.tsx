// Public site footer — ReLoop AI branded, no team names, no repo links.
import React from "react";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/5 bg-ink-900 text-foreground">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo variant="full" className="h-8 w-auto" />
            <p className="mt-4 max-w-sm text-sm text-foreground/60">{BRAND.tagline}</p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-foreground/70 hover:text-white hover:border-brand-500/40"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-foreground/70 hover:text-white hover:border-brand-500/40"><Linkedin className="h-4 w-4" /></a>
              <a href="#" aria-label="GitHub"  className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-foreground/70 hover:text-white hover:border-brand-500/40"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="Email"   className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-foreground/70 hover:text-white hover:border-brand-500/40"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-foreground/50">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li><a href="#product"    className="hover:text-white">Categories</a></li>
              <li><a href="#ai"         className="hover:text-white">AI features</a></li>
              <li><a href="#automation" className="hover:text-white">Automation</a></li>
              <li><a href="#impact"     className="hover:text-white">Impact</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-foreground/50">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li><a href="#faq"     className="hover:text-white">FAQ</a></li>
              <li><a href="/user/login" className="hover:text-white">Sign in</a></li>
              <li><a href="/user/register" className="hover:text-white">Get started</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-foreground/50">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div>Built for a circular economy • SDG 12</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
