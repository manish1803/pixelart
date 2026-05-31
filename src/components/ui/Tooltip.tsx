'use client';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, shortcut, children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 px-2 py-1 bg-background border border-border rounded shadow-xl text-[10px] font-bold text-foreground whitespace-nowrap flex items-center gap-1.5 pointer-events-none"
          >
            {content}
            {shortcut && (
              <kbd className="font-mono text-[9px] bg-panel border border-border px-1 rounded text-muted">{shortcut}</kbd>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-background" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
