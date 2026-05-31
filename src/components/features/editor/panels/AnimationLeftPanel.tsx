'use client';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { PanelContainer, PanelFooter, PanelSection } from '@/components/shared/PanelBase';
import { ShortcutsList } from '@/components/shared/ShortcutsList';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { DiscreteSlider } from '@/components/ui/DiscreteSlider';
import React from 'react';

interface AnimationLeftPanelProps {
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  eraserSize: number;
  setEraserSize: (size: number) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  fps: number;
  setFps: (fps: number) => void;
  onionSkin: boolean;
  setOnionSkin: (value: boolean) => void;
  darkMode: boolean;
  onNewProject: () => void;
  color: string;
  setColor: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
}

export const AnimationLeftPanel = React.memo(function AnimationLeftPanel({
  tool,
  setTool,
  eraserSize,
  setEraserSize,
  gridSize,
  setGridSize,
  fps,
  setFps,
  onionSkin,
  setOnionSkin,
  darkMode,
  onNewProject,
  color,
  setColor,
  recentColors,
  addRecentColor,
}: AnimationLeftPanelProps) {

  const duration = Math.round(1000 / fps);

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
      
      {/* Project Actions */}
      <PanelSection>
        <button 
          onClick={onNewProject}
          className="w-full text-[10px] font-bold uppercase tracking-widest transition-colors hover:opacity-70 text-foreground"
        >
          OPEN PROJECT
        </button>
      </PanelSection>

      {/* Configuration */}
      <PanelSection title="Canvas Size">
        <div className="flex items-center justify-between">
          <CustomNumberInput 
            value={`${gridSize} X ${gridSize}`}
            onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
            onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
          />
        </div>
      </PanelSection>

      <PanelSection title="FPS">
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-bold uppercase opacity-50 text-foreground">
            DURATION: {duration}MS
          </div>
          <CustomNumberInput 
            variant="vertical"
            value={`${fps} FPS`}
            onIncrement={() => setFps(Math.min(60, fps + 1))}
            onDecrement={() => setFps(Math.max(1, fps - 1))}
          />
        </div>
      </PanelSection>

      {/* Tools */}
      <PanelSection border={false}>
        <div className="flex gap-2">
          <button
            onClick={() => setTool('fill')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'fill' ? 'bg-panel border-foreground text-foreground' : 'bg-transparent border-border text-foreground opacity-40'
            }`}
          >
            FILL
          </button>
          <button
            onClick={() => setTool('erase')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'erase' ? 'bg-panel border-foreground text-foreground' : 'bg-transparent border-border text-foreground opacity-40'
            }`}
          >
            ERASE
          </button>
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

      <PanelSection title="Eraser Size">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-foreground">{eraserSize} px</div>
        </div>
        <DiscreteSlider 
          value={eraserSize}
          min={1}
          max={16}
          onChange={setEraserSize}
        />
      </PanelSection>

      <PanelSection title="Onion Skin">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setOnionSkin(!onionSkin)}
            className={`w-12 h-6 border flex items-center px-1 border-border transition-colors ${
              onionSkin ? 'bg-panel' : 'bg-transparent'
            }`}
          >
            <div 
              className={`w-4 h-4 transition-transform shadow-sm ${
                onionSkin ? 'translate-x-6 bg-foreground' : 'translate-x-0 bg-muted'
              }`}
            />
          </button>
        </div>
      </PanelSection>

      <ShortcutsList />

      <PanelFooter />
    </PanelContainer>
  );
});
