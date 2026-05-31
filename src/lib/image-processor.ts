export function pixelateImage(
  image: HTMLImageElement, 
  targetSize: number, 
  smoothing: number = 0,
  mode: 'fit' | 'crop' | 'stretch' | 'aspect' = 'stretch'
): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  let sourceCanvas = document.createElement('canvas');
  let sourceCtx = sourceCanvas.getContext('2d')!;
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  
  if (smoothing > 0) {
    sourceCtx.filter = `blur(${smoothing}px)`;
  }
  sourceCtx.drawImage(image, 0, 0);
  
  // Multi-step downscaling (Area Average approximation)
  let currentWidth = image.naturalWidth;
  let currentHeight = image.naturalHeight;
  
  while (currentWidth > targetSize * 2) {
    currentWidth = Math.floor(currentWidth / 2);
    currentHeight = Math.floor(currentHeight / 2);
    
    const nextCanvas = document.createElement('canvas');
    const nextCtx = nextCanvas.getContext('2d')!;
    nextCanvas.width = currentWidth;
    nextCanvas.height = currentHeight;
    
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, currentWidth, currentHeight);
    
    sourceCanvas = nextCanvas;
    sourceCtx = nextCtx;
  }
  
  const k = 4;
  const intermediateCanvas = document.createElement('canvas');
  const intermediateCtx = intermediateCanvas.getContext('2d')!;
  intermediateCanvas.width = targetSize * k;
  intermediateCanvas.height = targetSize * k;
  
  let drawWidth = targetSize * k;
  let drawHeight = targetSize * k;
  let offsetX = 0;
  let offsetY = 0;
  
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  
  if (mode === 'fit' || mode === 'aspect') {
    const scale = Math.min((targetSize * k) / sourceWidth, (targetSize * k) / sourceHeight);
    drawWidth = sourceWidth * scale;
    drawHeight = sourceHeight * scale;
    offsetX = ((targetSize * k) - drawWidth) / 2;
    offsetY = ((targetSize * k) - drawHeight) / 2;
  } else if (mode === 'crop') {
    const scale = Math.max((targetSize * k) / sourceWidth, (targetSize * k) / sourceHeight);
    drawWidth = sourceWidth * scale;
    drawHeight = sourceHeight * scale;
    offsetX = ((targetSize * k) - drawWidth) / 2;
    offsetY = ((targetSize * k) - drawHeight) / 2;
  }
  
  intermediateCtx.imageSmoothingEnabled = true;
  intermediateCtx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);
  
  const intData = intermediateCtx.getImageData(0, 0, targetSize * k, targetSize * k).data;
  const finalImageData = ctx.createImageData(targetSize, targetSize);
  const finalData = finalImageData.data;
  
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const colorCounts: { [key: string]: number } = {};
      const colorValues: { [key: string]: {r:number,g:number,b:number,a:number} } = {};
      
      const startX = x * k;
      const startY = y * k;
      
      for (let by = 0; by < k; by++) {
        for (let bx = 0; bx < k; bx++) {
          const i = ((startY + by) * (targetSize * k) + (startX + bx)) * 4;
          const r = intData[i];
          const g = intData[i+1];
          const b = intData[i+2];
          const a = intData[i+3];
          
          if (a > 128) {
            const key = `${r},${g},${b}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
            colorValues[key] = {r, g, b, a};
          }
        }
      }
      
      let maxCount = 0;
      let modeColor = {r:0, g:0, b:0, a:255}; // Default to opaque black if empty
      
      for (const key in colorCounts) {
        if (colorCounts[key] > maxCount) {
          maxCount = colorCounts[key];
          modeColor = colorValues[key];
        }
      }
      
      const fi = (y * targetSize + x) * 4;
      finalData[fi] = modeColor.r;
      finalData[fi+1] = modeColor.g;
      finalData[fi+2] = modeColor.b;
      finalData[fi+3] = modeColor.a;
    }
  }
  
  return finalImageData;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

class Box {
  colors: Color[];
  minR: number; maxR: number;
  minG: number; maxG: number;
  minB: number; maxB: number;

  constructor(colors: Color[]) {
    this.colors = colors;
    this.minR = this.maxR = colors[0].r;
    this.minG = this.maxG = colors[0].g;
    this.minB = this.maxB = colors[0].b;
    for (const c of colors) {
      if (c.r < this.minR) this.minR = c.r;
      if (c.r > this.maxR) this.maxR = c.r;
      if (c.g < this.minG) this.minG = c.g;
      if (c.g > this.maxG) this.maxG = c.g;
      if (c.b < this.minB) this.minB = c.b;
      if (c.b > this.maxB) this.maxB = c.b;
    }
  }

  getVolume() {
    return (this.maxR - this.minR) * (this.maxG - this.minG) * (this.maxB - this.minB);
  }

  getLongestAxis(): 'r' | 'g' | 'b' {
    const rRange = this.maxR - this.minR;
    const gRange = this.maxG - this.minG;
    const bRange = this.maxB - this.minB;
    if (rRange >= gRange && rRange >= bRange) return 'r';
    if (gRange >= rRange && gRange >= bRange) return 'g';
    return 'b';
  }

  split(): [Box, Box] {
    const axis = this.getLongestAxis();
    this.colors.sort((a, b) => a[axis] - b[axis]);
    const median = Math.floor(this.colors.length / 2);
    return [
      new Box(this.colors.slice(0, median)),
      new Box(this.colors.slice(median))
    ];
  }

  getAverageColor(): Color {
    let r = 0, g = 0, b = 0;
    for (const c of this.colors) {
      r += c.r;
      g += c.g;
      b += c.b;
    }
    return {
      r: Math.round(r / this.colors.length),
      g: Math.round(g / this.colors.length),
      b: Math.round(b / this.colors.length)
    };
  }
}

export function reduceColors(imageData: ImageData, maxColors: number): ImageData {
  const data = imageData.data;
  const colors: Color[] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 128) {
      colors.push({ r: data[i], g: data[i+1], b: data[i+2] });
    }
  }
  
  if (colors.length === 0) return imageData;
  
  let boxes: Box[] = [new Box(colors)];
  while (boxes.length < maxColors) {
    let maxVolBoxIndex = 0;
    let maxVol = boxes[0].getVolume();
    for (let i = 1; i < boxes.length; i++) {
      const vol = boxes[i].getVolume();
      if (vol > maxVol) {
        maxVol = vol;
        maxVolBoxIndex = i;
      }
    }
    
    const boxToSplit = boxes[maxVolBoxIndex];
    if (boxToSplit.colors.length < 2) break;
    
    const [b1, b2] = boxToSplit.split();
    boxes.splice(maxVolBoxIndex, 1, b1, b2);
  }
  
  const palette = boxes.map(b => b.getAverageColor());
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 128) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      let closestColor = palette[0];
      let minDistance = Number.MAX_VALUE;
      
      for (const pColor of palette) {
        const dist = Math.pow(r - pColor.r, 2) + Math.pow(g - pColor.g, 2) + Math.pow(b - pColor.b, 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestColor = pColor;
        }
      }
      
      data[i] = closestColor.r;
      data[i+1] = closestColor.g;
      data[i+2] = closestColor.b;
    }
  }
  
  return imageData;
}

export function applyDithering(imageData: ImageData, palette: string[]): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  const rgbPalette = palette.map(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  });
  
  function findClosestColor(r: number, g: number, b: number) {
    let closestColor = rgbPalette[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const pColor of rgbPalette) {
      const dist = Math.pow(r - pColor.r, 2) + Math.pow(g - pColor.g, 2) + Math.pow(b - pColor.b, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closestColor = pColor;
      }
    }
    return [closestColor.r, closestColor.g, closestColor.b];
  }
  
  function clamp(val: number) {
    return Math.min(255, Math.max(0, val));
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldR = data[i];
      const oldG = data[i+1];
      const oldB = data[i+2];
      
      const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB);
      
      data[i] = newR;
      data[i+1] = newG;
      data[i+2] = newB;
      
      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;
      
      // Diffuse error (Floyd-Steinberg)
      if (x + 1 < width) {
        const i1 = (y * width + (x + 1)) * 4;
        data[i1] = clamp(data[i1] + errR * 7/16);
        data[i1+1] = clamp(data[i1+1] + errG * 7/16);
        data[i1+2] = clamp(data[i1+2] + errB * 7/16);
      }
      if (x - 1 >= 0 && y + 1 < height) {
        const i2 = ((y + 1) * width + (x - 1)) * 4;
        data[i2] = clamp(data[i2] + errR * 3/16);
        data[i2+1] = clamp(data[i2+1] + errG * 3/16);
        data[i2+2] = clamp(data[i2+2] + errB * 3/16);
      }
      if (y + 1 < height) {
        const i3 = ((y + 1) * width + x) * 4;
        data[i3] = clamp(data[i3] + errR * 5/16);
        data[i3+1] = clamp(data[i3+1] + errG * 5/16);
        data[i3+2] = clamp(data[i3+2] + errB * 5/16);
      }
      if (x + 1 < width && y + 1 < height) {
        const i4 = ((y + 1) * width + (x + 1)) * 4;
        data[i4] = clamp(data[i4] + errR * 1/16);
        data[i4+1] = clamp(data[i4+1] + errG * 1/16);
        data[i4+2] = clamp(data[i4+2] + errB * 1/16);
      }
    }
  }
  return imageData;
}

export function convertImageDataToProjectPixels(imageData: ImageData): { pixels: { [key: string]: string }, palette: string[] } {
  const pixels: { [key: string]: string } = {};
  const paletteSet = new Set<string>();
  const data = imageData.data;
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a > 128) { // Only add non-transparent pixels
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        pixels[`${x},${y}`] = hex;
        paletteSet.add(hex);
      }
    }
  }
  return { pixels, palette: Array.from(paletteSet) };
}

export function convertImageDataToLayersByColor(imageData: ImageData): { layers: { [color: string]: { [key: string]: string } }, palette: string[] } {
  const layers: { [color: string]: { [key: string]: string } } = {};
  const paletteSet = new Set<string>();
  const data = imageData.data;
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a > 128) {
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        paletteSet.add(hex);
        
        if (!layers[hex]) {
          layers[hex] = {};
        }
        layers[hex][`${x},${y}`] = hex;
      }
    }
  }
  return { layers, palette: Array.from(paletteSet) };
}

export function mapToPalette(imageData: ImageData, palette: string[]): ImageData {
  const data = imageData.data;
  
  const rgbPalette = palette.map(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  });
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 128) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      let closestColor = rgbPalette[0];
      let minDistance = Number.MAX_VALUE;
      
      for (const pColor of rgbPalette) {
        const dist = Math.pow(r - pColor.r, 2) + Math.pow(g - pColor.g, 2) + Math.pow(b - pColor.b, 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestColor = pColor;
        }
      }
      
      data[i] = closestColor.r;
      data[i+1] = closestColor.g;
      data[i+2] = closestColor.b;
    }
  }
  
  return imageData;
}
