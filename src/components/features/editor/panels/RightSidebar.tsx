'use client';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { PanelContainer, PanelFooter, PanelSection } from '@/components/shared/PanelBase';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { DiscreteSlider } from '@/components/ui/DiscreteSlider';
import { Tooltip } from '@/components/ui/Tooltip';
import { AnimationState, findCel } from '@/lib/models/animation';
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/hooks/useEditorStore';
interface Frame {
  id: string | number;
  pixels: { [key: string]: string };
}

interface RightSidebarProps {
  state: AnimationState;
  
  // Existing Props
  frames: Frame[];
  currentFrame: number;
  darkMode: boolean;

  // Layer Properties
  updateLayerOpacity: (layerId: string, opacity: number) => void;
  updateLayerBlendMode: (layerId: string, blendMode: GlobalCompositeOperation) => void;
  onSaveTemplate?: () => void;
}

export function RightSidebar({
  frames,
  currentFrame,
  darkMode,
  state,
  updateLayerOpacity,
  updateLayerBlendMode,
  onSaveTemplate,
}: RightSidebarProps) {
  const {
    tool, setTool,
    color, setColor,
    brushSize, setBrushSize,
    mirrorMode, setMirrorMode,
    recentColors, addRecentColor,
    activePalette,
    gridSize, setGridSize,
    onionSkin, setOnionSkin,
    isPlaying, fps,
    selectedLayerId
  } = useEditorStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'preview'>('tools');
  const selectedLayer = state.layers.find(l => l.id === selectedLayerId);

  const [previewFrame, setPreviewFrame] = useState(0);

  // Sync preview frame with current frame when not playing
  useEffect(() => {
    if (!isPlaying) {
      setPreviewFrame(currentFrame);
    }
  }, [currentFrame, isPlaying]);

  // Animation loop for preview
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (now: number) => {
      const delta = now - lastTime;
      const interval = 1000 / fps;

      if (delta >= interval) {
        setPreviewFrame((prev) => (prev + 1) % frames.length);
        lastTime = now - (delta % interval); // Keep timing accurate!
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, fps, frames.length]);

  // Render Preview Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / gridSize;

    const drawFrame = (index: number, alpha: number) => {
      const frame = state.frames[index];
      if (!frame) return;
      ctx.globalAlpha = alpha;

      state.layers.forEach((layer) => {
        if (!layer.isVisible) return;
        const cel = findCel(state, frame.id, layer.id);
        if (!cel) return;
        const celData = state.celData[cel.dataId];
        if (!celData) return;

        ctx.save();
        if (cel.transform) {
          ctx.translate(cel.transform.x * cellSize, cel.transform.y * cellSize);
        }

        Object.entries(celData.pixels || {}).forEach(([key, color]) => {
          if (!color) return;
          const [x, y] = key.split(',').map(Number);
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        });
        ctx.restore();
      });
    };

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = darkMode ? '#0B0B0B' : '#f9f9f9';
    ctx.fillRect(0, 0, size, size);

    if (onionSkin) {
      if (previewFrame > 0) drawFrame(previewFrame - 1, 0.3);
      if (previewFrame < frames.length - 1) drawFrame(previewFrame + 1, 0.15);
    }

    drawFrame(previewFrame, 1.0);
    ctx.globalAlpha = 1.0;
  }, [frames, previewFrame, gridSize, darkMode, onionSkin]);

  const handlePickColor = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result.sRGBHex) {
          setColor(result.sRGBHex);
          addRecentColor(result.sRGBHex);
        }
      } catch (e) {
        setTool('picker');
      }
    } else {
      setTool('picker');
    }
  };

  return (
    <PanelContainer side="right" width="w-80">
      
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('tools')}
          onMouseUp={(e) => e.currentTarget.blur()}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'tools' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-foreground'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          onMouseUp={(e) => e.currentTarget.blur()}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'preview' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-foreground'
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tools' && (
          <>
            {/* Layer Properties */}
            <PanelSection title="Layer Properties">
              {selectedLayer ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Opacity</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}
                        onChange={(e) => updateLayerOpacity(selectedLayer.id, parseInt(e.target.value))}
                        className="w-24 h-1"
                      />
                      <span className="text-xs w-8 text-right">{selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Blend Mode</span>
                    <select
                      value={selectedLayer.blendMode || 'source-over'}
                      onChange={(e) => updateLayerBlendMode(selectedLayer.id, e.target.value as GlobalCompositeOperation)}
                      className="bg-panel border border-border rounded text-xs px-2 py-1"
                    >
                      <option value="source-over">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted text-center py-2">No Layer Selected</div>
              )}
            </PanelSection>

            {/* 1. TOOLS */}
            <PanelSection title="Tools">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Onion Skin</span>
                <button
                  onClick={() => setOnionSkin(!onionSkin)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${onionSkin ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transform transition-transform ${onionSkin ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <Tooltip content="Fill Tool" shortcut="F" className="flex-1">
                  <button
                    onClick={() => setTool('fill')}
                    onMouseUp={(e) => e.currentTarget.blur()}
                    className={`w-full py-2 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      tool === 'fill' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
                    }`}
                  >
                    DRAW
                  </button>
                </Tooltip>
                <Tooltip content="Erase Tool" shortcut="E" className="flex-1">
                  <button
                    onClick={() => setTool('erase')}
                    onMouseUp={(e) => e.currentTarget.blur()}
                    className={`w-full py-2 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      tool === 'erase' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
                    }`}
                  >
                    ERASE
                  </button>
                </Tooltip>
                <Tooltip content="Selection Tool" shortcut="S" className="flex-1">
                  <button
                    onClick={() => setTool('selection')}
                    onMouseUp={(e) => e.currentTarget.blur()}
                    className={`w-full py-2 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      tool === 'selection' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
                    }`}
                  >
                    SELECT
                  </button>
                </Tooltip>
              </div>

              <ColorPicker 
                color={color} 
                setColor={setColor} 
                recentColors={recentColors} 
                addRecentColor={addRecentColor} 
                activePalette={activePalette}
                darkMode={darkMode} 
                onPickColor={handlePickColor}
                isPickerActive={tool === 'picker'}
              />

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Brush Size</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={brushSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 16) {
                          setBrushSize(val);
                        }
                      }}
                      className="w-12 bg-transparent border border-border text-[10px] font-bold text-foreground p-1 text-center focus:outline-none focus:border-accent"
                      min={1}
                      max={16}
                    />
                    <span className="text-[10px] font-bold text-foreground opacity-40">PX</span>
                  </div>
                </div>
                <DiscreteSlider 
                  value={brushSize}
                  min={1}
                  max={16}
                  onChange={setBrushSize}
                />
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 block">Symmetry</span>
                <div className="flex gap-1 border border-border bg-panel/30 p-1">
                  <button
                    onClick={() => setMirrorMode?.('none')}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest transition-colors ${
                      mirrorMode === 'none' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    NONE
                  </button>
                  <button
                    onClick={() => setMirrorMode?.('vertical')}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest transition-colors ${
                      mirrorMode === 'vertical' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    |
                  </button>
                  <button
                    onClick={() => setMirrorMode?.('horizontal')}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest transition-colors ${
                      mirrorMode === 'horizontal' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    —
                  </button>
                  <button
                    onClick={() => setMirrorMode?.('both')}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest transition-colors ${
                      mirrorMode === 'both' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </PanelSection>
          </>
        )}

        {activeTab === 'preview' && (
          <>
            {/* 2. PREVIEW */}
            <PanelSection title="Preview">
              <div className="border border-border aspect-square flex items-center justify-center relative overflow-hidden bg-panel">
                <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:10px_10px] text-foreground" />
                <canvas 
                  ref={canvasRef}
                  width={200}
                  height={200}
                  className="relative z-10 [image-rendering:pixelated] w-full h-full"
                />
              </div>
            </PanelSection>



            {/* 4. DOCUMENT */}
            <PanelSection title="Document">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Canvas Size</span>
                  <CustomNumberInput 
                    value={`${gridSize} X ${gridSize}`}
                    onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
                    onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
                  />
                </div>
                {onSaveTemplate && (
                  <button 
                    onClick={onSaveTemplate}
                    className="w-full mt-2 px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-panel transition-colors"
                  >
                    Save as Template
                  </button>
                )}
              </div>
            </PanelSection>


          </>
        )}
      </div>

      <PanelFooter />
    </PanelContainer>
  );
}
