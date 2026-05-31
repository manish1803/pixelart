"use client";
import { motion } from "framer-motion";
import React from "react";

interface GlassBrowserWrapperProps {
  children: React.ReactNode;
}

export function GlassBrowserWrapper({ children }: GlassBrowserWrapperProps) {
  return (
    <div className="relative w-full overflow-visible">
      {/* 1. Animated GPU-accelerated Ambient Background Glow (Materializes first) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeOut",
          delay: 0.5 
        }}
        className="absolute -inset-x-24 -inset-y-28 bg-gradient-to-b from-[#00f0ff]/35 via-accent/25 to-transparent rounded-3xl blur-[90px] z-0 pointer-events-none mix-blend-screen"
      />

      {/* 2. Glass Container (Animates in weightless silhouette with actual size and opacity) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeOut",
          delay: 0.5 
        }}
        className="relative w-full rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_25px_60px_rgba(0,0,0,0.85)] z-10"
      >
        {/* 3. Diagonal Glass Reflection Sheen (Fades in slowly after silhouette) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }}
          className="absolute top-0 left-0 w-full h-[60%] pointer-events-none select-none -z-10"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 60%)"
          }}
        />

        {/* Custom Glass Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none select-none -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='glassNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23glassNoise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Horizontal Reflection line at the top border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* 4. Breathing Border Overlay (Activates subtly after content settles) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.45, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8
          }}
          className="absolute inset-0 rounded-xl border border-accent pointer-events-none z-20"
        />

        {/* 5. Content reveal (delayed opacity fade-in) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.7 }}
          className="w-full h-full flex flex-col"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
