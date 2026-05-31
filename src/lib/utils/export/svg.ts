import { AnimationState } from '@/lib/models/animation';
import { renderFrameToCanvas } from './render';

interface ExportSVGOptions {
  state: AnimationState;
  frameId: string;
  gridSize: number;
  includeBackground: boolean;
  bgColor: string;
}

/**
 * Exports a frame as an SVG.
 * Reads the composited canvas to ensure layers and opacities are respected.
 */
export async function exportSVG({
  state,
  frameId,
  gridSize,
  includeBackground = false,
  bgColor = '#ffffff'
}: ExportSVGOptions): Promise<string> {
  // 1. Get the 1:1 composited canvas
  const sourceCanvas = renderFrameToCanvas({
    state,
    frameId,
    gridSize,
    includeBackground,
    bgColor
  });

  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');

  const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
  const { data } = imageData;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridSize} ${gridSize}" width="100%" height="100%" style="image-rendering: pixelated; shape-rendering: crispEdges;">`;

  // Add background rect if requested
  if (includeBackground) {
    svgContent += `<rect width="${gridSize}" height="${gridSize}" fill="${bgColor}" />`;
  }

  // Helper to convert RGBA to hex
  const rgbaToHex = (r: number, g: number, b: number, a: number) => {
    if (a === 0) return null;
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Generate rects for each pixel
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = (y * gridSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const color = rgbaToHex(r, g, b, a);
      if (color) {
        // We use opacity if alpha is not 255
        const opacity = a / 255;
        const opacityAttr = opacity < 1 ? ` opacity="${opacity.toFixed(2)}"` : '';
        svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"${opacityAttr} />`;
      }
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}
