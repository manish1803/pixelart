'use client';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CanvasAreaProps {
  projectName: string;
  setProjectName: (name: string) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  toyMode: boolean;
  setToyMode: (value: boolean) => void;
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  mirrorMode?: 'none' | 'vertical' | 'horizontal' | 'both';
  onionSkin?: boolean;
  previousFramePixels?: { [key: string]: string };
  pixels: { [key: string]: string };
  setPixels: (pixels: { [key: string]: string }) => void;
  darkMode: boolean;
  onSave: () => void;
  saving: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export const CanvasArea = React.memo(function CanvasArea({
  projectName,
  setProjectName,
  gridSize,
  setGridSize,
  toyMode,
  setToyMode,
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  mirrorMode = 'none',
  onionSkin = false,
  previousFramePixels,
  pixels,
  setPixels,
  darkMode,
  onSave,
  saving,
  zoom,
  setZoom,
  pan,
  setPan,
}: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Panning UI State
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [exportOpen, setExportOpen] = useState(false);

  const canvasSize = 600;
  const cellSize = canvasSize / gridSize;
  const canvasBg = darkMode ? '#000' : '#fff';

  useEffect(() => {
    drawCanvas();
  }, [pixels, gridSize, darkMode, toyMode, mirrorMode, onionSkin, previousFramePixels]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !spacePressed) {
        // Only prevent default if we are not in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSpacePressed(true);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw Onion Skin (Previous Frame)
    if (onionSkin && previousFramePixels) {
      ctx.globalAlpha = 0.3;
      Object.entries(previousFramePixels).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
      ctx.globalAlpha = 1.0;
    }

    if (toyMode) {
      const defaultColor = darkMode ? '#1a1a1a' : '#ffffff';
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const key = `${x},${y}`;
          const pColor = pixels[key] || defaultColor;

          // Base block
          ctx.fillStyle = pColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

          const centerX = x * cellSize + cellSize / 2;
          const centerY = y * cellSize + cellSize / 2;
          const radius = cellSize * 0.35;

          // Drop shadow for the stud
          ctx.beginPath();
          ctx.arc(centerX + cellSize * 0.04, centerY + cellSize * 0.04, radius, 0, Math.PI * 2);
          ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
          ctx.fill();

          // Main stud circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.fill();

          // 3D Highlight
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          const grad = ctx.createLinearGradient(
            centerX - radius, centerY - radius, 
            centerX + radius, centerY + radius
          );
          grad.addColorStop(0, darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    } else {
      // Draw standard pixels
      Object.entries(pixels).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    }

    // Draw grid
    ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      const pos = Math.round(i * cellSize);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize, pos);
      ctx.stroke();
    }

    // Draw Symmetry Guides
    if (mirrorMode !== 'none') {
      ctx.strokeStyle = darkMode ? 'rgba(0, 255, 255, 0.4)' : 'rgba(0, 150, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (mirrorMode === 'vertical' || mirrorMode === 'both') {
        const center = (gridSize / 2) * cellSize;
        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, canvasSize);
        ctx.stroke();
      }

      if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
        const center = (gridSize / 2) * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, center);
        ctx.lineTo(canvasSize, center);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom centered on pointer would be nice, but simple zoom is MVP
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.5, Math.min(10, z * delta)));
  };

  const handleMouseDownWrapper = (e: React.MouseEvent) => {
    if (spacePressed) {
      e.stopPropagation();
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMoveWrapper = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUpWrapper = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));
    
    if (tool === 'picker') {
      const pickedColor = pixels[`${x},${y}`] || (darkMode ? '#000000' : '#ffffff');
      setColor(pickedColor);
      setTool('fill');
      return;
    }
    
    const newPixels = { ...pixels };
    const radius = Math.floor(brushSize / 2);
    const start = brushSize % 2 === 0 ? -radius : -radius;
    const end = brushSize % 2 === 0 ? radius - 1 : radius;

    for (let dx = start; dx <= end; dx++) {
      for (let dy = start; dy <= end; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        
        const applyPixel = (px: number, py: number) => {
          if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
            if (tool === 'erase') {
              delete newPixels[`${px},${py}`];
            } else {
              newPixels[`${px},${py}`] = color;
            }
          }
        };

        applyPixel(nx, ny);

        if (mirrorMode === 'vertical' || mirrorMode === 'both') {
          applyPixel(gridSize - 1 - nx, ny);
        }
        if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
          applyPixel(nx, gridSize - 1 - ny);
        }
        if (mirrorMode === 'both') {
          applyPixel(gridSize - 1 - nx, gridSize - 1 - ny);
        }
      }
    }
    setPixels(newPixels);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleCanvasClick(e);
  };

  const handleClear = () => {
    setPixels({});
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${projectName || 'pixel-art'}.png`;
    link.href = canvas.toDataURL();
    link.click();
    setExportOpen(false);
  };

  const handleExportSVG = () => {
    const svgSize = gridSize * 10;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridSize} ${gridSize}" width="${svgSize}" height="${svgSize}">`;
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
    });
    svgContent += `</svg>`;
    
    const blob = new Blob([svgContent], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${projectName || 'pixel-art'}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };


  const getCursor = () => {
    if (tool === 'picker') {
      const stroke = darkMode ? 'white' : 'black';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>`;
      return `url("data:image/svg+xml;base64,${btoa(svg)}") 2 22, crosshair`;
    }
    return 'crosshair';
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col p-8 bg-background transition-colors duration-300">


      <div 
        className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDownWrapper}
        onMouseMove={handleMouseMoveWrapper}
        onMouseUp={handleMouseUpWrapper}
        onMouseLeave={handleMouseUpWrapper}
        style={{ cursor: spacePressed ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={(e) => {
            if (!spacePressed) {
              setIsDrawing(true);
              handleCanvasClick(e);
            }
          }}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={handleCanvasMove}
          className="border border-border shadow-2xl max-w-full max-h-full object-contain [image-rendering:pixelated]"
          style={{ 
            cursor: spacePressed ? 'inherit' : getCursor(),
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            width: 'auto', 
            height: 'auto', 
            maxWidth: '100%', 
            maxHeight: '100%' 
          }}
        />

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 bg-panel/80 backdrop-blur-sm border border-border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-foreground shadow-lg pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 shrink-0">

        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">CANVAS SIZE</div>
            <div className="w-40">
              <CustomNumberInput 
                value={`${gridSize} X ${gridSize}`}
                onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
                onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">TOY MODE</div>
            <button 
              onClick={() => setToyMode(!toyMode)}
              className={`w-12 h-6 border border-border flex items-center px-1 transition-colors ${
                toyMode ? 'bg-panel' : 'bg-transparent'
              }`}
            >
              <div 
                className={`w-4 h-4 transition-transform shadow-sm ${
                  toyMode ? 'translate-x-6 bg-foreground' : 'translate-x-0 bg-muted'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end">
          

          <button
            onClick={handleClear}
            className="border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider hover-accent text-foreground bg-transparent"
          >
            Clear
          </button>



          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={`border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider hover-accent flex items-center gap-2 text-foreground ${
                exportOpen ? 'bg-panel' : 'bg-transparent'
              }`}
            >
              <span>Export</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${exportOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            
            
            {exportOpen && (
              <div className="absolute bottom-full mb-2 right-0 border border-border bg-panel flex flex-col min-w-[120px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
                <button onClick={handleExportPNG} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider hover-accent border-b border-border text-foreground">
                  Export PNG
                </button>
                <button onClick={handleExportSVG} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider hover-accent text-foreground">
                  Export SVG
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider hover-accent text-foreground bg-panel/30 flex items-center gap-2 group disabled:opacity-50"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-accent animate-pulse' : 'bg-foreground group-hover:bg-accent'}`} />
            <span>{saving ? 'Saving...' : 'Save Project'}</span>
          </button>


        </div>
      </div>
    </div>
  );
});
