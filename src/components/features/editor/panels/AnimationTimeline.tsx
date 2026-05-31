'use client';
import { Reorder } from 'framer-motion';
import { Copy, GripVertical, Pause, Play, SkipBack, SkipForward, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface AnimationTimelineProps {
  frames: Frame[];
  setFrames: (frames: Frame[]) => void;
  currentFrame: number;
  setCurrentFrame: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  gridSize: number;
  darkMode: boolean;
}

export function AnimationTimeline({ 
  frames, 
  setFrames,
  currentFrame, 
  setCurrentFrame, 
  isPlaying,
  setIsPlaying,
  fps,
  setFps,
  onAddFrame, 
  onDuplicateFrame, 
  onDeleteFrame, 
  gridSize, 
  darkMode 
}: AnimationTimelineProps) {
  const playbackRef = useRef<number>(currentFrame);

  // Sync playback ref with prop
  useEffect(() => {
    playbackRef.current = currentFrame;
  }, [currentFrame]);

  // Animation Playback Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextFrame = (playbackRef.current + 1) % frames.length;
      playbackRef.current = nextFrame;
      setCurrentFrame(nextFrame);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length, fps, setCurrentFrame]);

  return (
    <div className="border-t border-border p-4 bg-background shrink-0 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <Reorder.Group 
            axis="x" 
            values={frames} 
            onReorder={setFrames}
            className="flex items-center gap-4 flex-nowrap h-full pr-8"
        >
          {frames.map((frame, index) => (
            <Reorder.Item 
                key={frame.id} 
                value={frame}
                className="relative group shrink-0"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 bg-panel border border-border rounded px-2 py-0.5 shadow-md flex items-center gap-1">
                 <GripVertical className="w-3 h-3 text-foreground" />
                 <span className="text-[8px] font-bold uppercase tracking-widest text-foreground">Drag</span>
              </div>
              
              <button
                onClick={() => setCurrentFrame(index)}
                className={`flex-shrink-0 w-24 h-28 border transition-all flex flex-col overflow-hidden ${
                  currentFrame === index ? 'border-foreground ring-1 ring-foreground' : 'border-border'
                } bg-panel`}
              >
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-1 bg-background">
                  {/* Real pixel preview */}
                  <div 
                    className="grid h-full aspect-square [image-rendering:pixelated]" 
                    style={{ 
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                      width: '100%',
                    }}
                  >
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                      const x = i % gridSize;
                      const y = Math.floor(i / gridSize);
                      const color = frame.pixels[`${x},${y}`];
                      return (
                        <div 
                          key={i} 
                          style={{ backgroundColor: color || 'transparent' }} 
                        />
                      );
                    })}
                  </div>
                </div>
                <div className={`h-8 border-t border-border flex items-center justify-center font-bold text-xs text-foreground ${
                  currentFrame === index ? 'bg-panel' : 'bg-transparent'
                }`}>
                  {index + 1}
                </div>
              </button>

              {/* Quick Actions */}
              <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDuplicateFrame(index); }}
                  className="p-1.5 bg-panel border border-border rounded shadow-lg hover-accent"
                  title="Duplicate Frame"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {frames.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFrame(index); }}
                    className="p-1.5 bg-panel border border-border rounded shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete Frame"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}

          <button
            onClick={onAddFrame}
            className="flex-shrink-0 w-24 h-28 border border-dashed border-border flex items-center justify-center hover-accent text-muted"
          >
            <span className="text-2xl font-light">+</span>
          </button>
        </Reorder.Group>
      </div>

      <div className="flex justify-between items-center mt-2 shrink-0 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentFrame((currentFrame - 1 + frames.length) % frames.length)}
            className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted shadow-sm bg-panel"
            title="Previous Frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-foreground shadow-sm bg-panel"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => setCurrentFrame((currentFrame + 1) % frames.length)}
            className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted shadow-sm bg-panel"
            title="Next Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-2 ml-4 px-3 py-1 border border-border bg-panel shadow-sm">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted">FPS</span>
             <input
               type="number"
               min={1}
               max={60}
               value={fps}
               onChange={(e) => setFps(Math.max(1, Math.min(60, Number(e.target.value))))}
               className="w-8 bg-transparent border-none text-[10px] font-bold text-foreground text-right focus:outline-none"
             />
          </div>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-foreground">
          Drag to reorder. Hover over frames for action
        </div>
      </div>
    </div>
  );
}
