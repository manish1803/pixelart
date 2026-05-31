export interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  opacity?: number; // 0-100
  blendMode?: GlobalCompositeOperation; // Canvas blend mode
}

export interface Frame {
  id: string;
}

export interface CelData {
  id: string;
  pixels: { [key: string]: string }; // key: "x,y", value: color
}

export interface Cel {
  layerId: string;
  frameId: string;
  dataId: string; // Points to CelData
  transform?: {
    x: number;
    y: number;
    rotation: number;
  };
  selection?: { x: number; y: number; w: number; h: number } | null;
}

export interface AnimationState {
  layers: Layer[];
  frames: Frame[];
  cels: Cel[];
  celData: { [dataId: string]: CelData };
  thumbnailFrameId?: string;
}

// Helper to create a new state
export function createInitialState(): AnimationState {
  const defaultLayer: Layer = { id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false, opacity: 100, blendMode: 'source-over' };
  const defaultFrame: Frame = { id: 'frame-1' };
  const defaultCelData: CelData = { id: 'data-1', pixels: {} };
  const defaultCel: Cel = { layerId: 'layer-1', frameId: 'frame-1', dataId: 'data-1' };

  return {
    layers: [defaultLayer],
    frames: [defaultFrame],
    cels: [defaultCel],
    celData: { 'data-1': defaultCelData },
  };
}

// Helper to find a cel by frame and layer
export function findCel(state: AnimationState, frameId: string, layerId: string): Cel | undefined {
  return state.cels.find((c) => c.frameId === frameId && c.layerId === layerId);
}

// Helper to find pixels for a frame and layer
export function getPixels(state: AnimationState, frameId: string, layerId: string): { [key: string]: string } {
  const cel = findCel(state, frameId, layerId);
  if (!cel) return {};
  return state.celData[cel.dataId]?.pixels || {};
}
