import { create } from 'zustand';

interface EditorState {
  // Tools
  tool: 'fill' | 'erase' | 'picker' | 'selection';
  setTool: (tool: 'fill' | 'erase' | 'picker' | 'selection') => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  mirrorMode: 'none' | 'vertical' | 'horizontal' | 'both';
  setMirrorMode: (mode: 'none' | 'vertical' | 'horizontal' | 'both') => void;
  recentColors: string[];
  setRecentColors: (colors: string[]) => void;
  addRecentColor: (color: string) => void;
  activePalette: string[];
  setActivePalette: (palette: string[]) => void;
  
  // Document
  gridSize: number;
  setGridSize: (size: number) => void;
  toyMode: boolean;
  setToyMode: (toyMode: boolean) => void;

  // Viewport
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  onionSkin: boolean;
  setOnionSkin: (onionSkin: boolean | ((prev: boolean) => boolean)) => void;

  // Playback
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean | ((prev: boolean) => boolean)) => void;
  fps: number;
  setFps: (fps: number) => void;

  // Selection state
  selectedFrameId: string;
  setSelectedFrameId: (id: string) => void;
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;

  // Layout
  isTimelineExpanded: boolean;
  setIsTimelineExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: 'fill',
  setTool: (tool) => set({ tool }),
  
  color: '#ff0000',
  setColor: (color) => set({ color }),
  
  brushSize: 1,
  setBrushSize: (size) => set((state) => ({ brushSize: typeof size === 'function' ? size(state.brushSize) : size })),
  
  mirrorMode: 'none',
  setMirrorMode: (mode) => set({ mirrorMode: mode }),
  
  recentColors: [],
  setRecentColors: (colors) => set({ recentColors: colors }),
  addRecentColor: (color) => set((state) => {
    if (state.recentColors.includes(color) || state.activePalette.includes(color)) return state;
    return { recentColors: [color, ...state.recentColors].slice(0, 20) };
  }),
  
  activePalette: [],
  setActivePalette: (palette) => set({ activePalette: palette }),

  gridSize: 32,
  setGridSize: (size) => set({ gridSize: size }),
  
  toyMode: false,
  setToyMode: (toyMode) => set({ toyMode }),

  zoom: 1,
  setZoom: (zoomAction) => set((state) => ({ 
    zoom: typeof zoomAction === 'function' ? zoomAction(state.zoom) : zoomAction 
  })),
  
  pan: { x: 0, y: 0 },
  setPan: (panAction) => set((state) => ({
    pan: typeof panAction === 'function' ? panAction(state.pan) : panAction
  })),
  
  onionSkin: false,
  setOnionSkin: (onionSkin) => set((state) => ({ onionSkin: typeof onionSkin === 'function' ? onionSkin(state.onionSkin) : onionSkin })),

  isPlaying: false,
  setIsPlaying: (isPlaying) => set((state) => ({ isPlaying: typeof isPlaying === 'function' ? isPlaying(state.isPlaying) : isPlaying })),
  
  fps: 12,
  setFps: (fps) => set({ fps }),

  selectedFrameId: 'frame-1',
  setSelectedFrameId: (id) => set({ selectedFrameId: id }),
  
  selectedLayerId: 'layer-1',
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  isTimelineExpanded: false,
  setIsTimelineExpanded: (expandedAction) => set((state) => ({
    isTimelineExpanded: typeof expandedAction === 'function' ? expandedAction(state.isTimelineExpanded) : expandedAction
  })),
}));
