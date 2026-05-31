'use client';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Folder as FolderIcon, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  date: string;
  preview: string;
  pixels: { [key: string]: string };
  gridSize: number;
  frames: { id: number; pixels: { [key: string]: string } }[];
  isFavourite: boolean;
  isDraft: boolean;
  folderId?: string | null;
  [key: string]: any;
}

interface Folder {
  id: string;
  name: string;
}

interface ProjectCardProps {
  project: Project;
  darkMode: boolean;
  folders: Folder[];
  onOpen: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
}

export function ProjectCard({ 
  project, 
  darkMode, 
  folders,
  onOpen, 
  onToggleFavourite, 
  onToggleDraft, 
  onDelete,
  onMoveToFolder
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  return (
    <div
      className={`relative group flex flex-col border transition-all duration-300 cursor-pointer bg-panel rounded-xl overflow-hidden ${
        hovered ? 'border-foreground shadow-xl' : 'border-border'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
    >
      {/* Preview Image */}
      <div className="aspect-[4/3] w-full overflow-hidden relative bg-background border-b border-border">
        {project.preview ? (
          <img
            src={project.preview}
            alt={project.name}
            className={`w-full h-full object-contain [image-rendering:pixelated] transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <div className="w-12 h-12 border border-dashed border-foreground" />
          </div>
        )}

        {/* Draft badge */}
        {project.isDraft && (
          <div className="absolute top-3 left-3 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-background/80 backdrop-blur-sm text-muted border border-border rounded">
            Draft
          </div>
        )}

        {/* Hover Action Overlay (Top Right) */}
        <div 
          className={`absolute top-3 right-3 flex gap-1.5 transition-opacity duration-200 ${hovered || isMoveMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favourite */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavourite(project.id); }}
            className={`w-7 h-7 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border transition-colors hover:bg-yellow-400/10 ${
              project.isFavourite ? 'text-yellow-500 border-yellow-500/50' : 'text-muted border-border'
            }`}
            title={project.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Star className="w-3 h-3" fill={project.isFavourite ? 'currentColor' : 'none'} />
          </button>

          {/* Move to Folder */}
          <div className="relative">
            <button
              onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
              className={`w-7 h-7 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border transition-colors hover:bg-panel ${
                isMoveMenuOpen ? 'border-accent text-accent' : 'border-border text-muted'
              }`}
              title="Move to folder"
            >
              <FolderIcon className="w-3 h-3" />
            </button>

            {isMoveMenuOpen && (
              <div className="absolute top-full mt-1.5 right-0 border border-border bg-panel flex flex-col min-w-[140px] shadow-2xl z-50 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[8px] font-bold uppercase tracking-widest border-b border-border opacity-40">
                  Move to...
                </div>
                <button 
                  onClick={() => { onMoveToFolder(project.id, null); setIsMoveMenuOpen(false); }}
                  className={`px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-background flex items-center gap-2 ${
                    !project.folderId ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full border ${!project.folderId ? 'border-accent bg-accent' : 'border-muted'}`} />
                  Root
                </button>
                {folders.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => { onMoveToFolder(project.id, f.id); setIsMoveMenuOpen(false); }}
                    className={`px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-background flex items-center gap-2 ${
                      project.folderId === f.id ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full border ${project.folderId === f.id ? 'border-accent bg-accent' : 'border-muted'}`} />
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            className="w-7 h-7 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="px-4 py-3.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-foreground truncate">{project.name || 'Untitled'}</h3>
          <span className="text-[10px] font-medium text-muted shrink-0">{project.gridSize}x{project.gridSize}</span>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <span>{project.frames?.length || 1} frames</span>
            <span>•</span>
            <span>1 layer</span>
          </div>
          <span>{project.date}</span>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(project.id)}
        projectName={project.name || 'Untitled Project'}
        darkMode={darkMode}
      />
    </div>
  );
}
