'use client';
import { Grid, Shield, Trash2, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function SettingsView({ darkMode, setDarkMode }: SettingsViewProps) {
  const { data: session } = useSession();
  const [defaultGridSize, setDefaultGridSize] = useState(32);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5); // minutes
  const [showGridDefault, setShowGridDefault] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-xs text-muted">Manage your account and app preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-panel/30 border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-panel border border-border rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Account</h2>
              <p className="text-[10px] text-muted">Your profile information</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Name</span>
              <span className="text-xs text-foreground font-medium">{session?.user?.name || 'Guest User'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Email</span>
              <span className="text-xs text-foreground font-medium">{session?.user?.email || 'Not signed in'}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-panel/30 border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-panel border border-border rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">App Preferences</h2>
              <p className="text-[10px] text-muted">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground">Theme</span>
                <p className="text-[10px] text-muted">Switch between dark and light mode</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-12 h-6 border border-border flex items-center px-1 bg-panel rounded-full"
              >
                <div
                  className="w-4 h-4 transition-transform bg-foreground rounded-full"
                  style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {/* Default Grid Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">Default Grid Size</span>
                  <p className="text-[10px] text-muted">For new projects</p>
                </div>
                <span className="text-xs font-bold text-foreground">{defaultGridSize}x{defaultGridSize}</span>
              </div>
              <input
                type="range"
                min="16"
                max="128"
                step="16"
                value={defaultGridSize}
                onChange={(e) => setDefaultGridSize(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>
        </div>

        {/* Editor Settings */}
        <div className="bg-panel/30 border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-panel border border-border rounded-lg flex items-center justify-center">
              <Grid className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Editor Settings</h2>
              <p className="text-[10px] text-muted">Configure the drawing canvas</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Show Grid Default */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground">Show Grid by Default</span>
                <p className="text-[10px] text-muted">Enable grid lines on load</p>
              </div>
              <input
                type="checkbox"
                checked={showGridDefault}
                onChange={(e) => setShowGridDefault(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
            </div>

            {/* Auto Save */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">Auto-Save Interval</span>
                  <p className="text-[10px] text-muted">How often to save changes</p>
                </div>
                <span className="text-xs font-bold text-foreground">{autoSaveInterval} min</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-panel/30 border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-panel border border-border rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Storage & Cache</h2>
              <p className="text-[10px] text-muted">Manage local data</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground">Local Cache</span>
                <p className="text-[10px] text-muted">Temporary files and previews</p>
              </div>
              <span className="text-xs font-bold text-foreground">1.2 MB</span>
            </div>
            <button
              onClick={() => alert('Cache cleared!')}
              className="w-full h-9 px-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-95 bg-panel border border-border hover:border-red-500/50 hover:text-red-500 rounded-lg text-foreground"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
