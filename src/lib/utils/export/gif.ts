import { AnimationState } from '@/lib/models/animation';
import { renderFrameToCanvas } from './render';

interface ExportGIFOptions {
  state: AnimationState;
  gridSize: number;
  scale: number;
  fps: number;
  includeBackground: boolean;
  bgColor: string;
  onProgress?: (progress: number) => void;
  startFrame?: number;
  endFrame?: number;
}

/**
 * Exports the animation as a GIF using gifenc via CDN.
 */
export async function exportGIF({
  state,
  gridSize,
  scale = 1,
  fps = 12,
  includeBackground = false,
  bgColor = '#ffffff',
  onProgress,
  startFrame = 0,
  endFrame = state.frames.length - 1
}: ExportGIFOptions): Promise<string> {
  // 1. Dynamically import gifenc from CDN
  // We use this approach to avoid adding heavy dependencies to package.json
  // and to ensure it only runs in the browser.
  let gifenc: any;
  try {
    // @ts-ignore: Dynamic import from CDN
    gifenc = await import(/* webpackIgnore: true */ 'https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js');
  } catch (e) {
    console.error('Failed to load gifenc from CDN', e);
    throw new Error('Failed to load GIF encoder. Please check your internet connection.');
  }

  const { GIFEncoder, quantize, applyPalette } = gifenc;
  const gif = new GIFEncoder();

  const width = gridSize * scale;
  const height = gridSize * scale;
  const delay = Math.round(1000 / fps); // Delay in milliseconds

  // Temporary canvas for scaling
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');
  ctx.imageSmoothingEnabled = false;

  const totalToExport = endFrame - startFrame + 1;

  // 2. Encode each frame
  for (let i = startFrame; i <= endFrame; i++) {
    const frame = state.frames[i];
    
    // Render 1:1 frame
    const sourceCanvas = renderFrameToCanvas({
      state,
      frameId: frame.id,
      gridSize,
      includeBackground,
      bgColor
    });

    // Scale up
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(sourceCanvas, 0, 0, gridSize, gridSize, 0, 0, width, height);

    // Get RGBA pixels
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Quantize to 256 colors
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    // Write frame
    gif.writeFrame(index, width, height, { palette, delay });

    if (onProgress) {
      onProgress((i - startFrame + 1) / totalToExport);
    }
  }

  gif.finish();

  // 3. Convert to Blob and return URL
  const buffer = gif.bytes();
  const blob = new Blob([buffer], { type: 'image/gif' });
  return URL.createObjectURL(blob);
}
