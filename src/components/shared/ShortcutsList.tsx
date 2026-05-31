'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ShortcutsListProps {}

export function ShortcutsList({}: ShortcutsListProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <div className="border border-border p-4">
      <Collapsible open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">SHORTCUTS</div>
          <ChevronRight className={`w-3 h-3 transition-transform opacity-40 text-foreground ${shortcutsOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-3">
          {[
            { label: 'Fill Tool', keys: ['F'] },
            { label: 'Erase Tool', keys: ['E'] },
            { label: 'Increase Brush Size', keys: ['.'] },
            { label: 'Decrease Brush Size', keys: [','] },
            { label: 'Undo', keys: ['⌘', 'Z'] },
            { label: 'Redo', keys: ['⌘', 'Shift', 'Z'] },
            { label: 'Save', keys: ['⌘', 'S'] },
            { label: 'Pick Color', keys: ['I'] },
            { label: 'Clear Canvas', keys: ['⌘', 'X'] }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-bold tracking-wider text-muted">
              <span className="font-mono text-[11px]">{item.label}</span>
              <div className="flex gap-1">
                {item.keys.map(k => (
                  <kbd key={k} className="px-1.5 py-0.5 rounded flex items-center justify-center font-mono font-normal bg-panel text-foreground min-w-[20px] border border-border shadow-sm">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
