'use client';
import { Edit2, Folder as FolderIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Folder {
  id: string;
  name: string;
  [key: string]: any;
}

interface FolderCardProps {
  folder: Folder;
  darkMode: boolean;
  onClick: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function FolderCard({ folder, darkMode, onClick, onRename, onDelete }: FolderCardProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative group flex flex-col border transition-all duration-200 cursor-pointer bg-panel ${
        hovered ? 'border-foreground shadow-xl' : 'border-border'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => onClick(folder.id)}
    >
      <div className="aspect-square w-full flex flex-col items-center justify-center gap-4 relative">
        <div className="w-16 h-16 flex items-center justify-center bg-accent/10 border border-border">
          <FolderIcon className="w-8 h-8 opacity-40 text-foreground" />
        </div>
        
        {/* Actions Menu */}
        {hovered && (
          <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
             <button 
                onClick={() => {
                  const newName = prompt('Enter new folder name:', folder.name);
                  if (newName && newName !== folder.name) onRename(folder.id, newName);
                }}
                className="w-7 h-7 flex items-center justify-center border border-border hover-accent text-foreground"
             >
                <Edit2 className="w-3 h-3" />
             </button>
             <button 
                onClick={() => {
                  if (confirm(`Delete folder "${folder.name}"? (Projects inside will be moved to root)`)) {
                    onDelete(folder.id);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center border border-border hover:bg-red-500/10 transition-colors text-red-500"
             >
                <Trash2 className="w-3 h-3" />
             </button>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-t border-border flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider truncate text-foreground">
          {folder.name}
        </div>
        <div className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] text-foreground">
          Folder
        </div>
      </div>
    </div>
  );
}
