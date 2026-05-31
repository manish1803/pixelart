'use client';
import { UserMenu } from '@/components/shared/layout/UserMenu';
import { Logo } from '@/components/shared/Logo';
import { CreateFolderModal } from '@/components/ui/CreateFolderModal';
import { ArrowLeft, Clock, FolderPlus, Plus, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FolderCard } from './FolderCard';
import { ImportImageModal } from './ImportImageModal';
import { ProjectCard } from './ProjectCard';
import { ProjectsView } from './ProjectsView';
import { SettingsView } from './SettingsView';
import { Sidebar } from './Sidebar';
import { TemplatesView } from './TemplatesView';
import { TrashView } from './TrashView';

export interface Project {
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

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  projects: Project[];
  folders: Folder[];
  trashProjects: Project[];
  loading?: boolean;
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRestoreProject: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onSelectTemplate: (template: any) => void;
}

function SectionEmptyState({ label, icon, action }: { label: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl bg-panel/10">
      <div className="w-12 h-12 rounded-full bg-panel border border-border flex items-center justify-center mb-3">
        {icon || <Plus className="w-5 h-5 text-muted" />}
      </div>
      <h3 className="text-xs font-bold text-foreground mb-1">{label}</h3>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function Section({
  title,
  icon,
  projects,
  folders = [],
  darkMode,
  emptyLabel,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
  onFolderClick,
  onRenameFolder,
  onDeleteFolder,
  onMoveToFolder,
  onAddFolder,
  onNewProject,
  allFolders,
}: {
  title: string | React.ReactNode;
  icon: any;
  projects: Project[];
  folders?: Folder[];
  darkMode: boolean;
  emptyLabel: string;
  onOpenProject: (p: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onFolderClick?: (id: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onDeleteFolder?: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
  onAddFolder?: () => void;
  onNewProject?: () => void;
  allFolders: Folder[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">
            {title}
          </span>
          <span className="text-[9px] font-bold opacity-30 ml-1 text-foreground">
            ({projects.length + folders.length})
          </span>
        </div>
        
        {onAddFolder && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddFolder(); }}
            className="h-8 px-3 border border-border flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest hover-accent text-foreground"
          >
            <FolderPlus className="w-3 h-3" />
            <span>New Folder</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {projects.length === 0 && folders.length === 0 ? (
          title === "Favourites" || title === "Drafts" ? (
            <div className="col-span-full text-[10px] text-muted opacity-50 px-1 py-2">
              {emptyLabel}
            </div>
          ) : (
            <SectionEmptyState 
              label={emptyLabel} 
              action={
                onNewProject && (
                  <button
                    onClick={onNewProject}
                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                  >
                    Start your first animation
                  </button>
                )
              }
            />
          )
        ) : (
          <>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                darkMode={darkMode}
                onClick={onFolderClick!}
                onRename={onRenameFolder!}
                onDelete={onDeleteFolder!}
              />
            ))}
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                darkMode={darkMode}
                folders={allFolders}
                onOpen={onOpenProject}
                onToggleFavourite={onToggleFavourite}
                onToggleDraft={onToggleDraft}
                onDelete={onDeleteProject}
                onMoveToFolder={onMoveToFolder}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export function Dashboard({
  darkMode,
  setDarkMode,
  projects,
  folders,
  loading = false,
  onNewProject,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveToFolder,
  activeView,
  onViewChange,
  onSelectTemplate,
  trashProjects,
  onRestoreProject,
}: DashboardProps) {
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const favourites = projects.filter((p) => p.isFavourite);
  const drafts = projects.filter((p) => p.isDraft && !p.isFavourite);
  
  // Filter for the main view
  const currentFolders = currentFolderId ? [] : folders; // We only have one level for now
  const filteredProjects = projects.filter(p => 
    p.folderId === (currentFolderId || null) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentFolderName = folders.find(f => f.id === currentFolderId)?.name;

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar 
        favourites={favourites} 
        onOpenProject={onOpenProject} 
        activeView={activeView}
        onViewChange={onViewChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Nav */}
      <nav className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-8 flex-1">
          <Logo />
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-panel/50 border border-border rounded-lg w-64 text-muted hover:border-accent/50 transition-colors focus-within:border-accent/50">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-medium text-foreground placeholder-muted/50 w-full"
            />
            <span className="text-[9px] font-bold tracking-widest text-muted/50 ml-auto">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Dark mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-12 h-6 border border-border flex items-center px-1 bg-panel"
            >
              <div
                className="w-4 h-4 transition-transform bg-foreground"
                style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <button
            onClick={onNewProject}
            className="h-9 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-95 bg-foreground text-background relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-zinc-100 rounded-full scale-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 dark:bg-accent" />
            <Plus className="w-3 h-3 relative z-10 transition-colors group-hover:text-zinc-950" />
            <span className="relative z-10 transition-colors group-hover:text-zinc-950">New Project</span>
          </button>

          <UserMenu
            onSignIn={() => router.push('/auth/signin?callbackUrl=/dashboard')}
          />
        </div>
      </nav>

      {/* Guest sync banner */}
      {!session && (
        <div className="px-8 py-2.5 border-b border-border flex items-center justify-between bg-panel/50">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-foreground">
            ☁ Sign in to sync your projects across devices
          </span>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/dashboard')}
            className="text-[9px] font-bold uppercase tracking-widest underline opacity-40 hover:opacity-100 transition-opacity text-foreground"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 text-foreground">
            Loading projects...
          </span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10">
          {activeView === 'templates' ? (
            <TemplatesView onSelectTemplate={onSelectTemplate} />
          ) : activeView === 'projects' ? (
            <ProjectsView
              projects={projects}
              folders={folders}
              darkMode={darkMode}
              onOpenProject={onOpenProject}
              onToggleFavourite={onToggleFavourite}
              onToggleDraft={onToggleDraft}
              onDeleteProject={onDeleteProject}
              onMoveToFolder={onMoveToFolder}
              onAddFolder={() => setIsFolderModalOpen(true)}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ) : activeView === 'settings' ? (
            <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />
          ) : activeView === 'trash' ? (
            <TrashView
              projects={trashProjects}
              darkMode={darkMode}
              onRestore={onRestoreProject}
              onDelete={onDeleteProject}
            />
          ) : (
            <>
              {/* Quick Workspace */}
              <div className="bg-panel/30 border border-border rounded-xl p-6 relative">
            <div className="flex flex-col md:flex-row gap-6 justify-between">


              {/* Left: Welcome & Quick Actions */}
              <div className="flex-1 space-y-4 min-w-0">
                <div>
                  <h1 className="text-xl font-bold text-foreground mb-1">Welcome back, {session?.user?.name || 'Creator'}</h1>
                  <p className="text-xs text-muted">What would you like to create today?</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Continue Working Card */}
                  {projects.length > 0 && (
                    <button
                      onClick={() => onOpenProject(projects[0])}
                      className="bg-panel border border-border hover:border-accent/50 rounded-lg p-4 text-left transition-colors group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-panel border border-border rounded flex items-center justify-center group-hover:border-accent/50 transition-colors">
                        <Clock className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-foreground truncate">{projects[0].name}</h3>
                          <span className="text-[9px] text-muted">{projects[0].date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted">
                          <span>{projects[0].gridSize}x{projects[0].gridSize}</span>
                          <span>•</span>
                          <span>{projects[0].frames?.length || 1} frames</span>
                        </div>
                      </div>
                    </button>
                  )}
                  <button
                    onClick={onNewProject}
                    className="bg-panel border border-border hover:border-accent/50 rounded-lg p-4 text-left transition-colors group flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-panel border border-border rounded flex items-center justify-center group-hover:border-accent/50 transition-colors">
                      <Plus className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">New Animation</h3>
                      <p className="text-[10px] text-muted">Start a blank canvas</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-panel border border-border hover:border-accent/50 rounded-lg p-4 text-left transition-colors group flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-panel border border-border rounded flex items-center justify-center group-hover:border-accent/50 transition-colors">
                      <FolderPlus className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Import Image</h3>
                      <p className="text-[10px] text-muted">Convert image to pixel art</p>
                    </div>
                  </button>


                </div>
              </div>


            </div>
          </div>

          {/* Favourites */}
          <Section
            title="Favourites"
            icon="★"
            projects={favourites}
            darkMode={darkMode}
            emptyLabel="Star a project to pin it here"
            onOpenProject={onOpenProject}
            onToggleFavourite={onToggleFavourite}
            onToggleDraft={onToggleDraft}
            onDeleteProject={onDeleteProject}
            onMoveToFolder={onMoveToFolder}
            allFolders={folders}
          />

          {/* Drafts */}
          <Section
            title="Drafts"
            icon="📄"
            projects={drafts}
            darkMode={darkMode}
            emptyLabel="No drafts yet"
            onOpenProject={onOpenProject}
            onToggleFavourite={onToggleFavourite}
            onToggleDraft={onToggleDraft}
            onDeleteProject={onDeleteProject}
            onMoveToFolder={onMoveToFolder}
            allFolders={folders}
          />

          {/* All Projects / Folder View */}
          <Section
            title={currentFolderId ? `Folder: ${currentFolderName}` : "All Projects"}
            icon={currentFolderId ? <button onClick={() => setCurrentFolderId(null)} className="hover:opacity-50"><ArrowLeft className="w-4 h-4" /></button> : "📁"}
            projects={filteredProjects}
            folders={currentFolders}
            darkMode={darkMode}
            emptyLabel={currentFolderId ? "This folder is empty" : "No saved projects yet — start drawing!"}
            onOpenProject={onOpenProject}
            onToggleFavourite={onToggleFavourite}
            onToggleDraft={onToggleDraft}
            onDeleteProject={onDeleteProject}
            onFolderClick={(id) => setCurrentFolderId(id)}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveToFolder={onMoveToFolder}
            onAddFolder={() => setIsFolderModalOpen(true)}
            onNewProject={onNewProject}
            allFolders={folders}
          />
          </>
          )}

          <CreateFolderModal 
            isOpen={isFolderModalOpen}
            onClose={() => setIsFolderModalOpen(false)}
            onConfirm={onCreateFolder}
            darkMode={darkMode}
          />

          <ImportImageModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={(layers, size, palette) => {
              const mockId = `import_${Date.now()}`;
              const mockProject = {
                id: mockId,
                name: 'Imported Project',
                date: new Date().toLocaleDateString(),
                preview: '',
                pixels: layers[0] || {},
                gridSize: size,
                palette,
                frames: [{ id: 1, pixels: layers[0] || {} }],
                animationState: {
                  layers: layers.map((_, index) => ({ id: `layer-${index+1}`, name: `Layer ${index+1}`, isVisible: true, isLocked: false, opacity: 100, blendMode: 'source-over' })),
                  frames: [{ id: 'frame-1' }],
                  cels: layers.map((_, index) => ({ layerId: `layer-${index+1}`, frameId: 'frame-1', dataId: `data-${index+1}` })),
                  celData: layers.reduce((acc, layerPixels, index) => {
                    acc[`data-${index+1}`] = { id: `data-${index+1}`, pixels: layerPixels };
                    return acc;
                  }, {} as any)
                },
                isFavourite: false,
                isDraft: true
              };
              sessionStorage.setItem('open-project', JSON.stringify(mockProject));
              router.push(`/editor?id=${mockId}`);
            }}
          />
        </div>
      )}
      </div>
    </div>
  );
}
