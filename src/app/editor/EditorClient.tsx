'use client';

// React & Next.js
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Third-party
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Loading from '@/app/loading';
import { CanvasLayered } from '@/components/features/canvas/CanvasLayered';
import { Command, CommandPalette } from '@/components/features/editor/CommandPalette';
import { ExportModal } from '@/components/features/editor/modals/ExportModal';
import { LayersPanel } from '@/components/features/editor/panels/LayersPanel';
import { RightSidebar } from '@/components/features/editor/panels/RightSidebar';
import { FramesGrid } from '@/components/features/editor/panels/TimelineGrid';
import { ShortcutsReference } from '@/components/features/editor/ShortcutsReference';
import { TopNavigation } from '@/components/shared/layout/TopNavigation';
import { DeleteFrameModal } from '@/components/ui/DeleteFrameModal';

// Hooks
import { useAnimationStore } from '@/hooks/useAnimationStore';
import { useEditorStore } from '@/hooks/useEditorStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

import { get, set } from 'idb-keyval';

// Lib & Utils
import { findCel } from '@/lib/models/animation';
import { loadProject } from '@/lib/project-loader';
import { generatePNG } from '@/lib/utils/export';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;
  const isDirtyRef = useRef(false);

  const { state: animationState, updatePixels: updateAnimationPixels, pushHistory, addLayer, addFrame, deleteFrame, updateTransform, unlinkCel, clearCel, undo: undoLayered, redo: redoLayered, updateSelection, resetState, updateThumbnail, toggleLayerVisibility, toggleLayerLock, renameLayer, deleteLayer, duplicateLayer, reorderLayers, updateLayerOpacity, updateLayerBlendMode, mergeLayerDown } = useAnimationStore();
  
  const {
    tool, setTool,
    color, setColor,
    brushSize, setBrushSize,
    mirrorMode, setMirrorMode,
    recentColors, setRecentColors,
    activePalette, setActivePalette,
    gridSize, setGridSize,
    toyMode, setToyMode,
    zoom, setZoom,
    pan, setPan,
    onionSkin, setOnionSkin,
    isPlaying, setIsPlaying,
    fps, setFps,
    selectedFrameId, setSelectedFrameId,
    selectedLayerId, setSelectedLayerId,
    isTimelineExpanded, setIsTimelineExpanded
  } = useEditorStore();

  const handleUpdatePixels = useCallback((frameId: string, layerId: string, pixels: { [key: string]: string }) => {
    isDirtyRef.current = true;
    updateAnimationPixels(frameId, layerId, pixels);
  }, [updateAnimationPixels]);

  const [frameToDelete, setFrameToDelete] = useState<{ id: string, index: number } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'gif' | 'svg'>('png');

  const getCompositedPixels = useCallback((frameId: string) => {
    const pixels: { [key: string]: string } = {};
    animationState.layers.forEach(layer => {
      if (!layer.isVisible) return;
      const cel = findCel(animationState, frameId, layer.id);
      if (cel) {
        const celData = animationState.celData[cel.dataId];
        if (celData) {
          Object.entries(celData.pixels || {}).forEach(([key, color]) => {
            if (color) pixels[key] = color;
          });
        }
      }
    });
    return pixels;
  }, [animationState]);

  const isFrameEmpty = useCallback((frameId: string) => {
    const frameCels = animationState.cels.filter(c => c.frameId === frameId);
    return frameCels.every(cel => {
      const data = animationState.celData[cel.dataId];
      return !data || Object.keys(data.pixels).length === 0;
    });
  }, [animationState]);

  const performDeleteFrame = useCallback((frameId: string) => {
    if (frameId === selectedFrameId) {
      const currentIndex = animationState.frames.findIndex(f => f.id === frameId);
      let nextSelectedId = '';
      
      if (currentIndex > 0) {
        nextSelectedId = animationState.frames[currentIndex - 1].id;
      } else if (animationState.frames.length > 1) {
        nextSelectedId = animationState.frames[currentIndex + 1].id;
      }
      
      if (nextSelectedId) {
        setSelectedFrameId(nextSelectedId);
      }
    }
    deleteFrame(frameId);
  }, [animationState, selectedFrameId, deleteFrame]);

  const handleDeleteFrameRequest = useCallback((frameId: string) => {
    if (animationState.frames.length <= 1) return;
    
    if (!isFrameEmpty(frameId)) {
      const index = animationState.frames.findIndex(f => f.id === frameId);
      setFrameToDelete({ id: frameId, index: index + 1 });
    } else {
      performDeleteFrame(frameId);
    }
  }, [animationState, isFrameEmpty, performDeleteFrame]);

  const computedFrames = useMemo(() => {
    if (!animationState || !animationState.frames) return [];
    return animationState.frames.map(frame => ({
      id: frame.id,
      pixels: getCompositedPixels(frame.id)
    }));
  }, [animationState, getCompositedPixels]);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timeline resizing state
  const [timelineHeight, setTimelineHeight] = useState(220);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  const handleExportPNG = useCallback(() => {
    setExportFormat('png');
    setIsExportModalOpen(true);
  }, []);

  const handleExportSVG = useCallback(() => {
    setExportFormat('svg');
    setIsExportModalOpen(true);
  }, []);

  const handleExportGIF = useCallback(() => {
    setExportFormat('gif');
    setIsExportModalOpen(true);
  }, []);


  const startTimelineDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTimeline(true);
  }, []);

  useEffect(() => {
    if (!isDraggingTimeline) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      setTimelineHeight(Math.max(100, Math.min(600, newHeight)));
    };
    const handleMouseUp = () => setIsDraggingTimeline(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline]);

  // Check for mobile screen on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, []);

  // Load project from sessionStorage when navigating from dashboard
  useEffect(() => {
    if (!projectId) return;
    const stored = sessionStorage.getItem('open-project');
    if (!stored) return;
    try {
      const project = JSON.parse(stored);
      if (project.id === projectId) {
        if (project.id.startsWith('import_')) {
          setCurrentProjectId(null);
        } else {
          setCurrentProjectId(project.id);
        }
        setProjectName(project.name);
        setGridSize(project.gridSize || 32);
        if (project.palette) {
          setActivePalette(project.palette);
        }
        if (project.animationState) {
          resetState(project.animationState);
        } else if (project.frames?.length) {
          resetState({
            frames: project.frames.map((f: any) => ({ id: f.id.toString() })),
            layers: [{ id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false }],
            cels: project.frames.map((f: any) => ({ frameId: f.id.toString(), layerId: 'layer-1', dataId: `data-${f.id}-layer-1` })),
            celData: project.frames.reduce((acc: any, f: any) => {
              acc[`data-${f.id}-layer-1`] = { id: `data-${f.id}-layer-1`, pixels: f.pixels || {} };
              return acc;
            }, {}),
          });
        } else if (project.pixels) {
          resetState({
            frames: [{ id: 'frame-1' }],
            layers: [{ id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false }],
            cels: [{ frameId: 'frame-1', layerId: 'layer-1', dataId: 'data-frame-1-layer-1' }],
            celData: {
              'data-frame-1-layer-1': { id: 'data-frame-1-layer-1', pixels: project.pixels }
            },
          });
        }
        sessionStorage.removeItem('open-project');
      }
    } catch (e) {
      console.error('Failed to parse project from sessionStorage', e);
    }
  }, [projectId, resetState]);

  // Fetch project from API if missing from sessionStorage (e.g. on refresh)
  useEffect(() => {
    if (!projectId || !isAuthenticated || projectId.startsWith('import_') || projectId.startsWith('template_')) {
      setIsHydrated(true);
      return;
    }

    if (currentProjectId) {
      setIsHydrated(true);
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const rawProject = data.data;
          
          // Use projectLoader to validate and migrate!
          const project = await loadProject(rawProject);
          
          setCurrentProjectId(project.id);
          setProjectName(project.name);
          setGridSize(project.gridSize || 32);
          
          if (project.animationState) {
            resetState(project.animationState);
            if (project.animationState.frames?.length > 0) {
              setSelectedFrameId(project.animationState.frames[0].id);
            }
            if (project.animationState.layers?.length > 0) {
              setSelectedLayerId(project.animationState.layers[0].id);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch project from API', e);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchProject();
  }, [projectId, currentProjectId, isAuthenticated, resetState]);

  const getUsedColors = useCallback(() => {
    const colors = new Set<string>();
    if (!animationState || !animationState.celData) return [];
    Object.values(animationState.celData).forEach((cel: any) => {
      Object.values(cel.pixels || {}).forEach((color: any) => {
        if (color && color !== 'transparent') {
          colors.add(color.toLowerCase());
        }
      });
    });
    return Array.from(colors);
  }, [animationState?.celData]);

  useEffect(() => {
    if (!isHydrated) return;
    const usedColors = getUsedColors();
    // Filter out colors that are already in the active palette
    const activeLower = activePalette.map(c => c.toLowerCase());
    const filtered = usedColors.filter(c => !activeLower.includes(c.toLowerCase()));
    setRecentColors(filtered);
  }, [isHydrated, getUsedColors, activePalette]);

  const addRecentColor = useCallback((newColor: string) => {
    // Handled automatically by the effect above
  }, []);

  const syncToLocalStorage = useCallback(async (updater: (prev: any[]) => any[]) => {
    const saved = await get('pixel-art-projects');
    const all = saved ? saved : [];
    const updated = updater(all);
    await set('pixel-art-projects', updated);
  }, []);



  const handleAddFrameLayered = useCallback((id: string, copyFromId?: string) => {
    addFrame(id, copyFromId);
    setSelectedFrameId(id);
  }, [addFrame, setSelectedFrameId]);



  const handleSaveProject = useCallback(async (preview: string, metadata: Partial<any> = {}) => {
    // If we're updating an existing project, we should preserve its current metadata
    // unless explicitly overridden.
    const projectData = {
      name: projectName || 'Untitled Project',
      date: new Date().toLocaleDateString(),
      preview,
      gridSize,
      frames: animationState.frames, // Legacy fallback
      animationState, // New layered state
      palette: activePalette, // Save active palette!
      isFavourite: false,
      isDraft: true, // Default to draft for auto-saves
      ...metadata
    };

    if (isAuthenticated && !isOffline) {
      // ── Cloud save (MongoDB) ──────────────────────────────────────
      if (currentProjectId && !currentProjectId.startsWith('template_') && !currentProjectId.startsWith('import_')) {
        await fetch(`/api/projects/${currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentProjectId(data.data.id);
          // If it's a new project, we might want to update the URL without refreshing
          window.history.replaceState(null, '', `/editor?id=${data.data.id}`);
        }
      }
    } else {
      // ── Guest save (IndexedDB) ─────────────────────────────────
      await syncToLocalStorage((prev) => {
        if (currentProjectId && !currentProjectId.startsWith('template_') && !currentProjectId.startsWith('import_')) {
          return prev.map((p) => (p.id === currentProjectId ? { ...p, ...projectData } : p));
        } else {
          const newId = Date.now().toString();
          setCurrentProjectId(newId);
          window.history.replaceState(null, '', `/editor?id=${newId}`);
          return [{ id: newId, ...projectData }, ...prev];
        }
      });
    }
  }, [isAuthenticated, projectName, gridSize, animationState, currentProjectId, syncToLocalStorage, isOffline]);

  const performSave = useCallback(async (metadata: Partial<any> = {}) => {
    setSaveStatus('saving');
    try {
      const thumbFrameId = animationState.thumbnailFrameId || (animationState.frames.length > 0 ? animationState.frames[0].id : null);
      
      let currentPixels = {};
      if (thumbFrameId) {
        currentPixels = getCompositedPixels(thumbFrameId);
      }

      // Use 200px for cloud storage efficiency; 600px is wasteful for previews
      const previewSize = isAuthenticated ? 200 : 600;
      const preview = await generatePNG(currentPixels, gridSize, previewSize, darkMode ? '#0B0B0B' : '#ffffff');
      await handleSaveProject(preview, metadata);
      setSaveStatus('saved');
      
      // Reset to idle after a while
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
    }
  }, [animationState, getCompositedPixels, gridSize, darkMode, isAuthenticated, handleSaveProject]);

  const handleSaveAsTemplate = useCallback(async () => {
    const name = prompt('Enter template name:', 'Untitled Template');
    if (!name) return;
    
    const description = prompt('Enter template description:', '');
    
    const pixels = getCompositedPixels(selectedFrameId);
    const colors = Array.from(new Set(Object.values(pixels))).filter(c => c !== 'transparent');
    
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        gridSize,
        palette: colors,
        pixels,
      }),
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Template saved successfully!');
    } else {
      alert('Failed to save template.');
    }
  }, [getCompositedPixels, gridSize, selectedFrameId]);

  // ── Auto-save logic ────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    if (animationState.frames.length === 0) return;

    const timer = setTimeout(() => {
      performSave({ isDraft: true });
    }, 4000); // 4 second debounce

    return () => clearTimeout(timer);
  }, [isHydrated, animationState, performSave]);

  useEffect(() => {
    if (!isHydrated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSave({ isDraft: true });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        performSave({ isDraft: true });
        isDirtyRef.current = false;
      }
      e.preventDefault();
      e.returnValue = '';
    };

    const interval = setInterval(() => {
      if (isDirtyRef.current) {
        performSave({ isDraft: true });
        isDirtyRef.current = false;
      }
    }, 30000); // Every 30 seconds

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, [isHydrated, performSave]);

  // Handle Tailwind dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const performClear = useCallback(() => {
    clearCel(selectedFrameId, selectedLayerId);
  }, [clearCel, selectedFrameId, selectedLayerId]);

  const handleAdjustBrush = useCallback((increment: boolean) => {
    setBrushSize(s => increment ? Math.min(16, s + 1) : Math.max(1, s - 1));
  }, []);

  const commands = useMemo<Command[]>(() => [
    { id: 'shortcuts', title: 'Open Keyboard Shortcuts', category: 'General', action: () => setIsShortcutsOpen(true), shortcut: '?' },
    { id: 'fill', title: 'Fill Tool', category: 'Tools', action: () => setTool('fill'), shortcut: 'F' },
    { id: 'erase', title: 'Erase Tool', category: 'Tools', action: () => setTool('erase'), shortcut: 'E' },
    { id: 'picker', title: 'Color Picker', category: 'Tools', action: () => setTool('picker'), shortcut: 'I' },
    { id: 'undo', title: 'Undo', category: 'History', action: undoLayered, shortcut: 'Cmd+Z' },
    { id: 'redo', title: 'Redo', category: 'History', action: redoLayered, shortcut: 'Cmd+Shift+Z' },
    { id: 'clear', title: 'Clear Canvas', category: 'Canvas', action: performClear, shortcut: 'Cmd+X' },
    { id: 'save', title: 'Save Project', category: 'File', action: () => performSave({ isDraft: false }), shortcut: 'Cmd+S' },
    { id: 'toggle-dark', title: 'Toggle Dark Mode', category: 'Settings', action: () => setDarkMode(prev => !prev) },
    { id: 'toggle-timeline', title: 'Toggle Frames', category: 'View', action: () => setIsTimelineExpanded(prev => !prev) },
    { id: 'toggle-onion', title: 'Toggle Onion Skin', category: 'View', action: () => setOnionSkin(prev => !prev) },
  ], [setTool, undoLayered, redoLayered, performClear, performSave, setDarkMode, setIsTimelineExpanded, setOnionSkin, setIsShortcutsOpen]);

  const [clipboard, setClipboard] = useState<{ pixels: { [key: string]: string }; w: number; h: number } | null>(null);

  const handleCopy = useCallback(() => {
    const activeCel = findCel(animationState, selectedFrameId, selectedLayerId);
    if (!activeCel || !activeCel.selection) return;
    const selection = activeCel.selection;
    const celData = animationState.celData[activeCel.dataId];
    if (!celData) return;

    const pixels: { [key: string]: string } = {};
    for (let x = selection.x; x < selection.x + selection.w; x++) {
      for (let y = selection.y; y < selection.y + selection.h; y++) {
        const key = `${x},${y}`;
        if (celData.pixels[key]) {
          const relKey = `${x - selection.x},${y - selection.y}`;
          pixels[relKey] = celData.pixels[key];
        }
      }
    }
    setClipboard({ pixels, w: selection.w, h: selection.h });
  }, [animationState, selectedFrameId, selectedLayerId]);

  const handleCut = useCallback(() => {
    handleCopy();
    const activeCel = findCel(animationState, selectedFrameId, selectedLayerId);
    if (!activeCel || !activeCel.selection) return;
    const selection = activeCel.selection;
    
    // Clear pixels in selection
    const clearedPixels: { [key: string]: string } = {};
    for (let x = selection.x; x < selection.x + selection.w; x++) {
      for (let y = selection.y; y < selection.y + selection.h; y++) {
        clearedPixels[`${x},${y}`] = ''; // Empty string for transparent
      }
    }
    handleUpdatePixels(selectedFrameId, selectedLayerId, clearedPixels);
  }, [handleCopy, selectedFrameId, selectedLayerId, handleUpdatePixels, animationState]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    const activeCel = findCel(animationState, selectedFrameId, selectedLayerId);
    if (!activeCel) return;
    
    const x = activeCel.selection?.x || 0;
    const y = activeCel.selection?.y || 0;
    
    const pastedPixels: { [key: string]: string } = {};
    Object.entries(clipboard.pixels).forEach(([key, color]) => {
      const [px, py] = key.split(',').map(Number);
      const newKey = `${px + x},${py + y}`;
      pastedPixels[newKey] = color;
    });
    handleUpdatePixels(selectedFrameId, selectedLayerId, pastedPixels);
  }, [clipboard, animationState, selectedFrameId, selectedLayerId, handleUpdatePixels]);

  useGlobalShortcuts({
    onUndo: undoLayered,
    onRedo: redoLayered,
    onSave: performSave,
    onClear: performClear,
    onSetTool: setTool,
    onAdjustBrush: handleAdjustBrush,
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onToggleShortcuts: () => setIsShortcutsOpen(prev => !prev),
    onCopy: handleCopy,
    onCut: handleCut,
    onPaste: handlePaste,
    onTogglePlay: () => setIsPlaying(prev => !prev),
    onNextFrame: () => {
      const currentIndex = animationState.frames.findIndex(f => f.id === selectedFrameId);
      if (currentIndex < animationState.frames.length - 1) {
        setSelectedFrameId(animationState.frames[currentIndex + 1].id);
      }
    },
    onPrevFrame: () => {
      const currentIndex = animationState.frames.findIndex(f => f.id === selectedFrameId);
      if (currentIndex > 0) {
        setSelectedFrameId(animationState.frames[currentIndex - 1].id);
      }
    },
    onDeleteFrame: () => handleDeleteFrameRequest(selectedFrameId),
    onNewLayer: () => {
      const id = `layer_${Date.now()}`;
      addLayer(id, `Layer ${animationState.layers.length + 1}`);
      setSelectedLayerId(id);
    },
    onDuplicateLayer: () => {
      const layer = animationState.layers.find(l => l.id === selectedLayerId);
      if (!layer) return;
      const id = `layer_${Date.now()}`;
      duplicateLayer(selectedLayerId, id);
      setSelectedLayerId(id);
    },
    onDeleteLayer: () => {
      if (animationState.layers.length <= 1) return;
      const currentIndex = animationState.layers.findIndex(l => l.id === selectedLayerId);
      deleteLayer(selectedLayerId);
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      setSelectedLayerId(animationState.layers[nextIndex].id);
    },
    onMoveLayerUp: () => {
      const currentIndex = animationState.layers.findIndex(l => l.id === selectedLayerId);
      if (currentIndex > 0) {
        const newLayers = [...animationState.layers];
        const temp = newLayers[currentIndex];
        newLayers[currentIndex] = newLayers[currentIndex - 1];
        newLayers[currentIndex - 1] = temp;
        reorderLayers(newLayers);
      }
    },
    onMoveLayerDown: () => {
      const currentIndex = animationState.layers.findIndex(l => l.id === selectedLayerId);
      if (currentIndex < animationState.layers.length - 1) {
        const newLayers = [...animationState.layers];
        const temp = newLayers[currentIndex];
        newLayers[currentIndex] = newLayers[currentIndex + 1];
        newLayers[currentIndex + 1] = temp;
        reorderLayers(newLayers);
      }
    },
    onSelectLayerAbove: () => {
      const currentIndex = animationState.layers.findIndex(l => l.id === selectedLayerId);
      if (currentIndex > 0) {
        setSelectedLayerId(animationState.layers[currentIndex - 1].id);
      }
    },
    onSelectLayerBelow: () => {
      const currentIndex = animationState.layers.findIndex(l => l.id === selectedLayerId);
      if (currentIndex < animationState.layers.length - 1) {
        setSelectedLayerId(animationState.layers[currentIndex + 1].id);
      }
    },
  });

  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300" style={{ fontFamily: "'Geist Mono', monospace" }}>
      <AnimatePresence>
        {showMobileWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#141414] border border-white/10 rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">Desktop Recommended</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Precision Workspace</p>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                This editor is optimized for larger screens and precision input (like a mouse or stylus). For the best experience while creating or animating, we recommend using a laptop or desktop computer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowMobileWarning(false)}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg"
                >
                  Continue Anyway
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 btn-secondary py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopNavigation
        onUndo={undoLayered}
        onRedo={redoLayered}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onBackToDashboard={() => router.push('/dashboard')}
        projectName={projectName}
        setProjectName={setProjectName}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        saveStatus={saveStatus}
        isOffline={isOffline}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="shrink-0 h-full z-10 w-80 border-r border-border bg-background flex flex-col gap-4 p-4 overflow-y-auto">
          <LayersPanel
            state={animationState}
            addLayer={addLayer}
            unlinkCel={unlinkCel}
            toggleLayerVisibility={toggleLayerVisibility}
            toggleLayerLock={toggleLayerLock}
            renameLayer={renameLayer}
            deleteLayer={deleteLayer}
            duplicateLayer={duplicateLayer}
            clearCel={clearCel}
            reorderLayers={reorderLayers}
            updateLayerOpacity={updateLayerOpacity}
            updateLayerBlendMode={updateLayerBlendMode}
            mergeLayerDown={mergeLayerDown}
          />
        </div>

        {/* Center Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative overflow-hidden">
          <div className="flex-1 relative overflow-hidden min-h-0">
            <CanvasLayered
              state={animationState}
              currentFrameId={selectedFrameId}
              activeLayerId={selectedLayerId}
              onUpdatePixels={handleUpdatePixels}
              onUpdateTransform={updateTransform}
              onUpdateSelection={updateSelection}
              gridSize={gridSize}
              darkMode={darkMode}
              zoom={zoom}
              pan={pan}
              color={color}
              tool={tool}
              mirrorMode={mirrorMode}
              onionSkin={onionSkin}
              onZoom={setZoom}
              onPan={setPan}
              toyMode={toyMode}
              brushSize={brushSize}
              onPushHistory={pushHistory}
            />
            {/* Inline Zoom Controls */}
            <div className="absolute bottom-4 right-4 bg-panel/80 backdrop-blur-sm border border-border rounded flex items-center shadow-lg z-20 pointer-events-auto">
              <button 
                onClick={() => setZoom((prev: number) => Math.max(0.1, prev - 0.25))}
                className="w-8 h-8 flex items-center justify-center border-r border-border hover:text-accent hover:bg-accent/10 transition-colors text-xs font-bold"
              >
                -
              </button>
              <div className="px-2 w-16">
                <input 
                  type="text"
                  value={`${Math.round(zoom * 100)}%`}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setZoom(Math.max(0.1, Math.min(10, val / 100)));
                    }
                  }}
                  className="w-full bg-transparent text-center text-[10px] font-mono font-bold focus:outline-none focus:text-accent"
                />
              </div>
              <button 
                onClick={() => setZoom((prev: number) => Math.min(10, prev + 0.25))}
                className="w-8 h-8 flex items-center justify-center border-l border-border hover:text-accent hover:bg-accent/10 transition-colors text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Timeline Toggle Divider */}
          <div 
            onMouseDown={isTimelineExpanded ? startTimelineDrag : undefined}
            className={`w-full flex justify-center relative bg-background border-t border-border shrink-0 z-20 py-1 ${isTimelineExpanded ? 'cursor-ns-resize hover:bg-accent/20 transition-colors group' : ''}`}
          >
            <div className={`absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isDraggingTimeline ? 'opacity-100' : ''}`} />
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsTimelineExpanded(!isTimelineExpanded);
              }}
              className="absolute -top-[14px] bg-panel border border-border px-4 py-1 text-[9px] font-bold tracking-widest uppercase rounded-full shadow-lg hover:border-accent transition-colors duration-200"
            >
              {isTimelineExpanded ? '▼ Close Frames' : '▲ Open Frames'}
            </button>
          </div>

          {/* Bottom Bar: Timeline */}
          <div 
            className="bg-background flex flex-col overflow-hidden"
            style={{ 
              height: isTimelineExpanded ? timelineHeight : 0,
              transition: isDraggingTimeline ? 'none' : 'height 300ms ease-in-out'
            }}
          >
            <FramesGrid
              state={animationState}
              addLayer={addLayer}
              addFrame={handleAddFrameLayered}
              onDeleteFrame={handleDeleteFrameRequest}
              unlinkCel={unlinkCel}
              updateThumbnail={updateThumbnail}
              darkMode={darkMode}
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-background border-t border-border h-24 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Canvas Size</span>
                <div className="flex items-center border border-border bg-panel">
                  <button 
                    onClick={() => setGridSize(Math.max(8, gridSize - 8))}
                    className="w-8 h-8 flex items-center justify-center border-r border-border hover-accent"
                  >
                    &lt;
                  </button>
                  <div className="px-3 text-[10px] font-bold">{gridSize} X {gridSize}</div>
                  <button 
                    onClick={() => setGridSize(Math.min(64, gridSize + 8))}
                    className="w-8 h-8 flex items-center justify-center border-l border-border hover-accent"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Toy Mode</span>
                <button
                  onClick={() => setToyMode(!toyMode)}
                  className={`border border-border p-1 w-12 h-8 flex items-center transition-colors ${toyMode ? 'bg-accent/20 border-accent' : 'bg-panel'}`}
                >
                  <div className={`w-4 h-full bg-accent transition-transform ${toyMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={performClear}
                className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-panel transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-panel transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => performSave({ isDraft: false })}
                className="px-4 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-background rounded-full inline-block" /> SAVE PROJECT
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="shrink-0 h-full z-10">
          <RightSidebar
            state={animationState}
            frames={computedFrames}
            currentFrame={currentFrame}
            updateLayerOpacity={updateLayerOpacity}
            updateLayerBlendMode={updateLayerBlendMode}
            darkMode={darkMode}
            onSaveTemplate={handleSaveAsTemplate}
          />
        </div>
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
      <ShortcutsReference
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <DeleteFrameModal
        isOpen={frameToDelete !== null}
        onClose={() => setFrameToDelete(null)}
        onConfirm={() => {
          if (frameToDelete) {
            performDeleteFrame(frameToDelete.id);
          }
        }}
        frameIndex={frameToDelete?.index || 0}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        state={animationState}
        projectName={projectName}
        initialFormat={exportFormat}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center" style={{ fontFamily: "'Geist Mono', monospace" }}>
        Loading editor...
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
