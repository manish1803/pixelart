"use client";
import { motion } from "framer-motion";

interface HeroAtmosphereProps {
  glowIntensity?: number; // 0 to 1
  blurStrength?: number; // in pixels
}

export function HeroAtmosphere({
  glowIntensity = 1,
  blurStrength = 120
}: HeroAtmosphereProps) {
  // Configurable styles based on intensity
  const opacityMultiplier = glowIntensity;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Background Base Pixel Grid */}
      <div 
        className="absolute inset-0 bg-pixel-grid pointer-events-none"
        style={{ opacity: 0.75 * opacityMultiplier }}
      />

      {/* 2. Large Centralized Atmospheric Spotlight (GPU accelerated) */}
      <div 
        className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"
      >
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: [0.85 * opacityMultiplier, 0.98 * opacityMultiplier, 0.85 * opacityMultiplier]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-[1050px] h-[1050px] rounded-full blur-[110px] mix-blend-screen pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0, 255, 65, 0.28) 0%, rgba(0, 240, 255, 0.18) 45%, rgba(139, 92, 246, 0.08) 70%, transparent 85%)"
          }}
        />
      </div>

      {/* 3. High-Fidelity Cinematic Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 4. Subtle Radial Mask for Spotlight Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)] opacity-55" />
    </div>
  );
}
