import { useEffect } from 'react';

interface GlobalShortcutsConfig {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onClear: () => void;
  onSetTool: (tool: 'fill' | 'erase' | 'picker' | 'selection') => void;
  onAdjustBrush: (increment: boolean) => void;
  onToggleCommandPalette: () => void;
  onToggleShortcuts: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onTogglePlay?: () => void;
  onNextFrame?: () => void;
  onPrevFrame?: () => void;

  // Layer Shortcuts
  onNewLayer?: () => void;
  onDuplicateLayer?: () => void;
  onDeleteLayer?: () => void;
  onDeleteFrame?: () => void;
  onMoveLayerUp?: () => void;
  onMoveLayerDown?: () => void;
  onSelectLayerAbove?: () => void;
  onSelectLayerBelow?: () => void;
}

export function useGlobalShortcuts({
  onUndo,
  onRedo,
  onSave,
  onClear,
  onSetTool,
  onAdjustBrush,
  onToggleCommandPalette,
  onToggleShortcuts,
  onCopy,
  onCut,
  onPaste,
  onTogglePlay,
  onNextFrame,
  onPrevFrame,
  onNewLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onDeleteFrame,
  onMoveLayerUp,
  onMoveLayerDown,
  onSelectLayerAbove,
  onSelectLayerBelow
}: GlobalShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmd = isMac ? e.metaKey : e.ctrlKey;

      if (cmd && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onRedo();
      } else if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo();
      } else if (cmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      } else if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette();
      } else if (cmd && e.key === '/') {
        e.preventDefault();
        onToggleShortcuts();
      } else if (cmd && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        onCut();
      } else if (cmd && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onCopy();
      } else if (cmd && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        onPaste();
      } else if (cmd && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        onDuplicateLayer?.();
      } else if (e.altKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        onDeleteFrame?.();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteLayer?.();
      } else if (e.key === '[') {
        e.preventDefault();
        onMoveLayerDown?.();
      } else if (e.key === ']') {
        e.preventDefault();
        onMoveLayerUp?.();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        onSelectLayerAbove?.();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        onSelectLayerBelow?.();
      } else if (!cmd && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            onSetTool('fill');
            break;
          case 'e':
            onSetTool('erase');
            break;
          case 'i':
            onSetTool('picker');
            break;
          case 's':
            onSetTool('selection');
            break;
          case ' ':
            e.preventDefault();
            onTogglePlay?.();
            break;
          case 'n':
            if (e.shiftKey) {
              onNewLayer?.();
            } else {
              onNextFrame?.();
            }
            break;
          case 'b':
            onPrevFrame?.();
            break;
          case '.':
            onAdjustBrush(true); // increment
            break;
          case ',':
            onAdjustBrush(false); // decrement
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onUndo, onRedo, onSave, onClear, onSetTool, onAdjustBrush, onToggleCommandPalette, onToggleShortcuts, onCopy, onCut, onPaste, onTogglePlay, onNextFrame, onPrevFrame]);
}
