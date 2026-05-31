'use client';
import { FolderPlus, Grid, List, Search } from 'lucide-react';
import { useState } from 'react';
import { Project } from './Dashboard';
import { FolderCard } from './FolderCard';
import { ProjectCard } from './ProjectCard';

interface Folder {
  id: string;
  name: string;
}

interface ProjectsViewProps {
  projects: Project[];
  folders: Folder[];
  darkMode: boolean;
  onOpenProject: (p: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
  onAddFolder: () => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function ProjectsView({
  projects,
  folders,
  darkMode,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
  onMoveToFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Projects</h1>
          <p className="text-xs text-muted">Manage your artwork and folders</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-panel/50 border border-border rounded-lg text-xs focus:outline-none focus:border-accent w-full sm:w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-accent/10 text-accent' : 'bg-transparent text-muted hover:text-foreground'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-accent/10 text-accent' : 'bg-transparent text-muted hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Folder Button */}
          <button
            onClick={onAddFolder}
            className="px-4 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors flex items-center gap-2 shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredFolders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            darkMode={darkMode}
            onClick={() => {}} // Handle folder click (navigation)
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
          />
        ))}
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            darkMode={darkMode}
            folders={folders}
            onOpen={onOpenProject}
            onToggleFavourite={onToggleFavourite}
            onToggleDraft={onToggleDraft}
            onDelete={onDeleteProject}
            onMoveToFolder={onMoveToFolder}
          />
        ))}

        {filteredProjects.length === 0 && filteredFolders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted text-xs">
            No projects or folders found.
          </div>
        )}
      </div>
    </div>
  );
}
