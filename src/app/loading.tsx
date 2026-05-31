"use client";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0B0B0B] flex flex-col items-center justify-center z-[100]" style={{ fontFamily: "'Geist Mono', monospace" }} role="status" aria-label="Loading, initializing workspace">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative flex flex-col items-center">
        {/* Glowing Grid Loader */}
        <div className="grid grid-cols-2 gap-1 mb-8">
          <motion.div 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.95, 1, 0.95]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-4 h-4 bg-white/10 rounded-sm"
          />
          <motion.div 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.95, 1, 0.95]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="w-4 h-4 bg-accent rounded-sm shadow-[0_0_10px_rgba(0,255,136,0.3)]"
          />
          <motion.div 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.95, 1, 0.95]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="w-4 h-4 bg-white/5 rounded-sm"
          />
          <motion.div 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.95, 1, 0.95]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
            className="w-4 h-4 bg-white/20 rounded-sm"
          />
        </div>

        {/* Loading Text */}
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white mb-2">
          PIXEL.ART
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Initializing Workspace
          </span>
          <span className="flex gap-0.5">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="text-accent">.</motion.span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="text-accent">.</motion.span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="text-accent">.</motion.span>
          </span>
        </div>
      </div>
    </div>
  );
}
