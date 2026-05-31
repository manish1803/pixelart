'use client';
import { FolderPlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  darkMode: boolean;
}

export function CreateFolderModal({ isOpen, onClose, onConfirm, darkMode }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <form 
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-accent/10 text-accent border border-border">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
              Create New Folder
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center transition-colors hover:opacity-50 text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Folder Name</label>
            <input
              ref={inputRef}
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Character Concepts"
              className="w-full bg-panel border border-border px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-accent text-foreground md:text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-panel text-foreground border-r border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!folderName.trim()}
            className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors bg-accent text-black hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Folder
          </button>
        </div>
      </form>
    </div>
  );
}
