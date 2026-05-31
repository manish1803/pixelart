'use client';
import { Redo2, Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';

interface TopNavigationProps {
  onUndo: () => void;
  onRedo: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onBackToDashboard: () => void;
  projectName: string;
  setProjectName: (name: string) => void;
  onOpenShortcuts: () => void;
  isLayeredMode?: boolean;
  onToggleLayeredMode?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  isOffline?: boolean;
}

export function TopNavigation({ 
  onUndo,
  onRedo,
  darkMode, 
  setDarkMode, 
  onBackToDashboard,
  projectName,
  setProjectName,
  onOpenShortcuts,
  isLayeredMode = false,
  onToggleLayeredMode,
  saveStatus,
  isOffline = false
}: TopNavigationProps) {
  const router = useRouter();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <nav className="h-16 border-b border-border bg-background flex items-center justify-between px-8 text-foreground transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onBackToDashboard}
          className="hover:opacity-70 transition-opacity"
          title="Back to Dashboard"
        >
          <Logo />
        </button>

        <div className="flex items-center w-full max-w-sm h-10 border border-border px-4 bg-panel/30 focus-within:bg-panel/50 transition-colors">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Untitled Project"
            className="w-full bg-transparent border-0 outline-none text-[11px] font-bold tracking-wider focus:ring-0 placeholder:opacity-30 text-foreground"
          />
          <div className="flex items-center gap-2 ml-2">
            {isOffline && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                (Offline)
              </span>
            )}
            {saveStatus && saveStatus !== 'idle' && (
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                saveStatus === 'saving' ? 'text-muted animate-pulse' :
                saveStatus === 'saved' ? 'text-accent' :
                'text-red-500'
              }`}>
                {saveStatus === 'saving' ? 'Saving...' :
                 saveStatus === 'saved' ? 'Saved' :
                 'Error'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          className="p-2 bg-panel border border-border hover:bg-accent/20 hover:text-accent hover:border-accent/30 transition-all shadow-sm"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          className="p-2 bg-panel border border-border hover:bg-accent/20 hover:text-accent hover:border-accent/30 transition-all shadow-sm"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-6 ml-12">
        {onToggleLayeredMode && (
          <button
            onClick={onToggleLayeredMode}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold tracking-widest text-muted hover:text-foreground transition-colors border border-border bg-panel/30"
          >
            {isLayeredMode ? 'Standard Mode' : 'Layered Mode'}
          </button>
        )}

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-12 h-6 border border-border flex items-center px-1 bg-panel"
          >
            <div 
              className={`w-4 h-4 transition-transform bg-foreground ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <button
          onClick={onOpenShortcuts}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold tracking-widest text-muted hover:text-foreground transition-colors border border-border bg-panel/30"
          title="Open Keyboard Shortcuts"
        >
          <span>Shortcuts</span>
          <kbd className="font-mono text-[9px] bg-panel border border-border px-1 rounded">{isMac ? '⌘/' : 'Ctrl+/'}</kbd>
        </button>

        <UserMenu 
          onSignIn={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/editor')}`)} 
        />
      </div>
    </nav>
  );
}
