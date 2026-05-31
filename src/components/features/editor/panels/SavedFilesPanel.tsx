import { Trash2 } from 'lucide-react';

interface SavedProject {
  id: string;
  name: string;
  date: string;
  preview: string;
  [key: string]: any;
}

interface SavedFilesPanelProps {
  darkMode: boolean;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
}

export function SavedFilesPanel({ darkMode, savedProjects, onLoadProject, onDeleteProject }: SavedFilesPanelProps) {
  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#666' : '#999';

  return (
    <div className="w-80 border-l flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, borderColor }}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>SAVED FILES</div>

        {savedProjects.length === 0 ? (
          <div className="flex-1 border border-dashed flex flex-col items-center justify-center text-center p-8 gap-4" style={{ borderColor }}>
            <div className="grid grid-cols-2 gap-2 opacity-10">
              <div className="w-8 h-8 border border-dashed" style={{ borderColor: textColor }} />
              <div className="w-8 h-8 border border-dashed" style={{ borderColor: textColor }} />
              <div className="w-8 h-8 border border-dashed" style={{ borderColor: textColor }} />
              <div className="w-8 h-8 border border-dashed" style={{ borderColor: textColor }} />
            </div>
            
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: textColor }}>Make something!</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: textColor }}>No saved projects yet</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {savedProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => onLoadProject(project)}
                className="border p-3 flex gap-4 transition-colors hover:bg-accent/10 group" 
                style={{ borderColor, cursor: 'pointer' }}
              >
                <div className="w-16 h-16 border shrink-0 bg-white" style={{ borderColor }}>
                  <img src={project.preview} alt={project.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: textColor }}>{project.name}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1" style={{ color: textColor }}>{project.date}</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${project.name}"?`)) {
                      onDeleteProject(project.id);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-sm"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
