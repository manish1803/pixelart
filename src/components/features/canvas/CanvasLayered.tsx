'use client';
import { AnimationState, findCel } from '@/lib/models/animation';
import React, { useEffect, useRef, useState } from 'react';

interface CanvasLayeredProps {
  state: AnimationState;
  currentFrameId: string;
  activeLayerId: string;
  onUpdatePixels: (frameId: string, layerId: string, pixels: { [key: string]: string }, skipHistory?: boolean) => void;
  onPushHistory?: () => void;
  onUpdateTransform: (frameId: string, layerId: string, transform: { x: number; y: number; rotation: number }) => void;
  gridSize: number;
  darkMode: boolean;
  zoom: number;
  pan: { x: number; y: number };
  color: string;
  tool: 'fill' | 'erase' | 'picker' | 'selection';
  mirrorMode?: 'none' | 'vertical' | 'horizontal' | 'both';
  onionSkin?: boolean;
  onZoom?: (zoom: number | ((prev: number) => number)) => void;
  onPan?: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  onUpdateSelection?: (frameId: string, layerId: string, selection: { x: number; y: number; w: number; h: number } | null) => void;
  toyMode?: boolean;
  brushSize?: number;
}

export const CanvasLayered = React.memo(function CanvasLayered({
  state,
  currentFrameId,
  activeLayerId,
  onUpdatePixels,
  onUpdateTransform,
  onUpdateSelection,
  gridSize,
  toyMode = false,
  darkMode,
  zoom,
  pan,
  onZoom,
  onPan,
  color,
  tool,
  mirrorMode = 'none',
  onionSkin = false,
  brushSize = 1,
  onPushHistory,
}: CanvasLayeredProps) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const cel = findCel(state, currentFrameId, activeLayerId);
  const selection = cel?.selection || null;

  const isDrawingRef = useRef(false);
  const isSelectingRef = useRef(false);
  const selectStartRef = useRef<{ x: number; y: number } | null>(null);
  const isOverSelectionRef = useRef(false);
  const activeHandleRef = useRef<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const hoveredHandleRef = useRef<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const localSelectionRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const dashOffsetRef = useRef(0);
  const mousePosRef = useRef<{x: number, y: number} | null>(null);

  const isPanningRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentZoomRef = useRef(zoom);
  const currentPanRef = useRef(pan);
  
  useEffect(() => {
    currentZoomRef.current = zoom;
    currentPanRef.current = pan;
  }, [zoom, pan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        isSpacePressedRef.current = true;
        const canvas = overlayCanvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        isPanningRef.current = false;
        const canvas = overlayCanvasRef.current;
        if (canvas) canvas.style.cursor = ''; 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const onionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnPixelRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    let id: number;
    const loop = () => {
      dashOffsetRef.current = (dashOffsetRef.current + 0.5) % 8;
      
      const canvas = overlayCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const canvasSize = 600;
          const cellSize = canvasSize / gridSize;
          ctx.clearRect(0, 0, canvasSize, canvasSize);

          // Draw selection bounds per layer
          state.layers.forEach((layer) => {
            const lCel = state.cels.find(c => c.frameId === currentFrameId && c.layerId === layer.id);
            if (!lCel || !lCel.selection) return;

            const isActive = layer.id === activeLayerId;
            const index = state.layers.findIndex(l => l.id === layer.id);
            const colors = ['#00ffff', '#ffaa00', '#00ff00', '#ff00aa', '#ffff00', '#ff00ff'];
            const color = colors[index % colors.length];

            ctx.strokeStyle = color;
            if (isActive) {
              ctx.setLineDash([4, 4]);
              ctx.lineDashOffset = dashOffsetRef.current;
              ctx.lineWidth = 2;
            } else {
              ctx.setLineDash([2, 2]);
              ctx.lineDashOffset = 0;
              ctx.lineWidth = 1;
              ctx.strokeStyle = color + '80';
            }

            ctx.strokeRect(
              lCel.selection.x * cellSize,
              lCel.selection.y * cellSize,
              lCel.selection.w * cellSize,
              lCel.selection.h * cellSize
            );

            if (isActive) {
              const handleSize = 6;
              ctx.fillStyle = color;
              ctx.setLineDash([]);
              ctx.fillRect(lCel.selection.x * cellSize - handleSize/2, lCel.selection.y * cellSize - handleSize/2, handleSize, handleSize);
              ctx.fillRect((lCel.selection.x + lCel.selection.w) * cellSize - handleSize/2, lCel.selection.y * cellSize - handleSize/2, handleSize, handleSize);
              ctx.fillRect(lCel.selection.x * cellSize - handleSize/2, (lCel.selection.y + lCel.selection.h) * cellSize - handleSize/2, handleSize, handleSize);
              ctx.fillRect((lCel.selection.x + lCel.selection.w) * cellSize - handleSize/2, (lCel.selection.y + lCel.selection.h) * cellSize - handleSize/2, handleSize, handleSize);
            }
          });

          if (localSelectionRef.current) {
            ctx.strokeStyle = '#00F0FF';
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = dashOffsetRef.current;
            ctx.lineWidth = 2;
            ctx.strokeRect(
              localSelectionRef.current.x * cellSize,
              localSelectionRef.current.y * cellSize,
              localSelectionRef.current.w * cellSize,
              localSelectionRef.current.h * cellSize
            );
          }
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [state, currentFrameId, activeLayerId, gridSize]);

  const canvasSize = 600;
  const cellSize = canvasSize / gridSize;
  const canvasBg = darkMode ? '#000' : '#fff';

  useEffect(() => {
    if (!onionSkin) return;
    if (!onionCanvasRef.current) {
      onionCanvasRef.current = document.createElement('canvas');
      onionCanvasRef.current.width = canvasSize;
      onionCanvasRef.current.height = canvasSize;
    }
    const oCtx = onionCanvasRef.current.getContext('2d');
    if (!oCtx) return;
    
    oCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    const currentFrameIndex = state.frames.findIndex((f) => f.id === currentFrameId);
    
    const drawFrameToOnion = (frameId: string, alpha: number) => {
      oCtx.globalAlpha = alpha;
      state.layers.forEach((layer) => {
        if (!layer.isVisible) return;
        const cel = findCel(state, frameId, layer.id);
        if (!cel) return;
        const celData = state.celData[cel.dataId];
        if (!celData) return;
        
        Object.entries(celData.pixels).forEach(([key, color]) => {
          if (!color) return;
          const [x, y] = key.split(',').map(Number);
          oCtx.fillStyle = color;
          oCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        });
      });
    };
    
    if (currentFrameIndex > 0) {
      drawFrameToOnion(state.frames[currentFrameIndex - 1].id, 0.3);
    }
    if (currentFrameIndex < state.frames.length - 1) {
      drawFrameToOnion(state.frames[currentFrameIndex + 1].id, 0.15);
    }
  }, [onionSkin, currentFrameId, state.frames, state.layers, state.celData, canvasSize, cellSize]);

  const getLayerColor = (layerId: string) => {
    const index = state.layers.findIndex(l => l.id === layerId);
    const colors = ['#00ffff', '#ffaa00', '#00ff00', '#ff00aa', '#ffff00', '#ff00ff'];
    return colors[index % colors.length];
  };



  useEffect(() => {
    drawCanvas();
  }, [state, currentFrameId, gridSize, darkMode, selection, activeLayerId, onionSkin, toyMode, mirrorMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const step = e.shiftKey ? 5 : 1;
      const cel = findCel(state, currentFrameId, activeLayerId);
      const activeLayer = state.layers.find(l => l.id === activeLayerId);
      if (activeLayer?.isLocked) return;
      
      const currentTransform = cel?.transform || { x: 0, y: 0, rotation: 0 };

      let dx = 0;
      let dy = 0;
      let dr = 0;

      if (e.key === 'Escape') {
        if (selection) {
          onUpdateSelection?.(currentFrameId, activeLayerId, null);
          return;
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection) {
          const clearedPixels: { [key: string]: string } = {};
          for (let x = selection.x; x < selection.x + selection.w; x++) {
            for (let y = selection.y; y < selection.y + selection.h; y++) {
              clearedPixels[`${x},${y}`] = '';
            }
          }
          onUpdatePixels(currentFrameId, activeLayerId, clearedPixels);
          onUpdateSelection?.(currentFrameId, activeLayerId, null);
          return;
        }
      }

      switch (e.key) {
        case 'ArrowUp':
          dy = -step;
          break;
        case 'ArrowDown':
          dy = step;
          break;
        case 'ArrowLeft':
          dx = -step;
          break;
        case 'ArrowRight':
          dx = step;
          break;
        case 'r':
        case 'R':
          dr = e.shiftKey ? -15 : 15;
          break;
        default:
          return;
      }

      e.preventDefault();

      if (dx !== 0 || dy !== 0) {
        if (selection) {
          const celData = cel ? state.celData[cel.dataId] : null;
          if (!celData) return;

          const newPixels = { ...celData.pixels };
          const selectionPixels: { [key: string]: string } = {};

          for (let x = selection.x; x < selection.x + selection.w; x++) {
            for (let y = selection.y; y < selection.y + selection.h; y++) {
              const key = `${x},${y}`;
              if (newPixels[key]) {
                selectionPixels[key] = newPixels[key];
                delete newPixels[key];
              }
            }
          }

          Object.entries(selectionPixels).forEach(([key, color]) => {
            const [x, y] = key.split(',').map(Number);
            const newKey = `${x + dx},${y + dy}`;
            newPixels[newKey] = color;
          });

          onUpdateSelection?.(currentFrameId, activeLayerId, {
            ...selection,
            x: selection.x + dx,
            y: selection.y + dy
          });

          onUpdatePixels(currentFrameId, activeLayerId, newPixels);
          return; // Skip transform!
        }
      }

      onUpdateTransform(currentFrameId, activeLayerId, {
        x: currentTransform.x + dx,
        y: currentTransform.y + dy,
        rotation: (currentTransform.rotation + dr) % 360,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, currentFrameId, activeLayerId, onUpdateTransform]);

  const drawCanvas = () => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (toyMode) {
      const defaultColor = darkMode ? '#1a1a1a' : '#ffffff';
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const centerX = x * cellSize + cellSize / 2;
          const centerY = y * cellSize + cellSize / 2;
          const radius = cellSize * 0.35;

          ctx.fillStyle = defaultColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

          ctx.beginPath();
          ctx.arc(centerX + cellSize * 0.04, centerY + cellSize * 0.04, radius, 0, Math.PI * 2);
          ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = defaultColor;
          ctx.fill();

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
    }

    const drawFrame = (frameId: string, alpha: number) => {
      state.layers.forEach((layer) => {
        if (!layer.isVisible) return;

        const cel = findCel(state, frameId, layer.id);
        if (!cel) return;

        const celData = state.celData[cel.dataId];
        if (!celData) return;

        ctx.save();
        ctx.globalAlpha = alpha * (layer.opacity !== undefined ? layer.opacity / 100 : 1);
        if (layer.blendMode) {
          ctx.globalCompositeOperation = layer.blendMode;
        }

        // Apply transforms
        if (cel.transform) {
          ctx.translate(cel.transform.x * cellSize, cel.transform.y * cellSize);
          if (cel.transform.rotation) {
            // Rotate around the center of the canvas
            const center = (gridSize / 2) * cellSize;
            ctx.translate(center, center);
            ctx.rotate((cel.transform.rotation * Math.PI) / 180);
            ctx.translate(-center, -center);
          }
        }

        Object.entries(celData.pixels || {}).forEach(([key, color]) => {
          if (!color) return; // Skip transparent
          const [x, y] = key.split(',').map(Number);
          
          if (toyMode) {
            // Base block
            ctx.fillStyle = color;
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
            ctx.fillStyle = color;
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
          } else {
            ctx.fillStyle = color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        });

        ctx.restore();
      });
    };

    if (onionSkin && onionCanvasRef.current) {
      ctx.drawImage(onionCanvasRef.current, 0, 0);
    }

    // Draw active frame
    drawFrame(currentFrameId, 1.0);

    // Reset alpha
    ctx.globalAlpha = 1.0;

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

    ctx.setLineDash([]); // Reset line dash
    ctx.lineDashOffset = 0;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>, skipHistory = false) => {
    const rect = baseCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const colorToUse = tool === 'erase' ? '' : color;
      const pixelsToUpdate: { [key: string]: string } = {};
      
      const offset = Math.floor(brushSize / 2);
      for (let dy = -offset; dy < brushSize - offset; dy++) {
        for (let dx = -offset; dx < brushSize - offset; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            pixelsToUpdate[`${nx},${ny}`] = colorToUse;
            
            if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
              const mx = gridSize - 1 - nx;
              pixelsToUpdate[`${mx},${ny}`] = colorToUse;
            }
            if (mirrorMode === 'vertical' || mirrorMode === 'both') {
              const my = gridSize - 1 - ny;
              pixelsToUpdate[`${nx},${my}`] = colorToUse;
            }
            if (mirrorMode === 'both') {
              const mx = gridSize - 1 - nx;
              const my = gridSize - 1 - ny;
              pixelsToUpdate[`${mx},${my}`] = colorToUse;
            }
          }
        }
      }
      
      onUpdatePixels(currentFrameId, activeLayerId, pixelsToUpdate, skipHistory);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || isSpacePressedRef.current) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { clientX: e.clientX, clientY: e.clientY, panX: currentPanRef.current.x, panY: currentPanRef.current.y };
      const canvas = overlayCanvasRef.current;
      if (canvas) canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button !== 0) return; // Only process left click for drawing/selecting

    const activeLayer = state.layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;

    const rect = baseCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      if (tool === 'selection') {
        if (selection) {
          const handleSize = 8;
          const nw = { x: selection.x * cellSize, y: selection.y * cellSize };
          const ne = { x: (selection.x + selection.w) * cellSize, y: selection.y * cellSize };
          const sw = { x: selection.x * cellSize, y: (selection.y + selection.h) * cellSize };
          const se = { x: (selection.x + selection.w) * cellSize, y: (selection.y + selection.h) * cellSize };

          const isNear = (pt: {x: number, y: number}) => {
            return Math.abs(mouseX - pt.x) < handleSize && Math.abs(mouseY - pt.y) < handleSize;
          };

          if (isNear(nw)) { activeHandleRef.current = 'nw'; return; }
          if (isNear(ne)) { activeHandleRef.current = 'ne'; return; }
          if (isNear(sw)) { activeHandleRef.current = 'sw'; return; }
          if (isNear(se)) { activeHandleRef.current = 'se'; return; }
        }

        isSelectingRef.current = true;
        selectStartRef.current = { x, y };
        onUpdateSelection?.(currentFrameId, activeLayerId, { x, y, w: 1, h: 1 });
      } else {
        isDrawingRef.current = true;
        handleCanvasClick(e, true); // Don't push to history on start!
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current && panStartRef.current && onPan) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      onPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
      return;
    }

    const rect = baseCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (selection) {
      const handleSize = 8;
      const nw = { x: selection.x * cellSize, y: selection.y * cellSize };
      const ne = { x: (selection.x + selection.w) * cellSize, y: selection.y * cellSize };
      const sw = { x: selection.x * cellSize, y: (selection.y + selection.h) * cellSize };
      const se = { x: (selection.x + selection.w) * cellSize, y: (selection.y + selection.h) * cellSize };

      const isNear = (pt: {x: number, y: number}) => {
        return Math.abs(mouseX - pt.x) < handleSize && Math.abs(mouseY - pt.y) < handleSize;
      };

      if (isNear(nw)) hoveredHandleRef.current = 'nw';
      else if (isNear(ne)) hoveredHandleRef.current = 'ne';
      else if (isNear(sw)) hoveredHandleRef.current = 'sw';
      else if (isNear(se)) hoveredHandleRef.current = 'se';
      else hoveredHandleRef.current = null;

      if (x >= selection.x && x < selection.x + selection.w &&
          y >= selection.y && y < selection.y + selection.h) {
        isOverSelectionRef.current = true;
      } else {
        isOverSelectionRef.current = false;
      }
    } else {
      isOverSelectionRef.current = false;
      hoveredHandleRef.current = null;
    }

    if (activeHandleRef.current && selection) {
      let newSelection = { ...selection };
      
      switch (activeHandleRef.current) {
        case 'nw':
          newSelection.w = selection.x + selection.w - x;
          newSelection.h = selection.y + selection.h - y;
          newSelection.x = x;
          newSelection.y = y;
          break;
        case 'ne':
          newSelection.w = x - selection.x + 1;
          newSelection.h = selection.y + selection.h - y;
          newSelection.y = y;
          break;
        case 'sw':
          newSelection.w = selection.x + selection.w - x;
          newSelection.x = x;
          newSelection.h = y - selection.y + 1;
          break;
        case 'se':
          newSelection.w = x - selection.x + 1;
          newSelection.h = y - selection.y + 1;
          break;
      }
      
      if (newSelection.w < 1) newSelection.w = 1;
      if (newSelection.h < 1) newSelection.h = 1;
      
      localSelectionRef.current = newSelection;
      return;
    }

    if (isSelectingRef.current && selectStartRef.current) {
      const x1 = Math.min(selectStartRef.current.x, x);
      const y1 = Math.min(selectStartRef.current.y, y);
      const x2 = Math.max(selectStartRef.current.x, x);
      const y2 = Math.max(selectStartRef.current.y, y);
      
      localSelectionRef.current = {
        x: x1,
        y: y1,
        w: x2 - x1 + 1,
        h: y2 - y1 + 1
      };
    } else if (isDrawingRef.current) {
      if (lastDrawnPixelRef.current?.x === x && lastDrawnPixelRef.current?.y === y) {
        return;
      }
      lastDrawnPixelRef.current = { x, y };
      handleCanvasClick(e, true); // Skip history on move!
    }
  };

  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      const canvas = overlayCanvasRef.current;
      if (canvas) canvas.style.cursor = isSpacePressedRef.current ? 'grab' : '';
      return;
    }

    if (isDrawingRef.current) {
      onPushHistory?.(); // Push the whole stroke to history!
      lastDrawnPixelRef.current = null; // Reset!
    }
    isSelectingRef.current = false;
    isDrawingRef.current = false;
    activeHandleRef.current = null;
    if (localSelectionRef.current) {
      onUpdateSelection?.(currentFrameId, activeLayerId, localSelectionRef.current);
      localSelectionRef.current = null;
    }
  };

  // Handle wheel zoom & pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onZoom || !onPan) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // ZOOM
        const delta = e.deltaY;
        const zoomFactor = delta < 0 ? 1.1 : 0.9;
        
        onZoom((prevZoom: number) => {
          const newZoom = Math.max(0.1, Math.min(10, prevZoom * zoomFactor));
          if (newZoom === prevZoom) return prevZoom;

          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left - rect.width / 2;
          const mouseY = e.clientY - rect.top - rect.height / 2;

          const localX = (mouseX - currentPanRef.current.x) / prevZoom;
          const localY = (mouseY - currentPanRef.current.y) / prevZoom;

          const newPanX = mouseX - localX * newZoom;
          const newPanY = mouseY - localY * newZoom;
          
          onPan({ x: newPanX, y: newPanY });
          return newZoom;
        });
      } else {
        // PAN
        onPan((prevPan) => ({
          x: prevPan.x - e.deltaX,
          y: prevPan.y - e.deltaY
        }));
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [onZoom, onPan]);

  return (
    <div ref={containerRef} className={`flex-1 min-h-0 flex items-center justify-center overflow-hidden relative ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Base Canvas */}
      <canvas
        ref={baseCanvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border border-border shadow-2xl max-w-full max-h-full object-contain [image-rendering:pixelated]"
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
        }}
      />

      {/* Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="absolute border border-transparent max-w-full max-h-full object-contain [image-rendering:pixelated] z-10"
        style={{
          cursor: tool === 'selection' ? (
            hoveredHandleRef.current === 'nw' || hoveredHandleRef.current === 'se' ? 'nwse-resize' :
            hoveredHandleRef.current === 'ne' || hoveredHandleRef.current === 'sw' ? 'nesw-resize' :
            isOverSelectionRef.current ? 'move' : 'crosshair'
          ) : "url('data:image/svg+xml;utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"%3E%3Ccircle cx=\"8\" cy=\"8\" r=\"3\" fill=\"white\" stroke=\"black\" stroke-width=\"1\"/%3E%3C/svg%3E') 8 8, auto",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
        }}
      />
      
      {/* Transform Toolbar */}
      {cel && (
        <div className="absolute top-4 right-4 bg-panel/80 backdrop-blur-sm border border-border px-3 py-2 rounded shadow-lg flex items-center gap-4 z-20">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">X</span>
            <span className="text-xs font-mono font-bold">{cel.transform?.x || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Y</span>
            <span className="text-xs font-mono font-bold">{cel.transform?.y || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Rot</span>
            <input
              type="number"
              value={cel.transform?.rotation || 0}
              onChange={(e) => {
                const rotation = parseInt(e.target.value) || 0;
                onUpdateTransform(currentFrameId, activeLayerId, {
                  x: cel.transform?.x || 0,
                  y: cel.transform?.y || 0,
                  rotation: rotation,
                });
              }}
              className="w-12 bg-transparent text-xs font-mono font-bold focus:outline-none focus:text-accent border-b border-dashed border-muted-foreground/50 hover:border-accent transition-colors"
            />
            <span className="text-xs font-mono font-bold">°</span>
          </div>
        </div>
      )}
      
    </div>
  );
});
