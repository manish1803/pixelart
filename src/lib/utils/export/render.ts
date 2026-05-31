import { AnimationState, findCel } from '@/lib/models/animation';

interface RenderFrameOptions {
  state: AnimationState;
  frameId: string;
  gridSize: number;
  includeBackground?: boolean;
  bgColor?: string;
}

/**
 * Composites all visible layers for a given frame onto a canvas at 1:1 pixel scale.
 * This ensures pixel-perfect rendering that can be scaled up later.
 */
export function renderFrameToCanvas({
  state,
  frameId,
  gridSize,
  includeBackground = false,
  bgColor = '#ffffff'
}: RenderFrameOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Disable image smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;

  // 1. Fill background if requested
  if (includeBackground) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, gridSize, gridSize);
  }

  // 2. Render layers from bottom to top
  // Assuming layers array is ordered from top to bottom (usually the case in UI)
  // So we need to reverse it to draw bottom layers first!
  const layersToRender = [...state.layers].reverse();

  layersToRender.forEach((layer) => {
    if (!layer.isVisible) return;

    const cel = findCel(state, frameId, layer.id);
    if (!cel) return;

    const celData = state.celData[cel.dataId];
    if (!celData || !celData.pixels) return;

    // Create a temporary canvas for the layer to apply opacity and blend mode
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = gridSize;
    layerCanvas.height = gridSize;
    const layerCtx = layerCanvas.getContext('2d');
    
    if (!layerCtx) return;
    layerCtx.imageSmoothingEnabled = false;

    // Draw pixels on the layer canvas
    Object.entries(celData.pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      layerCtx.fillStyle = color;
      layerCtx.fillRect(x, y, 1, 1);
    });

    // Apply layer properties to main context
    ctx.save();
    ctx.globalAlpha = (layer.opacity ?? 100) / 100;
    ctx.globalCompositeOperation = layer.blendMode || 'source-over';
    
    // Draw the layer canvas onto the main canvas
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();
  });

  return canvas;
}
