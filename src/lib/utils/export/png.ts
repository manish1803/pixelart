import { AnimationState } from '@/lib/models/animation';
import { renderFrameToCanvas } from './render';

interface ExportPNGOptions {
  state: AnimationState;
  frameId: string;
  gridSize: number;
  scale: number;
  includeBackground: boolean;
  bgColor: string;
}

/**
 * Exports a frame as a crisp PNG.
 */
export async function exportPNG({
  state,
  frameId,
  gridSize,
  scale = 1,
  includeBackground = false,
  bgColor = '#ffffff'
}: ExportPNGOptions): Promise<string> {
  // 1. Get the 1:1 composited canvas
  const sourceCanvas = renderFrameToCanvas({
    state,
    frameId,
    gridSize,
    includeBackground,
    bgColor
  });

  // 2. Create the scaled canvas
  const scaledSize = gridSize * scale;
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = scaledSize;
  targetCanvas.height = scaledSize;
  const ctx = targetCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // CRITICAL: Disable image smoothing for crisp pixel art!
  ctx.imageSmoothingEnabled = false;
  // Some browsers might need these prefixed versions:
  (ctx as any).webkitImageSmoothingEnabled = false;
  (ctx as any).mozImageSmoothingEnabled = false;
  (ctx as any).msImageSmoothingEnabled = false;

  // 3. Draw the small canvas onto the large canvas
  ctx.drawImage(
    sourceCanvas,
    0, 0, gridSize, gridSize, // Source rect
    0, 0, scaledSize, scaledSize // Target rect
  );

  return targetCanvas.toDataURL('image/png');
}
