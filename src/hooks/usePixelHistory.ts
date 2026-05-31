import { useCallback, useState } from 'react';

export interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

export function usePixelHistory(initialState: Frame[] = [{ id: 1, pixels: {} }]) {
  const [frames, setFrames] = useState<Frame[]>(initialState);
  const [history, setHistory] = useState<Frame[][]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateFramesWithHistory = useCallback((newFrames: Frame[]) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newFrames);
      return newHistory;
    });
    setHistoryIndex(prevIndex => prevIndex + 1);
    setFrames(newFrames);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setFrames(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setFrames(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    const emptyState = [{ id: 1, pixels: {} }];
    setFrames(emptyState);
    setHistory([emptyState]);
    setHistoryIndex(0);
  }, []);

  return {
    frames,
    setFrames: updateFramesWithHistory,
    setFramesWithoutHistory: setFrames,
    history,
    historyIndex,
    undo,
    redo,
    clearHistory
  };
}
