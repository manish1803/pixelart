'use client';
import { RotateCcw, Trash, Trash2 } from 'lucide-react';
import { Project } from './Dashboard';

interface TrashViewProps {
  projects: Project[];
  darkMode: boolean;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TrashView({
  projects,
  darkMode,
  onRestore,
  onDelete,
}: TrashViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">Trash</h1>
        <p className="text-xs text-muted">Items in trash will be kept for now (no auto-delete implemented yet)</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-panel/30 border border-border rounded-lg overflow-hidden flex flex-col group"
          >
            {/* Preview */}
            <div className="aspect-square bg-panel flex items-center justify-center relative">
              {project.preview ? (
                <img
                  src={project.preview}
                  alt={project.name}
                  className="w-full h-full object-contain opacity-50"
                />
              ) : (
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-20 text-foreground">
                  No Preview
                </div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => onRestore(project.id)}
                  className="px-3 py-1.5 bg-accent text-background text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-1.5"
                >
                  <Trash className="w-3 h-3" />
                  <span>Delete Forever</span>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 border-t border-border">
              <h3 className="text-xs font-bold text-foreground truncate mb-0.5 opacity-70">
                {project.name}
              </h3>
              <p className="text-[9px] text-muted">{project.date}</p>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted text-xs flex flex-col items-center gap-2">
            <Trash2 className="w-8 h-8 opacity-20" />
            <span>Trash is empty</span>
          </div>
        )}
      </div>
    </div>
  );
}
