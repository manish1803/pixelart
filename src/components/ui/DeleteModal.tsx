'use client';
import { Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  darkMode: boolean;
}

export function DeleteModal({ isOpen, onClose, onConfirm, projectName, darkMode }: DeleteModalProps) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
              Delete Project
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center transition-colors hover:opacity-50 text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-[11px] leading-relaxed tracking-wide text-muted">
            Are you sure you want to delete <span className="font-bold text-foreground">"{projectName}"</span>? This action cannot be undone and all pixel data will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-panel text-foreground border-r border-border"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors bg-red-600 text-white hover:bg-red-700"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
