'use client';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { PanelContainer, PanelFooter, PanelSection } from '@/components/shared/PanelBase';
import { DiscreteSlider } from '@/components/ui/DiscreteSlider';
import { Tooltip } from '@/components/ui/Tooltip';
import React from 'react';

interface ToolsPanelProps {
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  mirrorMode?: 'none' | 'vertical' | 'horizontal' | 'both';
  setMirrorMode?: (mode: 'none' | 'vertical' | 'horizontal' | 'both') => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
  darkMode: boolean;
  onNewProject: () => void;
}

export const ToolsPanel = React.memo(function ToolsPanel({ tool, setTool, color, setColor, brushSize, setBrushSize, mirrorMode = 'none', setMirrorMode, recentColors, addRecentColor, darkMode, onNewProject }: ToolsPanelProps) {

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
    <PanelContainer side="left">
      {/* Fill/Erase buttons */}
      <PanelSection border={false}>
        <div className="flex gap-2">
          <Tooltip content="Fill Tool" shortcut="F" className="flex-1">
            <button
              onClick={() => setTool('fill')}
              className={`w-full py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                tool === 'fill' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
              }`}
            >
              DRAW
            </button>
          </Tooltip>
          <Tooltip content="Erase Tool" shortcut="E" className="flex-1">
            <button
              onClick={() => setTool('erase')}
              className={`w-full py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                tool === 'erase' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
              }`}
            >
              ERASE
            </button>
          </Tooltip>
        </div>
      </PanelSection>

      <ColorPicker 
        color={color} 
        setColor={setColor} 
        recentColors={recentColors} 
        addRecentColor={addRecentColor} 
        darkMode={darkMode} 
        onPickColor={handlePickColor}
        isPickerActive={tool === 'picker'}
      />

      <PanelSection title="Brush Size">
        <div className="flex items-center justify-between mb-2">
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
      </PanelSection>

      <PanelSection title="Symmetry">
        <div className="flex gap-1 border border-border bg-panel/30 p-1">
          <button
            onClick={() => setMirrorMode?.('none')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-colors ${
              mirrorMode === 'none' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
            }`}
            title="No Symmetry"
          >
            NONE
          </button>
          <button
            onClick={() => setMirrorMode?.('vertical')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-colors ${
              mirrorMode === 'vertical' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
            }`}
            title="Vertical Symmetry"
          >
            |
          </button>
          <button
            onClick={() => setMirrorMode?.('horizontal')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-colors ${
              mirrorMode === 'horizontal' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
            }`}
            title="Horizontal Symmetry"
          >
            —
          </button>
          <button
            onClick={() => setMirrorMode?.('both')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest transition-colors ${
              mirrorMode === 'both' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-foreground opacity-50 hover:opacity-100'
            }`}
            title="Quad Symmetry"
          >
            +
          </button>
        </div>
      </PanelSection>

      <PanelFooter />
    </PanelContainer>
  );
});
