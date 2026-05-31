"use client";
import { motion } from "framer-motion";

interface GradientBridgeProps {
  glowColor?: string;
  intensity?: number;
}

export function GradientBridge({
  glowColor = "rgba(0, 255, 65, 0.2)",
  intensity = 1
}: GradientBridgeProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-5xl h-[250px] -top-[120px] pointer-events-none z-0 overflow-visible">
      {/* 1. Vertical Glow Bridge (Fades from transparent down to showcase) */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/6 to-accent/15 blur-2xl"
        style={{ opacity: intensity }}
      />

      {/* 2. Core Glow Flare hotspot behind the top of the showcase */}
      <motion.div
        animate={{
          opacity: [0.6 * intensity, 0.95 * intensity, 0.6 * intensity],
          scale: [0.96, 1.04, 0.96]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[120px] rounded-full blur-[45px] pointer-events-none mix-blend-plus-lighter"
        style={{ 
          background: `radial-gradient(circle at center, ${glowColor} 0%, rgba(0, 240, 255, 0.14) 40%, transparent 75%)`
        }}
      />
    </div>
  );
}
