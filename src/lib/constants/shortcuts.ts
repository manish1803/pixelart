export interface ShortcutDefinition {
  id: string;
  key: string;
  description: string;
  category: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { id: 'palette', key: 'Cmd+K', description: 'Open Command Palette', category: 'General' },
  { id: 'shortcuts', key: 'Cmd+/', description: 'Open Shortcuts Reference', category: 'General' },
  { id: 'undo', key: 'Cmd+Z', description: 'Undo', category: 'History' },
  { id: 'redo', key: 'Cmd+Shift+Z', description: 'Redo', category: 'History' },
  { id: 'save', key: 'Cmd+S', description: 'Save Project', category: 'File' },
  
  // Edit
  { id: 'cut', key: 'Cmd+X', description: 'Cut Selection', category: 'Edit' },
  { id: 'copy', key: 'Cmd+C', description: 'Copy Selection', category: 'Edit' },
  { id: 'paste', key: 'Cmd+V', description: 'Paste Selection', category: 'Edit' },
  
  // Tools
  { id: 'fill', key: 'F', description: 'Fill Tool (Draw)', category: 'Tools' },
  { id: 'erase', key: 'E', description: 'Erase Tool', category: 'Tools' },
  { id: 'picker', key: 'I', description: 'Color Picker', category: 'Tools' },
  { id: 'selection', key: 'S', description: 'Selection Tool', category: 'Tools' },
  { id: 'brush-dec', key: ',', description: 'Decrease Brush Size', category: 'Tools' },
  { id: 'brush-inc', key: '.', description: 'Increase Brush Size', category: 'Tools' },
  
  // Canvas Navigation
  { id: 'pan', key: 'Space + Drag', description: 'Pan Canvas', category: 'Navigation' },
  { id: 'zoom', key: 'Wheel', description: 'Zoom In/Out', category: 'Navigation' },
  
  // Animation
  { id: 'play', key: 'Space', description: 'Play/Pause', category: 'Animation' },
  { id: 'next-frame', key: 'N', description: 'Next Frame', category: 'Animation' },
  { id: 'prev-frame', key: 'B', description: 'Previous Frame', category: 'Animation' },
  { id: 'delete-frame', key: 'Alt+Backspace', description: 'Delete Frame', category: 'Animation' },

  // Layers
  { id: 'new-layer', key: 'Shift+N', description: 'New Layer', category: 'Layers' },
  { id: 'duplicate-layer', key: 'Cmd+J', description: 'Duplicate Layer', category: 'Layers' },
  { id: 'delete-layer', key: 'Delete', description: 'Delete Layer', category: 'Layers' },
  { id: 'move-layer-up', key: ']', description: 'Move Layer Up', category: 'Layers' },
  { id: 'move-layer-down', key: '[', description: 'Move Layer Down', category: 'Layers' },
  { id: 'select-layer-above', key: 'PgUp', description: 'Select Layer Above', category: 'Layers' },
  { id: 'select-layer-below', key: 'PgDn', description: 'Select Layer Below', category: 'Layers' },
];
