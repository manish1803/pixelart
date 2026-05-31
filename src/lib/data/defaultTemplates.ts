export interface Template {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  palette: string[];
  preview?: string; // Optional SVG or base64 preview
}

export const defaultTemplates: Template[] = [
  {
    id: 'pico-8',
    name: 'Pico-8 Sprite',
    description: 'Classic 8x8 grid with the famous 16-color Pico-8 palette.',
    gridSize: 8,
    palette: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
    ]
  },
  {
    id: 'gameboy',
    name: 'Retro Game Boy',
    description: '16x16 grid with the classic 4-color pea-green palette.',
    gridSize: 16,
    palette: [
      '#0f380f', '#306230', '#8bac0f', '#9bbc0f'
    ]
  },
  {
    id: 'app-icon',
    name: 'HD Icon',
    description: '64x64 grid for detailed icons and complex art.',
    gridSize: 64,
    palette: [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
      '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'
    ]
  }
];
