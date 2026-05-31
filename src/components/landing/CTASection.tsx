"use client";
import Link from "next/link";
import { FadeInSection } from "../shared/FadeInSection";

export function CTASection() {
  return (
    <section className="section-padding bg-surface-sunken overflow-hidden">
      <div className="content-container relative">
        <FadeInSection direction="up">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[150px] -z-10" />
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Ready to elevate your <br /> pixel art workflow?
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl mx-auto">
              Join the community of creators building the future of 2D game design. 
              Start creating today — no setup required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/editor" className="btn-primary py-5 px-10 rounded-xl text-base w-full sm:w-auto shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                Get Started for Free
              </Link>
              <Link href="/auth/signin" className="btn-secondary py-5 px-10 rounded-xl text-base w-full sm:w-auto">
                Sign In to Your Library
              </Link>
            </div>
            
            <p className="mt-8 text-[10px] uppercase font-bold tracking-[0.2em] text-text-dim">
              Trusted by creators from around the world.
            </p>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
