'use client';
import { SHORTCUTS, ShortcutDefinition } from '@/lib/constants/shortcuts';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShortcutsReferenceProps {
  isOpen: boolean;
  onClose: () => void;
  isMac?: boolean;
}

export function ShortcutsReference({ isOpen, onClose, isMac = true }: ShortcutsReferenceProps) {
  const [isMacState, setIsMacState] = useState(isMac);

  useEffect(() => {
    setIsMacState(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const replaceMod = (key: string) => {
    if (isMacState) return key.replace('Cmd', '⌘').replace('Shift', '⇧');
    return key.replace('Cmd', 'Ctrl').replace('Shift', 'Shift');
  };

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as { [key: string]: ShortcutDefinition[] });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-2xl overflow-hidden border border-border bg-background shadow-2xl rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Keyboard Shortcuts</h2>
                  <p className="text-xs text-muted mt-1">Master the editor with these shortcuts.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-panel rounded-full transition-colors text-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted border-b border-border/50 pb-1">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut) => (
                        <div key={shortcut.id} className="flex items-center justify-between text-xs">
                          <span className="text-foreground/80">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.key.split('+').map((k, i) => (
                              <kbd
                                key={i}
                                className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-panel border border-border rounded shadow-sm text-foreground"
                              >
                                {replaceMod(k.trim())}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border text-[10px] text-muted text-center">
                Press <kbd className="px-1 py-0.5 bg-panel border border-border rounded">{isMacState ? '⌘/' : 'Ctrl+/'}</kbd> to close this panel.
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
