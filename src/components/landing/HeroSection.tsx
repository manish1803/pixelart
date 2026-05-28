"use client";
import {
  IconCloud,
  IconFocus2,
  IconStack2,
  IconPencil,
  IconEraser,
  IconPaint,
  IconColorPicker,
  IconArrowsMaximize,
  IconEye,
  IconLock,
  IconPlus,
  IconPalette
} from "@tabler/icons-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRef } from "react";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { GradientBridge } from "./GradientBridge";
import { GlassBrowserWrapper } from "./GlassBrowserWrapper";

export function HeroSection() {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax tilt effect for the video showcase on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [4, -2]);

  // Stagger variants for the text content
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  const floatingPanels = [
    {
      element: (
        <div className="flex flex-col items-center gap-4 p-2 bg-[#0B0B0C]/90 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl pointer-events-auto select-none">
          <div className="flex gap-0.5 justify-center w-6 opacity-30">
            <span className="w-1 h-1 rounded-full bg-white" />
            <span className="w-1 h-1 rounded-full bg-white" />
            <span className="w-1 h-1 rounded-full bg-white" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-[0_0_12px_rgba(0,255,65,0.25)]">
              <IconPencil className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent flex items-center justify-center text-white/50 transition-colors">
              <IconEraser className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent flex items-center justify-center text-white/50 transition-colors">
              <IconPaint className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent flex items-center justify-center text-white/50 transition-colors">
              <IconColorPicker className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent flex items-center justify-center text-white/50 transition-colors">
              <IconArrowsMaximize className="w-4 h-4" />
            </div>
          </div>
        </div>
      ),
      position: "top-[15%] -left-12 md:-left-20 lg:-left-28",
      delay: 1.0,
    },
    {
      element: (
        <div className="p-3 bg-[#0B0B0C]/90 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl text-left w-36 pointer-events-auto select-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50 font-mono">Swatches</span>
            <IconPalette className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <div className="w-6 h-6 rounded bg-[#00FF41] border border-white/40 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,65,0.4)]">
              <div className="w-1.5 h-1.5 rounded-full bg-black/80" />
            </div>
            <div className="w-6 h-6 rounded bg-[#00F0FF] border border-white/10" />
            <div className="w-6 h-6 rounded bg-[#FF007F] border border-white/10" />
            <div className="w-6 h-6 rounded bg-[#9D00FF] border border-white/10" />
            <div className="w-6 h-6 rounded bg-[#FFD700] border border-white/10" />
            <div className="w-6 h-6 rounded bg-[#FF5722] border border-white/10" />
            <div className="w-6 h-6 rounded bg-white border border-white/10" />
            <div className="w-6 h-6 rounded bg-[#1A1A1A] border border-white/10" />
          </div>
        </div>
      ),
      position: "top-[25%] -right-12 md:-right-20 lg:-right-28",
      delay: 1.2,
    },
    {
      element: (
        <div className="p-3 bg-[#0B0B0C]/90 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl text-left w-40 pointer-events-auto select-none">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50 font-mono">Layers</span>
            <IconPlus className="w-3.5 h-3.5 text-white/60 hover:text-white" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between p-1.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/25">
              <span className="text-[9px] font-bold text-[#00FF41]">Layer 2 (Outline)</span>
              <div className="flex items-center gap-1.5">
                <IconEye className="w-3.5 h-3.5 text-[#00FF41]" />
                <IconLock className="w-3.5 h-3.5 text-white/20" />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 border border-transparent transition-colors">
              <span className="text-[9px] font-medium text-white/60">Layer 1 (Base)</span>
              <div className="flex items-center gap-1.5">
                <IconEye className="w-3.5 h-3.5 text-white/50" />
                <IconLock className="w-3.5 h-3.5 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      ),
      position: "bottom-[25%] -left-16 md:-left-24 lg:-left-32",
      delay: 1.4,
    },
    {
      element: (
        <div className="p-3 bg-[#0B0B0C]/90 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl text-left w-44 pointer-events-auto select-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50 font-mono">Timeline</span>
            <span className="text-[8px] font-bold text-[#00FF41] font-mono">24 FPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-[#00FF41]/20 border border-[#00FF41]/40 rounded flex items-center justify-center text-[9px] font-black text-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]">F1</div>
            <div className="w-7 h-7 bg-white/5 border border-white/5 rounded flex items-center justify-center text-[9px] font-bold text-white/40">F2</div>
            <div className="w-7 h-7 bg-white/5 border border-white/5 rounded flex items-center justify-center text-[9px] font-bold text-white/40">F3</div>
            <div className="w-7 h-7 bg-white/5 border border-white/5 rounded flex items-center justify-center text-[9px] font-bold text-white/40">F4</div>
            <div className="w-7 h-7 rounded hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/50 transition-colors">
              <IconPlus className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ),
      position: "bottom-[15%] -right-16 md:-right-24 lg:-right-32",
      delay: 1.6,
    }
  ];

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Cinematic Background Atmosphere */}
      <HeroAtmosphere />

      <div className="content-container text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent font-mono">Real-Time Collaborative Engine Live</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
          >
            Professional <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#00f0ff] to-accent bg-[length:200%_auto] animate-gradient drop-shadow-[0_0_20px_rgba(0,255,65,0.25)]">Pixel Art</span>.<br />
            <span className="text-text-muted">Directly in your browser.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted mb-12 leading-relaxed"
          >
            Experience the power of a dedicated desktop suite in a web environment.
            Built with precision, performance, and the professional artist in mind.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <Link
              href={session ? "/dashboard" : "/editor"}
              className="btn-primary py-4 px-8 rounded-lg text-base w-full sm:w-auto hover:shadow-[0_0_30px_rgba(0,255,65,0.35)] hover:border-accent hover:bg-accent hover:text-black transition-all duration-300"
            >
              {session ? "Continue to Dashboard" : "Launch Editor"}
            </Link>
            {!session && (
              <Link href="/dashboard" className="btn-secondary py-4 px-8 rounded-lg text-base w-full sm:w-auto hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md">
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Cinematic Gradient Bridge connecting content and browser showcase */}
        <GradientBridge />

        {/* Browser-like Video Showcase with Entrance and Scroll Scaling */}
        <motion.div
          style={{
            rotateX
          }}
          className="relative mx-auto max-w-6xl perspective-[1200px] z-10"
        >
          {/* Floating Workspace Panels */}
          {floatingPanels.map((panel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: [0, -10, 0] // Gentle floating animation
              }}
              transition={{
                opacity: { duration: 1.0, ease: "easeOut", delay: panel.delay },
                y: {
                  duration: 4 + i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className={`absolute ${panel.position} z-30 hidden lg:block pointer-events-none`}
            >
              {panel.element}
            </motion.div>
          ))}

          {/* Glassmorphic Browser Wrapper with Reflection Streak, Noise, and Glows */}
          <GlassBrowserWrapper>
            {/* Browser Header / Chrome */}
            <div className="h-10 border-b border-white/5 bg-panel flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex items-center gap-2 border border-white/5 bg-black/40 px-3 py-1 rounded">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">pixel.art/showcase</span>
              </div>
              <div className="w-12" />
            </div>

            {/* The Video Container */}
            <div className="aspect-video bg-black relative">
              <video
                src="/Showcase.mov"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </GlassBrowserWrapper>

          {/* Floating Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.8 }}
            className="absolute -top-4 -right-4 px-3 py-1 bg-accent text-black text-[9px] font-black uppercase tracking-widest rounded shadow-xl z-20"
          >
            Live Preview
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
