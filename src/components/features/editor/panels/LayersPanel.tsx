'use client';
import { Tooltip } from '@/components/ui/Tooltip';
import { AnimationState, findCel } from '@/lib/models/animation';
import { Reorder } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Link, Lock, Plus, Unlink, Unlock } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '@/hooks/useEditorStore';

interface LayersPanelProps {
  state: AnimationState;
  addLayer: (id: string, name: string) => void;
  unlinkCel: (frameId: string, layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  deleteLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string, newLayerId: string) => void;
  clearCel: (frameId: string, layerId: string) => void;
  reorderLayers: (layers: AnimationState['layers']) => void;
  updateLayerOpacity: (layerId: string, opacity: number) => void;
  updateLayerBlendMode: (layerId: string, blendMode: GlobalCompositeOperation) => void;
  mergeLayerDown: (layerId: string, gridSize: number) => void;
}

export function LayersPanel({
  state,
  addLayer,
  unlinkCel,
  toggleLayerVisibility,
  toggleLayerLock,
  renameLayer,
  deleteLayer,
  duplicateLayer,
  clearCel,
  reorderLayers,
  updateLayerOpacity,
  updateLayerBlendMode,
  mergeLayerDown,
}: LayersPanelProps) {
  const {
    selectedFrameId: selectedFrame,
    selectedLayerId: selectedLayer,
    setSelectedLayerId: setSelectedLayer,
    gridSize,
  } = useEditorStore();

  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; layerId: string } | null>(null);

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  return (
    <div className="bg-panel border border-border rounded-xl flex flex-col h-full overflow-hidden">
      <div className="h-10 border-b border-border flex items-center justify-between px-3 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Layers</span>
        <button 
          onClick={() => {
            const newLayerId = `layer-${state.layers.length + 1}`;
            addLayer(newLayerId, `Layer ${state.layers.length + 1}`);
            setSelectedLayer(newLayerId);
          }}
          className="p-1 hover:text-foreground rounded transition-colors"
          title="Add Layer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <Reorder.Group axis="y" values={state.layers} onReorder={reorderLayers} className="flex-1 overflow-y-auto">
        {state.layers.map((layer) => {
          const cel = findCel(state, selectedFrame, layer.id);
          const isSelected = selectedLayer === layer.id;
          const sharedCels = cel ? state.cels.filter(c => c.dataId === cel.dataId) : [];
          const isLinked = sharedCels.length > 1;
          const sharedFrames = sharedCels.map(c => {
            const index = state.frames.findIndex(f => f.id === c.frameId);
            return `Frame ${index + 1}`;
          }).join(', ');

          return (
            <Reorder.Item 
              key={layer.id} 
              value={layer}
              onClick={() => setSelectedLayer(layer.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, layerId: layer.id });
              }}
              className={`h-12 border-b border-border flex items-center justify-between px-3 cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-accent/25 text-accent font-bold border-l-4 border-l-accent' 
                  : 'text-muted hover:text-foreground hover:bg-panel/50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Drag Handle */}
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab" />

                {/* Status Indicator (Shared/Independent) */}
                <Tooltip content={cel ? (isLinked ? `Shared across: ${sharedFrames}` : 'Independent: Edits affect only this frame') : 'Empty Cel'}>
                  <div 
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      cel 
                        ? isLinked 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-foreground/10 text-foreground' 
                        : 'border border-dashed border-muted-foreground/30'
                    }`}
                  >
                    {cel && (
                      isLinked 
                        ? <Link className="w-3 h-3" /> 
                        : <div className="w-2 h-2 bg-foreground rounded-full" />
                    )}
                  </div>
                </Tooltip>

                <span className="text-xs font-medium truncate">{layer.name}</span>
              </div>

              <div className="flex items-center gap-1">
                {cel && isLinked && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      unlinkCel(selectedFrame, layer.id);
                    }}
                    className="p-1 hover:text-foreground rounded"
                    title="Make Independent"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className="p-1 hover:text-foreground rounded"
                  title={layer.isVisible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                  className="p-1 hover:text-foreground rounded"
                  title={layer.isLocked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {contextMenu && (
        <div 
          className="fixed bg-background border border-border rounded-lg shadow-xl py-1 z-50 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const name = prompt('Rename Layer', state.layers.find(l => l.id === contextMenu.layerId)?.name || '');
              if (name) renameLayer(contextMenu.layerId, name);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-panel/50 text-foreground flex items-center gap-2"
          >
            Rename
          </button>
          <button
            onClick={() => {
              const newLayerId = `layer-${state.layers.length + 1}`;
              duplicateLayer(contextMenu.layerId, newLayerId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-panel/50 text-foreground flex items-center gap-2"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              mergeLayerDown(contextMenu.layerId, gridSize);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-panel/50 text-foreground flex items-center gap-2"
            disabled={state.layers.findIndex(l => l.id === contextMenu.layerId) === 0}
          >
            Merge Down
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this layer?')) {
                deleteLayer(contextMenu.layerId);
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-panel/50 text-red-500 flex items-center gap-2"
          >
            Delete
          </button>
          <button
            onClick={() => {
              clearCel(selectedFrame, contextMenu.layerId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-panel/50 text-foreground flex items-center gap-2"
          >
            Clear Cel
          </button>
        </div>
      )}
    </div>
  );
}
