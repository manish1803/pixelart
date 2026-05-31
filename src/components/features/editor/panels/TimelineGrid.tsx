'use client';
import { AnimationState, findCel } from '@/lib/models/animation';
import { Copy, Image, Pause, Play, Plus, SkipBack, SkipForward, Trash2 } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '@/hooks/useEditorStore';

interface FramesGridProps {
  state: AnimationState;
  addLayer: (id: string, name: string) => void;
  addFrame: (id: string, copyFromId?: string) => void;
  onDeleteFrame: (id: string) => void;
  unlinkCel: (frameId: string, layerId: string) => void;
  updateThumbnail?: (frameId: string) => void;
  darkMode: boolean;
}

const FrameThumbnail = ({ frame, state, gridSize, darkMode }: { frame: { id: string }; state: AnimationState; gridSize: number; darkMode: boolean }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / gridSize;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = darkMode ? '#0B0B0B' : '#f9f9f9';
    ctx.fillRect(0, 0, size, size);

    state.layers.forEach((layer) => {
      if (!layer.isVisible) return;
      const cel = findCel(state, frame.id, layer.id);
      if (!cel) return;
      const celData = state.celData[cel.dataId];
      if (!celData) return;

      ctx.save();
      if (cel.transform) {
        ctx.translate(cel.transform.x * cellSize, cel.transform.y * cellSize);
        if (cel.transform.rotation) {
          const center = (gridSize / 2) * cellSize;
          ctx.translate(center, center);
          ctx.rotate((cel.transform.rotation * Math.PI) / 180);
          ctx.translate(-center, -center);
        }
      }

      Object.entries(celData.pixels || {}).forEach(([key, color]) => {
        if (!color) return;
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
      ctx.restore();
    });
  }, [frame, state, gridSize, darkMode]);

  return <canvas ref={canvasRef} width={100} height={100} className="w-full h-full [image-rendering:pixelated]" />;
};

export function FramesGrid({
  state,
  addLayer,
  addFrame,
  onDeleteFrame,
  unlinkCel,
  updateThumbnail,
  darkMode,
}: FramesGridProps) {
  const {
    isPlaying, setIsPlaying,
    selectedFrameId: selectedFrame,
    setSelectedFrameId: setSelectedFrame,
    selectedLayerId: selectedLayer,
    setSelectedLayerId: setSelectedLayer,
    gridSize,
    fps,
  } = useEditorStore();


  return (
    <div className="bg-background border-t border-border flex flex-col h-52 overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const currentIndex = state.frames.findIndex(f => f.id === selectedFrame);
              if (currentIndex > 0) {
                setSelectedFrame(state.frames[currentIndex - 1].id);
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-panel rounded-lg transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-panel rounded-lg transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => {
              const currentIndex = state.frames.findIndex(f => f.id === selectedFrame);
              if (currentIndex < state.frames.length - 1) {
                setSelectedFrame(state.frames[currentIndex + 1].id);
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-panel rounded-lg transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-border mx-2" />
          
          <span className="text-xs text-muted">FPS: {fps}</span>
        </div>
      </div>

      {/* Frame Strip */}
      <div className="flex-1 flex overflow-x-auto scrollbar-none bg-zinc-950 p-2 gap-2">
        {state.frames.map((frame, index) => {
          const isThumbnail = state.thumbnailFrameId === frame.id || (!state.thumbnailFrameId && index === 0);
          return (
            <div 
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className="cursor-pointer shrink-0 group"
            >
              <div className={`w-32 h-32 bg-background border flex flex-col items-center justify-center relative shadow-inner ${
                selectedFrame === frame.id ? 'border-white' : 'border-border'
              }`}>
                {/* Thumbnail Indicator */}
                {isThumbnail && (
                  <div className="absolute top-1 left-1 text-accent" title="Project Thumbnail">
                    <Image className="w-3 h-3" />
                  </div>
                )}

                {/* Hover Controls */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateThumbnail?.(frame.id);
                    }}
                    className={`p-1 bg-panel border border-border rounded hover-accent ${
                      isThumbnail ? 'text-accent border-accent' : ''
                    }`}
                    title="Set as Thumbnail"
                  >
                    <Image className="w-3 h-3" />
                  </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addFrame(`frame-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, frame.id); // Duplicate
                  }}
                  className="p-1 bg-panel border border-border rounded hover-accent"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFrame(frame.id);
                  }}
                  className="p-1 bg-panel border border-border rounded hover:bg-red-600 hover:text-white transition-colors text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="cursor-move p-1 bg-panel border border-border rounded">
                  <span className="text-[10px] font-bold text-muted">::</span>
                </div>
              </div>

              <div className="flex-1 w-full h-full overflow-hidden">
                <FrameThumbnail frame={frame} state={state} gridSize={gridSize} darkMode={darkMode} />
              </div>
              
              {/* Frame Number at bottom */}
              <div className="w-full h-6 border-t border-border flex items-center justify-center bg-panel/50 text-[10px] font-bold text-foreground">
                {index + 1}
              </div>
            </div>
          </div>
        );
        })}
        {/* Add Frame Button as a card! */}
        <div className="cursor-pointer shrink-0" onClick={() => addFrame(`frame-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)}>
          <div className="w-32 h-32 border border-dashed border-border flex flex-col items-center justify-center text-muted hover:text-foreground hover:border-accent transition-colors bg-panel/10">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Frame</span>
          </div>
        </div>
        <div className="flex-1" />
      </div>

    </div>
  );
}
