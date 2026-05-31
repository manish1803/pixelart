'use client';
import { Tooltip } from '@/components/ui/Tooltip';
import { hexToHsv, hexToRgb, hsvToHex, rgbToHex } from '@/lib/utils/color';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronRight, Pipette } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
  activePalette?: string[];
  darkMode: boolean;
  onPickColor?: () => void;
  isPickerActive?: boolean;
}

export function ColorPicker({ color, setColor, recentColors, addRecentColor, activePalette = [], darkMode, onPickColor, isPickerActive }: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [rgb, setRgb] = useState(() => hexToRgb(color));
  const [format, setFormat] = useState<'RGB' | 'HEX'>('RGB');

  const satBoxRef = useRef<HTMLDivElement>(null);
  const hueBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    const rgbHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (color.toLowerCase() !== currentHex.toLowerCase() && color.toLowerCase() !== rgbHex.toLowerCase()) {
      setRgb(hexToRgb(color));
      setHsv(hexToHsv(color));
    }
  }, [color]);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: value };
    setRgb(newRgb);
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(newColor);
    setHsv(hexToHsv(newColor));
    // Removed addRecentColor here to prevent adding intermediate colors while typing
  };

  const handleSaturationDown = (e: React.PointerEvent) => {
    const box = satBoxRef.current;
    if (!box) return;
    
    const update = (clientX: number, clientY: number, end: boolean = false) => {
      const rect = box.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const s = x;
      const v = 1 - y;
      const newColor = hsvToHex(hsv.h, s, v);
      setHsv(prev => ({ ...prev, s, v }));
      setColor(newColor);
      setRgb(hexToRgb(newColor));
      if (end) addRecentColor(newColor);
    };

    update(e.clientX, e.clientY);

    const onMove = (e: PointerEvent) => update(e.clientX, e.clientY);
    const onUp = (e: PointerEvent) => {
      update(e.clientX, e.clientY, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleHueDown = (e: React.PointerEvent) => {
    const box = hueBoxRef.current;
    if (!box) return;
    
    const update = (clientX: number, end: boolean = false) => {
      const rect = box.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newColor = hsvToHex(x, hsv.s, hsv.v);
      setHsv(prev => ({ ...prev, h: x }));
      setColor(newColor);
      setRgb(hexToRgb(newColor));
      if (end) addRecentColor(newColor);
    };

    update(e.clientX);

    const onMove = (e: PointerEvent) => update(e.clientX);
    const onUp = (e: PointerEvent) => {
      update(e.clientX, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="border border-border p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">COLOUR PICKER</div>
        <Tooltip content="Pick color from canvas" shortcut="I">
          <button 
            className={`p-1.5 rounded-sm transition-all border ${
              isPickerActive ? 'bg-accent/10 border-accent text-accent' : 'border-transparent opacity-40 hover:opacity-100 hover:bg-panel text-foreground'
            }`}
            onClick={onPickColor}
          >
            <Pipette className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
      
      {/* Saturation Box */}
      <div className="border border-border">
        <div 
          ref={satBoxRef}
          className="aspect-square relative cursor-crosshair"
          onPointerDown={handleSaturationDown}
          style={{ 
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hsv.h, 1, 1)})`,
          }}
        >
          {/* Square Indicator */}
          <div 
            className="absolute w-2.5 h-2.5 border-[1.5px] shadow-sm pointer-events-none border-white" 
            style={{ 
              top: `${(1 - hsv.v) * 100}%`, 
              left: `${hsv.s * 100}%`, 
              transform: 'translate(-50%, -50%)',
              backgroundColor: color,
            }} 
          />
        </div>
      </div>

      {/* Hue Slider Row */}
      <div className="flex gap-2 items-center">
        <div className="w-5 h-3 shrink-0" style={{ backgroundColor: color }} />
        <div 
          ref={hueBoxRef}
          className="h-3 flex-1 relative cursor-pointer" 
          style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #00f)' }}
          onPointerDown={handleHueDown}
        />
      </div>

      {/* Inputs */}
      <div className="flex gap-2 h-8">
        <div 
          className="w-[72px] shrink-0 border border-border flex items-center justify-between px-2 text-[10px] font-bold uppercase cursor-pointer select-none text-foreground"
          onClick={() => setFormat(f => f === 'RGB' ? 'HEX' : 'RGB')}
        >
          <span>{format}</span>
          <svg width="6" height="4" viewBox="0 0 6 4" fill="currentColor"><path d="M3 4L0 0H6L3 4Z"/></svg>
        </div>
        
        {format === 'RGB' ? (
          <>
            <input 
              type="number" 
              value={rgb.r}
              onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
              onBlur={() => addRecentColor(color)}
              className="flex-1 min-w-0 border border-border bg-transparent text-center text-[10px] font-bold focus:outline-none text-foreground" 
            />
            <input 
              type="number" 
              value={rgb.g}
              onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
              onBlur={() => addRecentColor(color)}
              className="flex-1 min-w-0 border border-border bg-transparent text-center text-[10px] font-bold focus:outline-none text-foreground" 
            />
            <input 
              type="number" 
              value={rgb.b}
              onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
              onBlur={() => addRecentColor(color)}
              className="flex-1 min-w-0 border border-border bg-transparent text-center text-[10px] font-bold focus:outline-none text-foreground" 
            />
          </>
        ) : (
          <input 
            type="text" 
            value={color.toLowerCase()}
            onChange={(e) => {
              const val = e.target.value;
              setColor(val);
              if (/^#[0-9a-fA-F]{6}$/i.test(val)) {
                setRgb(hexToRgb(val));
                setHsv(hexToHsv(val));
              }
            }}
            onBlur={() => addRecentColor(color)}
            className="flex-1 border border-border bg-transparent text-center text-[10px] font-bold focus:outline-none text-foreground" 
          />
        )}
      </div>

      {/* Active Palette Swatches */}
      {activePalette && activePalette.length > 0 && (
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className="flex items-center justify-between w-full pt-2">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">ACTIVE PALETTE</div>
            <ChevronRight className="w-3 h-3 opacity-40 text-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-6 gap-2">
              {activePalette.map((c, i) => (
                <button 
                  key={i} 
                  onClick={() => setColor(c)}
                  className={`aspect-square border ${color.toLowerCase() === c.toLowerCase() ? 'border-accent border-2' : 'border-border'}`} 
                  style={{ backgroundColor: c }} 
                  title={c}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Recent Swatches */}
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full pt-2">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">RECENT SWATCHES</div>
          <ChevronRight className="w-3 h-3 opacity-40 text-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-6 gap-2">
            {recentColors.map((c, i) => (
              <button 
                key={i} 
                onClick={() => setColor(c)}
                className={`aspect-square border ${color.toLowerCase() === c.toLowerCase() ? 'border-accent border-2' : 'border-border'}`} 
                style={{ backgroundColor: c }} 
                title={c}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
