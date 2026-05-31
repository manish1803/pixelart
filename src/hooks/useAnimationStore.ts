import { AnimationState, createInitialState, findCel } from '@/lib/models/animation';
import { useCallback, useState } from 'react';
import { produce } from 'immer';

// Action Types
type Action =
  | { type: 'ADD_FRAME'; payload: { frameId: string; copyFromFrameId?: string } }
  | { type: 'DELETE_FRAME'; payload: { frameId: string } }
  | { type: 'ADD_LAYER'; payload: { layerId: string; name: string } }
  | { type: 'UPDATE_PIXELS'; payload: { frameId: string; layerId: string; pixels: { [key: string]: string } } }
  | { type: 'UNLINK_CEL'; payload: { frameId: string; layerId: string } }
  | { type: 'CLEAR_CEL'; payload: { frameId: string; layerId: string } }
  | { type: 'UPDATE_TRANSFORM'; payload: { frameId: string; layerId: string; transform: { x: number; y: number; rotation: number } } }
  | { type: 'UPDATE_SELECTION'; payload: { frameId: string; layerId: string; selection: { x: number; y: number; w: number; h: number } | null } }
  | { type: 'RESET_STATE'; payload: { state: AnimationState } }
  | { type: 'UPDATE_THUMBNAIL'; payload: { frameId: string } }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: { layerId: string } }
  | { type: 'TOGGLE_LAYER_LOCK'; payload: { layerId: string } }
  | { type: 'RENAME_LAYER'; payload: { layerId: string; name: string } }
  | { type: 'DELETE_LAYER'; payload: { layerId: string } }
  | { type: 'DUPLICATE_LAYER'; payload: { layerId: string; newLayerId: string } }
  | { type: 'REORDER_LAYERS'; payload: { layers: AnimationState['layers'] } }
  | { type: 'UPDATE_LAYER_OPACITY'; payload: { layerId: string; opacity: number } }
  | { type: 'UPDATE_LAYER_BLEND_MODE'; payload: { layerId: string; blendMode: GlobalCompositeOperation } }
  | { type: 'MERGE_LAYERS'; payload: { topLayerId: string; bottomLayerId: string; updates: { frameId: string; dataId: string; pixels: { [key: string]: string } }[] } };

// Reducer
function animationReducer(state: AnimationState, action: Action): AnimationState {
  switch (action.type) {
    case 'ADD_FRAME': {
      const { frameId, copyFromFrameId } = action.payload;
      const newFrame = { id: frameId };
      
      const newCels = state.layers.map((layer) => {
        const dataId = `data-${frameId}-${layer.id}`; // Always unique by default!
        
        return {
          frameId,
          layerId: layer.id,
          dataId,
        };
      });

      // Create CelData entries for the new cels
      const newCelData = { ...state.celData };
      newCels.forEach((cel) => {
        if (copyFromFrameId) {
          const prevCel = findCel(state, copyFromFrameId, cel.layerId);
          if (prevCel) {
            const prevData = state.celData[prevCel.dataId];
            newCelData[cel.dataId] = { 
              id: cel.dataId, 
              pixels: { ...prevData.pixels } // Copy pixels instead of sharing!
            };
          } else {
            newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
          }
        } else {
          newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
        }
      });

      const frames = (() => {
        if (copyFromFrameId) {
          const index = state.frames.findIndex(f => f.id === copyFromFrameId);
          if (index !== -1) {
            const newFrames = [...state.frames];
            newFrames.splice(index + 1, 0, newFrame);
            return newFrames;
          }
        }
        return [...state.frames, newFrame];
      })();

      return {
        ...state,
        frames,
        cels: [...state.cels, ...newCels],
        celData: newCelData,
      };
    }

    case 'DELETE_FRAME': {
      const { frameId } = action.payload;
      if (state.frames.length <= 1) return state;
      
      const newFrames = state.frames.filter(f => f.id !== frameId);
      const newCels = state.cels.filter(c => c.frameId !== frameId);
      
      return {
        ...state,
        frames: newFrames,
        cels: newCels,
      };
    }

    case 'ADD_LAYER': {
      const { layerId, name } = action.payload;
      const newLayer = { id: layerId, name, isVisible: true, isLocked: false };
      
      // Create cels for this new layer in all existing frames
      const newCels = state.frames.map((frame) => {
        const dataId = `data-${frame.id}-${layerId}`;
        return {
          frameId: frame.id,
          layerId,
          dataId,
        };
      });

      const newCelData = { ...state.celData };
      newCels.forEach((cel) => {
        newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
      });

      return {
        ...state,
        layers: [...state.layers, newLayer],
        cels: [...state.cels, ...newCels],
        celData: newCelData,
      };
    }

    case 'UPDATE_PIXELS': {
      return produce(state, (draft) => {
        const { frameId, layerId, pixels } = action.payload;
        const cel = draft.cels.find(c => c.frameId === frameId && c.layerId === layerId);
        if (!cel) return;

        const celData = draft.celData[cel.dataId];
        if (!celData) return;

        Object.entries(pixels).forEach(([k, v]) => {
          if (v === '') {
            delete celData.pixels[k];
          } else {
            celData.pixels[k] = v;
          }
        });
      });
    }

    case 'UNLINK_CEL': {
      return produce(state, (draft) => {
        const { frameId, layerId } = action.payload;
        const cel = draft.cels.find(c => c.frameId === frameId && c.layerId === layerId);
        if (!cel) return;

        const currentData = draft.celData[cel.dataId];
        if (!currentData) return;

        const newDataId = `data-${frameId}-${layerId}-unique`;
        draft.celData[newDataId] = { id: newDataId, pixels: { ...currentData.pixels } };
        cel.dataId = newDataId;
      });
    }

    case 'CLEAR_CEL': {
      return produce(state, (draft) => {
        const { frameId, layerId } = action.payload;
        const cel = draft.cels.find(c => c.frameId === frameId && c.layerId === layerId);
        if (!cel) return;
        const celData = draft.celData[cel.dataId];
        if (celData) celData.pixels = {};
      });
    }

    case 'UPDATE_TRANSFORM': {
      const { frameId, layerId, transform } = action.payload;
      const newCels = state.cels.map((c) =>
        c.frameId === frameId && c.layerId === layerId ? { ...c, transform } : c
      );
      return { ...state, cels: newCels };
    }

    case 'UPDATE_SELECTION': {
      const { layerId, selection } = action.payload;
      const newCels = state.cels.map((c) =>
        c.layerId === layerId ? { ...c, selection } : c
      );
      return { ...state, cels: newCels };
    }

    case 'RESET_STATE': {
      return action.payload.state;
    }

    case 'UPDATE_THUMBNAIL': {
      return { ...state, thumbnailFrameId: action.payload.frameId };
    }

    case 'TOGGLE_LAYER_VISIBILITY': {
      const { layerId } = action.payload;
      const newLayers = state.layers.map(l =>
        l.id === layerId ? { ...l, isVisible: !l.isVisible } : l
      );
      return { ...state, layers: newLayers };
    }

    case 'TOGGLE_LAYER_LOCK': {
      const { layerId } = action.payload;
      const newLayers = state.layers.map(l =>
        l.id === layerId ? { ...l, isLocked: !l.isLocked } : l
      );
      return { ...state, layers: newLayers };
    }

    case 'RENAME_LAYER': {
      const { layerId, name } = action.payload;
      const newLayers = state.layers.map(l =>
        l.id === layerId ? { ...l, name } : l
      );
      return { ...state, layers: newLayers };
    }

    case 'DELETE_LAYER': {
      const { layerId } = action.payload;
      if (state.layers.length <= 1) return state;
      
      const newLayers = state.layers.filter(l => l.id !== layerId);
      const newCels = state.cels.filter(c => c.layerId !== layerId);
      
      return {
        ...state,
        layers: newLayers,
        cels: newCels,
      };
    }

    case 'DUPLICATE_LAYER': {
      const { layerId, newLayerId } = action.payload;
      const layerToDup = state.layers.find(l => l.id === layerId);
      if (!layerToDup) return state;

      const newLayer = { ...layerToDup, id: newLayerId, name: `${layerToDup.name} Copy` };
      
      const newCels: typeof state.cels = [];
      const newCelData = { ...state.celData };

      state.frames.forEach(frame => {
        const originalCel = findCel(state, frame.id, layerId);
        const dataId = `data-${frame.id}-${newLayerId}`;
        
        newCels.push({
          frameId: frame.id,
          layerId: newLayerId,
          dataId,
        });

        if (originalCel) {
          const originalData = state.celData[originalCel.dataId];
          newCelData[dataId] = {
            id: dataId,
            pixels: { ...originalData.pixels }
          };
        } else {
          newCelData[dataId] = { id: dataId, pixels: {} };
        }
      });

      return {
        ...state,
        layers: [...state.layers, newLayer],
        cels: [...state.cels, ...newCels],
        celData: newCelData,
      };
    }

    case 'REORDER_LAYERS': {
      return { ...state, layers: action.payload.layers };
    }

    case 'UPDATE_LAYER_OPACITY': {
      const { layerId, opacity } = action.payload;
      const newLayers = state.layers.map(l =>
        l.id === layerId ? { ...l, opacity } : l
      );
      return { ...state, layers: newLayers };
    }

    case 'UPDATE_LAYER_BLEND_MODE': {
      const { layerId, blendMode } = action.payload;
      const newLayers = state.layers.map(l =>
        l.id === layerId ? { ...l, blendMode } : l
      );
      return { ...state, layers: newLayers };
    }

    case 'MERGE_LAYERS': {
      const { topLayerId, bottomLayerId, updates } = action.payload;
      
      const newLayers = state.layers.filter(l => l.id !== topLayerId);
      const newCelData = { ...state.celData };
      const newCels = [...state.cels];
      
      updates.forEach(({ frameId, dataId, pixels }) => {
        newCelData[dataId] = { id: dataId, pixels };
        
        const celIndex = newCels.findIndex(c => c.frameId === frameId && c.layerId === bottomLayerId);
        if (celIndex >= 0) {
          newCels[celIndex] = { ...newCels[celIndex], dataId };
        } else {
          newCels.push({ frameId, layerId: bottomLayerId, dataId });
        }
      });
      
      const filteredCels = newCels.filter(c => c.layerId !== topLayerId);
      
      return {
        ...state,
        layers: newLayers,
        cels: filteredCels,
        celData: newCelData,
      };
    }

    default:
      return state;
  }
}

// Hook
export function useAnimationStore() {
  const [state, setState] = useState<AnimationState>(createInitialState());
  const [history, setHistory] = useState<AnimationState[]>([createInitialState()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateStateWithHistory = useCallback((newState: AnimationState) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setHistoryIndex(prevIndex => prevIndex + 1);
    setState(newState);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const pushHistory = useCallback(() => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory;
    });
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex, state]);

  const dispatch = useCallback((action: Action, skipHistory = false) => {
    const newState = animationReducer(state, action);
    if (skipHistory) {
      setState(newState);
    } else {
      updateStateWithHistory(newState);
    }
  }, [state, updateStateWithHistory]);

  return {
    state,
    addFrame: (frameId: string, copyFromFrameId?: string) =>
      dispatch({ type: 'ADD_FRAME', payload: { frameId, copyFromFrameId } }),
    deleteFrame: (frameId: string) =>
      dispatch({ type: 'DELETE_FRAME', payload: { frameId } }),
    addLayer: (layerId: string, name: string) =>
      dispatch({ type: 'ADD_LAYER', payload: { layerId, name } }),
    updatePixels: (frameId: string, layerId: string, pixels: { [key: string]: string }, skipHistory = false) =>
      dispatch({ type: 'UPDATE_PIXELS', payload: { frameId, layerId, pixels } }, skipHistory),
    unlinkCel: (frameId: string, layerId: string) =>
      dispatch({ type: 'UNLINK_CEL', payload: { frameId, layerId } }),
    clearCel: (frameId: string, layerId: string) =>
      dispatch({ type: 'CLEAR_CEL', payload: { frameId, layerId } }),
    updateTransform: (frameId: string, layerId: string, transform: { x: number; y: number; rotation: number }) =>
      dispatch({ type: 'UPDATE_TRANSFORM', payload: { frameId, layerId, transform } }),
    updateSelection: (frameId: string, layerId: string, selection: { x: number; y: number; w: number; h: number } | null) =>
      dispatch({ type: 'UPDATE_SELECTION', payload: { frameId, layerId, selection } }),
    resetState: (state: AnimationState) =>
      dispatch({ type: 'RESET_STATE', payload: { state } }),
    updateThumbnail: (frameId: string) =>
      dispatch({ type: 'UPDATE_THUMBNAIL', payload: { frameId } }),
    toggleLayerVisibility: (layerId: string) =>
      dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: { layerId } }),
    toggleLayerLock: (layerId: string) =>
      dispatch({ type: 'TOGGLE_LAYER_LOCK', payload: { layerId } }),
    renameLayer: (layerId: string, name: string) =>
      dispatch({ type: 'RENAME_LAYER', payload: { layerId, name } }),
    deleteLayer: (layerId: string) =>
      dispatch({ type: 'DELETE_LAYER', payload: { layerId } }),
    duplicateLayer: (layerId: string, newLayerId: string) =>
      dispatch({ type: 'DUPLICATE_LAYER', payload: { layerId, newLayerId } }),
    reorderLayers: (layers: AnimationState['layers']) =>
      dispatch({ type: 'REORDER_LAYERS', payload: { layers } }),
    updateLayerOpacity: (layerId: string, opacity: number) =>
      dispatch({ type: 'UPDATE_LAYER_OPACITY', payload: { layerId, opacity } }),
    updateLayerBlendMode: (layerId: string, blendMode: GlobalCompositeOperation) =>
      dispatch({ type: 'UPDATE_LAYER_BLEND_MODE', payload: { layerId, blendMode } }),
    mergeLayerDown: (layerId: string, gridSize: number) => {
      const layerIndex = state.layers.findIndex(l => l.id === layerId);
      if (layerIndex <= 0) return;
      
      const topLayer = state.layers[layerIndex];
      const bottomLayer = state.layers[layerIndex - 1];
      
      const canvas = document.createElement('canvas');
      canvas.width = gridSize;
      canvas.height = gridSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const updates: { frameId: string; dataId: string; pixels: { [key: string]: string } }[] = [];
      
      state.frames.forEach(frame => {
        ctx.clearRect(0, 0, gridSize, gridSize);
        
        const bottomCel = state.cels.find(c => c.frameId === frame.id && c.layerId === bottomLayer.id);
        if (bottomCel) {
          const data = state.celData[bottomCel.dataId];
          if (data) {
            Object.entries(data.pixels).forEach(([key, color]) => {
              const [x, y] = key.split(',').map(Number);
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            });
          }
        }
        
        const topCel = state.cels.find(c => c.frameId === frame.id && c.layerId === topLayer.id);
        if (topCel) {
          const data = state.celData[topCel.dataId];
          if (data) {
            ctx.save();
            ctx.globalAlpha = topLayer.opacity !== undefined ? topLayer.opacity / 100 : 1;
            if (topLayer.blendMode) ctx.globalCompositeOperation = topLayer.blendMode;
            
            Object.entries(data.pixels).forEach(([key, color]) => {
              const [x, y] = key.split(',').map(Number);
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            });
            ctx.restore();
          }
        }
        
        const imgData = ctx.getImageData(0, 0, gridSize, gridSize);
        const pixels: { [key: string]: string } = {};
        
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const idx = (y * gridSize + x) * 4;
            const r = imgData.data[idx];
            const g = imgData.data[idx + 1];
            const b = imgData.data[idx + 2];
            const a = imgData.data[idx + 3];
            
            if (a > 0) {
              const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}${a.toString(16).padStart(2, '0')}`;
              pixels[`${x},${y}`] = hex;
            }
          }
        }
        
        updates.push({
          frameId: frame.id,
          dataId: bottomCel ? bottomCel.dataId : `data-${Math.random().toString(36).substr(2, 9)}`,
          pixels,
        });
      });
      
      dispatch({ type: 'MERGE_LAYERS', payload: { topLayerId: topLayer.id, bottomLayerId: bottomLayer.id, updates } });
    },
    undo,
    redo,
    pushHistory,
  };
}
