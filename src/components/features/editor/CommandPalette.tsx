'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Command as CommandIcon, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Command {
  id: string;
  title: string;
  category: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

function fuzzySearch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let i = 0;
  let j = 0;
  while (i < q.length && j < t.length) {
    if (q[i] === t[j]) {
      i++;
    }
    j++;
  }
  return i === q.length;
}

function replaceMod(key: string): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  if (isMac) return key.replace('Cmd', '⌘').replace('Shift', '⇧');
  return key.replace('Cmd', 'Ctrl').replace('Shift', 'Shift');
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const filteredCommands = commands.filter(cmd =>
    fuzzySearch(search, cmd.title) ||
    fuzzySearch(search, cmd.category)
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

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
          <div className="flex min-h-full items-start justify-center p-4 sm:p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-xl overflow-hidden border border-border bg-background shadow-2xl rounded-xl"
            >
              <div className="flex items-center border-b border-border p-4">
                <Search className="w-5 h-5 text-muted mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="flex-1 bg-transparent border-none text-foreground placeholder-muted focus:outline-none text-sm"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted bg-panel border border-border rounded">
                  <CommandIcon className="w-3 h-3" /> K
                </kbd>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8 text-muted text-sm">
                    No commands found for "{search}"
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      filteredCommands.reduce((acc, cmd) => {
                        if (!acc[cmd.category]) acc[cmd.category] = [];
                        acc[cmd.category].push(cmd);
                        return acc;
                      }, {} as { [key: string]: Command[] })
                    ).map(([category, cmds]) => (
                      <div key={category} className="space-y-1">
                        <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted bg-background/80 sticky top-0 z-10 backdrop-blur-sm border-b border-border/50 mb-1">
                          {category}
                        </div>
                        {cmds.map((cmd) => {
                          const index = filteredCommands.indexOf(cmd);
                          return (
                            <button
                              ref={index === selectedIndex ? itemRef : null}
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                onClose();
                              }}
                              className={`w-full flex items-center justify-between p-2 text-left rounded-lg transition-colors ${
                                index === selectedIndex
                                  ? 'bg-accent text-black'
                                  : 'text-foreground hover:bg-panel/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 flex items-center justify-center rounded-md ${
                                  index === selectedIndex ? 'bg-black/10' : 'bg-panel border border-border'
                                }`}>
                                  {cmd.icon || <CommandIcon className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className="text-xs font-medium">{cmd.title}</div>
                                  <div className={`text-[10px] ${
                                    index === selectedIndex ? 'text-black/60' : 'text-muted'
                                  }`}>
                                    {cmd.category}
                                  </div>
                                </div>
                              </div>
                              {cmd.shortcut && (
                                <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  index === selectedIndex
                                    ? 'border-black/20 text-black/60'
                                    : 'border-border text-muted'
                                }`}>
                                  {replaceMod(cmd.shortcut)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
