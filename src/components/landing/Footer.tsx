"use client";
import Link from "next/link";
import { FadeInSection } from "../shared/FadeInSection";
import { Logo } from "../shared/Logo";

export function Footer() {
  return (
    <footer className="py-20 bg-background border-t border-white/5">
      <div className="content-container">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24 mb-16">
          {/* Div 1: Logo & Info */}
          <FadeInSection delay={0.1} direction="up" className="max-w-sm">
            <Link href="/" className="mb-6 block transition-transform hover:scale-105">
              <Logo />
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              The high-performance creative suite for modern pixel artists. 
              Built for precision, speed, and cloud-first collaboration.
            </p>
          </FadeInSection>
          
          {/* Div 2: Navigation Groups */}
          <div className="flex flex-wrap gap-12 md:gap-24">
            {/* Product Group */}
            <FadeInSection delay={0.2} direction="up" className="space-y-4 min-w-[100px]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/editor" className="text-xs text-text-muted hover:text-foreground transition-colors">Editor</Link></li>
                <li><Link href="/dashboard" className="text-xs text-text-muted hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="#features" className="text-xs text-text-muted hover:text-foreground transition-colors">Features</Link></li>
              </ul>
            </FadeInSection>
            
            {/* Company Group */}
            <FadeInSection delay={0.3} direction="up" className="space-y-4 min-w-[100px]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Company</h4>
              <ul className="space-y-3">
                <li><Link href="https://github.com/manish1803/pixel-art" className="text-xs text-text-muted hover:text-foreground transition-colors">GitHub</Link></li>
                <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Discord</Link></li>
                <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Twitter</Link></li>
              </ul>
            </FadeInSection>
            
            {/* Legal Group */}
            <FadeInSection delay={0.4} direction="up" className="space-y-4 min-w-[100px]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </FadeInSection>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <FadeInSection delay={0.5} direction="up" className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/[0.03]">
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest text-center md:text-left">
            © 2026 PIXEL.ART ENGINE. BUILT FOR THE NEON GENERATION.
          </p>
          <div className="flex gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/10" />
          </div>
        </FadeInSection>
      </div>
    </footer>
  );
}
