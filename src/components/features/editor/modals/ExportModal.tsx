'use client';
import { AnimationState } from '@/lib/models/animation';
import { exportGIF } from '@/lib/utils/export/gif';
import { exportPNG } from '@/lib/utils/export/png';
import { renderFrameToCanvas } from '@/lib/utils/export/render';
import { exportSVG } from '@/lib/utils/export/svg';
import { Download, Maximize2, Pause, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useEditorStore } from '@/hooks/useEditorStore';

const JSZIP_URL = 'https://esm.sh/jszip';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AnimationState;
  projectName: string;
  initialFormat?: 'png' | 'gif' | 'svg';
}

export function ExportModal({ isOpen, onClose, state, projectName, initialFormat }: ExportModalProps) {
  const { gridSize } = useEditorStore();
  const [format, setFormat] = useState<'png' | 'gif' | 'svg' | 'zip'>(initialFormat || 'png');
  const [scale, setScale] = useState(4); // Default 4x
  const [includeBackground, setIncludeBackground] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fps, setFps] = useState(12);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [startFrameIndex, setStartFrameIndex] = useState(0);
  const [endFrameIndex, setEndFrameIndex] = useState(state.frames.length - 1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentFrameIndex(startFrameIndex);
      if (initialFormat) {
        setFormat(initialFormat);
        setIsPlaying(initialFormat === 'gif');
      } else {
        setIsPlaying(format === 'gif');
      }
    }
  }, [isOpen, initialFormat, startFrameIndex]);

  // Preview Animation Loop
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const renderPreview = (timestamp: number) => {
      const frameIndex = (format === 'gif' || format === 'zip') ? currentFrameIndex : selectedFrameIndex;
      const frame = state.frames[frameIndex] || state.frames[0];
      
      if (frame) {
        const sourceCanvas = renderFrameToCanvas({
          state,
          frameId: frame.id,
          gridSize,
          includeBackground,
          bgColor
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sourceCanvas, 0, 0, gridSize, gridSize, 0, 0, canvas.width, canvas.height);
      }

      if ((format === 'gif' || format === 'zip') && isPlaying) {
        const elapsed = timestamp - lastFrameTimeRef.current;
        const frameDuration = 1000 / fps;

        if (elapsed >= frameDuration) {
          setCurrentFrameIndex((prev) => {
            const next = prev + 1;
            return next > endFrameIndex || next < startFrameIndex ? startFrameIndex : next;
          });
          lastFrameTimeRef.current = timestamp;
        }
      }

      // @ts-ignore
      animationRef.current = window.requestAnimationFrame(renderPreview);
    };

    // @ts-ignore
    animationRef.current = window.requestAnimationFrame(renderPreview);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, format, currentFrameIndex, selectedFrameIndex, isPlaying, fps, state, gridSize, includeBackground, bgColor]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const frameIndex = format === 'gif' ? currentFrameIndex : selectedFrameIndex;
    const frame = state.frames[frameIndex] || state.frames[0];
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'untitled';

    try {
      let url = '';
      let filename = '';

      if (format === 'png') {
        url = await exportPNG({
          state,
          frameId: frame.id,
          gridSize,
          scale,
          includeBackground,
          bgColor
        });
        filename = `${sanitizedName}.png`;
      } else if (format === 'gif') {
        url = await exportGIF({
          state,
          gridSize,
          scale,
          fps,
          includeBackground,
          bgColor,
          onProgress: (p) => setExportProgress(p),
          startFrame: startFrameIndex,
          endFrame: endFrameIndex
        });
        filename = `${sanitizedName}.gif`;
      } else if (format === 'svg') {
        url = await exportSVG({
          state,
          frameId: frame.id,
          gridSize,
          includeBackground,
          bgColor
        });
        filename = `${sanitizedName}.svg`;
      } else if (format === 'zip') {
        // Dynamically import JSZip
        // @ts-ignore
        const JSZip = (await import(JSZIP_URL)).default;
        const zip = new JSZip();

        const totalToExport = endFrameIndex - startFrameIndex + 1;

        for (let i = startFrameIndex; i <= endFrameIndex; i++) {
          const f = state.frames[i];
          const dataUrl = await exportPNG({
            state,
            frameId: f.id,
            gridSize,
            scale,
            includeBackground,
            bgColor
          });

          // Convert data URL to base64
          const base64Data = dataUrl.split(',')[1];
          zip.file(`frame_${i + 1}.png`, base64Data, { base64: true });

          setExportProgress((i - startFrameIndex + 1) / totalToExport);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        url = URL.createObjectURL(content);
        filename = `${sanitizedName}.zip`;
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up object URLs (except for PNG which is data URL)
      if (format !== 'png') {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl border border-border bg-background shadow-2xl flex flex-col md:flex-row h-[80vh] max-h-[600px]" onClick={(e) => e.stopPropagation()}>
        
        {/* Left Side: Preview */}
        <div className="flex-1 bg-[#050505] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border relative">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-muted" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Preview</span>
          </div>

          <div className="relative border border-border/50 bg-[#0B0B0B] p-2">
            <canvas
              ref={previewCanvasRef}
              width={gridSize * 8} // Fixed preview size
              height={gridSize * 8}
              className="image-rendering-pixelated"
              style={{
                width: 256,
                height: 256,
                imageRendering: 'pixelated'
              }}
            />
          </div>

          {(format === 'gif' || format === 'zip') && (
            <div className="mt-4 flex items-center gap-2 bg-panel border border-border rounded p-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 hover:text-accent transition-colors"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <span className="text-[10px] font-bold tracking-widest text-text">
                {currentFrameIndex + 1 - startFrameIndex} / {endFrameIndex - startFrameIndex + 1}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Settings */}
        <div className="w-full md:w-[320px] flex flex-col bg-panel">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Export Setup</span>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:opacity-50 text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
            
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Format</label>
              <div className="grid grid-cols-4 gap-1">
                {(['png', 'svg', 'gif', 'zip'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      format === f 
                        ? 'border-accent text-accent bg-accent/5' 
                        : 'border-border text-muted hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Selector (PNG/SVG only) */}
            {(format === 'png' || format === 'svg') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Frame</label>
                <div className="flex items-center border border-border bg-background/50 w-fit">
                  <button
                    onClick={() => setSelectedFrameIndex(p => Math.max(0, p - 1))}
                    disabled={selectedFrameIndex === 0}
                    className={`px-3 py-1.5 text-muted hover:text-foreground transition-colors ${
                      selectedFrameIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  >
                    &lt;
                  </button>
                  <span className="px-4 py-1.5 text-[10px] font-bold text-foreground border-l border-r border-border min-w-[40px] text-center">
                    {selectedFrameIndex + 1}
                  </span>
                  <button
                    onClick={() => setSelectedFrameIndex(p => Math.min(state.frames.length - 1, p + 1))}
                    disabled={selectedFrameIndex === state.frames.length - 1}
                    className={`px-3 py-1.5 text-muted hover:text-foreground transition-colors ${
                      selectedFrameIndex === state.frames.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Range Selector (GIF/ZIP only) */}
            {(format === 'gif' || format === 'zip') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Frame Range</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground">Start</span>
                    <input
                      type="number"
                      min="1"
                      max={endFrameIndex + 1}
                      value={startFrameIndex + 1}
                      onChange={(e) => setStartFrameIndex(Math.max(0, Number(e.target.value) - 1))}
                      className="bg-background border border-border px-2 py-1 text-[10px] font-bold text-foreground w-full"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground">End</span>
                    <input
                      type="number"
                      min={startFrameIndex + 1}
                      max={state.frames.length}
                      value={endFrameIndex + 1}
                      onChange={(e) => setEndFrameIndex(Math.min(state.frames.length - 1, Number(e.target.value) - 1))}
                      className="bg-background border border-border px-2 py-1 text-[10px] font-bold text-foreground w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scale Selector (PNG/GIF/ZIP only) */}
            {format !== 'svg' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Scale</label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 4, 8].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`py-1.5 text-[10px] font-bold border transition-colors ${
                        scale === s 
                          ? 'border-accent text-accent bg-accent/5' 
                          : 'border-border text-muted hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">
                  Resolution: {gridSize * scale}x{gridSize * scale}
                </div>
              </div>
            )}

            {/* Background Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Background</label>
              <div className="flex items-center justify-between border border-border p-2 bg-background/50">
                <span className="text-[10px] font-bold tracking-wider text-foreground">Opaque Background</span>
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="accent-accent"
                />
              </div>
              
              {includeBackground && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 bg-background border border-border px-2 py-1 text-[10px] font-bold text-foreground"
                  />
                </div>
              )}
            </div>

            {/* FPS Control (GIF only) */}
            {format === 'gif' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Speed (FPS)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-[10px] font-bold tracking-widest text-text w-6 text-right">
                    {fps}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 ${
                isExporting 
                  ? 'bg-border text-muted cursor-not-allowed' 
                  : 'bg-accent text-black hover:bg-accent-hover'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Exporting {Math.round(exportProgress * 100)}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
