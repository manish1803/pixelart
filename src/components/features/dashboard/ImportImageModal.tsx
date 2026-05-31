import { applyDithering, convertImageDataToLayersByColor, convertImageDataToProjectPixels, mapToPalette, pixelateImage, reduceColors } from '@/lib/image-processor';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const PALETTES: { [key: string]: string[] } = {
  gameboy: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  pico8: ['#000000', '#1D2B53', '#7E2553', '#008751', '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8', '#FF004D', '#FFA300', '#FFEC27', '#00E436', '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'],
  nes: ['#7C7C7C', '#0054FF', '#2800FF', '#D800CC', '#E40058', '#E40000', '#D83800', '#B45400', '#887000', '#009600', '#00A800', '#008800', '#004040', '#000000', '#000000', '#000000']
};

interface ImportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (layers: { [key: string]: string }[], gridSize: number, palette: string[]) => void;
}

export function ImportImageModal({ isOpen, onClose, onImport }: ImportImageModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(32);
  const [maxColors, setMaxColors] = useState(16);
  const [smoothing, setSmoothing] = useState(0);
  const [useDithering, setUseDithering] = useState(false);
  const [resizeMode, setResizeMode] = useState<'fit' | 'crop' | 'stretch' | 'aspect'>('fit');
  const [importAsLayers, setImportAsLayers] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState('custom');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        processImage(result, gridSize, maxColors);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = (imageSrc: string, size: number, colors: number, smooth: number = smoothing, dither: boolean = useDithering, mode: 'fit' | 'crop' | 'stretch' | 'aspect' = resizeMode, paletteKey: string = selectedPalette) => {
    setProcessing(true);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      let imageData = pixelateImage(img, size, smooth, mode);
      
      let finalPalette: string[] = [];
      if (paletteKey === 'custom') {
        const reducedData = reduceColors(imageData, colors);
        const { palette } = convertImageDataToProjectPixels(reducedData);
        finalPalette = palette;
        if (dither) {
          imageData = applyDithering(imageData, finalPalette);
        } else {
          imageData = reducedData;
        }
      } else {
        finalPalette = PALETTES[paletteKey];
        if (dither) {
          imageData = applyDithering(imageData, finalPalette);
        } else {
          imageData = mapToPalette(imageData, finalPalette);
        }
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(imageData, 0, 0);
      }
      setProcessing(false);
    };
  };

  const handleImport = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
      
      if (importAsLayers) {
        const { layers, palette } = convertImageDataToLayersByColor(imageData);
        onImport(Object.values(layers), gridSize, palette);
      } else {
        const { pixels, palette } = convertImageDataToProjectPixels(imageData);
        onImport([pixels], gridSize, palette);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Import Image</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Upload & Preview */}
          <div className="space-y-4">
            <div 
              className="aspect-square bg-background border border-border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain [image-rendering:pixelated]" 
                />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted mb-2" />
                  <span className="text-xs font-medium text-foreground">Click to upload</span>
                  <span className="text-[10px] text-muted mt-1">or drag and drop</span>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Grid Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Grid Size</label>
                <span className="text-xs font-bold text-foreground">{gridSize}x{gridSize}</span>
              </div>
              <input
                type="range"
                min="16"
                max="128"
                step="16"
                value={gridSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setGridSize(val);
                  if (selectedImage) processImage(selectedImage, val, maxColors);
                }}
                className="w-full accent-accent"
              />
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Max Colors</label>
                <span className="text-xs font-bold text-foreground">{maxColors}</span>
              </div>
              <input
                type="range"
                min="2"
                max="64"
                step="2"
                value={maxColors}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMaxColors(val);
                  if (selectedImage) processImage(selectedImage, gridSize, val, smoothing, useDithering);
                }}
                className="w-full accent-accent"
              />
            </div>

            {/* Smoothing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">Smoothing</label>
                <span className="text-xs font-bold text-foreground">{smoothing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={smoothing}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSmoothing(val);
                  if (selectedImage) processImage(selectedImage, gridSize, maxColors, val, useDithering);
                }}
                className="w-full accent-accent"
              />
            </div>

            {/* Dithering */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Use Dithering</label>
              <input
                type="checkbox"
                checked={useDithering}
                onChange={(e) => {
                  const val = e.target.checked;
                  setUseDithering(val);
                  if (selectedImage) processImage(selectedImage, gridSize, maxColors, smoothing, val);
                }}
                className="w-4 h-4 accent-accent"
              />
            </div>

            {/* Target Palette */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Target Palette</label>
              <select
                value={selectedPalette}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPalette(val);
                  if (selectedImage) processImage(selectedImage, gridSize, maxColors, smoothing, useDithering, resizeMode, val);
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="custom">Custom (Extract from image)</option>
                <option value="gameboy">Game Boy</option>
                <option value="pico8">PICO-8</option>
                <option value="nes">NES</option>
              </select>
            </div>

            {/* Resize Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Resize Mode</label>
              <select
                value={resizeMode}
                onChange={(e) => {
                  const val = e.target.value as 'fit' | 'crop' | 'stretch' | 'aspect';
                  setResizeMode(val);
                  if (selectedImage) processImage(selectedImage, gridSize, maxColors, smoothing, useDithering, val);
                }}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="fit">Fit to canvas</option>
                <option value="crop">Crop center</option>
                <option value="stretch">Stretch</option>
                <option value="aspect">Keep aspect ratio</option>
              </select>
            </div>

            {/* Import as Layers */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Split by Color</label>
              <input
                type="checkbox"
                checked={importAsLayers}
                onChange={(e) => {
                  setImportAsLayers(e.target.checked);
                }}
                className="w-4 h-4 accent-accent"
              />
            </div>

            {/* Info */}
            <div className="bg-panel/50 border border-border rounded-lg p-3 text-[10px] text-muted space-y-1">
              <p>• High-res images will be downscaled.</p>
              <p>• Color reduction uses a fast quantization algorithm.</p>
              <p>• Transparent areas will be ignored.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-panel/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedImage || processing}
            className="px-6 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
