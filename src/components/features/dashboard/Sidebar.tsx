'use client';
import { Clock, Globe, Grid, Layers, Settings, Star, Trash2 } from 'lucide-react';
import React from 'react';
import { Project } from './Dashboard';

interface SidebarProps {
  favourites: Project[];
  onOpenProject: (project: Project) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ favourites, onOpenProject, activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-zinc-950 border-r border-border flex flex-col justify-between p-4 shrink-0 text-foreground">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <SidebarLink icon={<Clock className="w-4 h-4" />} label="Recents" active={activeView === 'recents'} onClick={() => onViewChange('recents')} />
          <SidebarLink icon={<Grid className="w-4 h-4" />} label="Projects" active={activeView === 'projects'} onClick={() => onViewChange('projects')} />
          <SidebarLink icon={<Layers className="w-4 h-4" />} label="Templates" active={activeView === 'templates'} onClick={() => onViewChange('templates')} />
          <SidebarLink icon={<Globe className="w-4 h-4" />} label="Community" disabled />
          <SidebarLink icon={<Trash2 className="w-4 h-4" />} label="Trash" active={activeView === 'trash'} onClick={() => onViewChange('trash')} />
        </div>

        {/* Pinned Projects */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted px-3">
            Pinned
          </h3>
          <div className="space-y-1">
            {favourites.length === 0 ? (
              <div className="text-[10px] text-muted px-3 py-1 opacity-50">
                No pinned projects
              </div>
            ) : (
              favourites.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground hover:bg-panel/50 rounded-lg transition-colors text-left"
                >
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Footer Links */}
        <div className="space-y-1">
          <SidebarLink icon={<Settings className="w-4 h-4" />} label="Settings" active={activeView === 'settings'} onClick={() => onViewChange('settings')} />
        </div>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function SidebarLink({ icon, label, active = false, disabled = false, onClick }: SidebarLinkProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
        active
          ? 'bg-panel text-foreground'
          : disabled
          ? 'text-muted/50 cursor-not-allowed'
          : 'text-muted hover:text-foreground hover:bg-panel/30'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={active ? 'text-accent' : 'text-muted'}>{icon}</span>
      <span>{label}</span>
      {disabled && (
        <span className="text-[8px] font-bold uppercase tracking-widest text-muted/50 ml-auto">Soon</span>
      )}
    </button>
  );
}
