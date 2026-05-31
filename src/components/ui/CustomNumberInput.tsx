'use client';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

interface CustomNumberInputProps {
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  label?: string;
  variant?: 'horizontal' | 'vertical';
}

export function CustomNumberInput({ value, onIncrement, onDecrement, label, variant = 'horizontal' }: CustomNumberInputProps) {

  if (variant === 'vertical') {
    return (
      <div className="flex items-center justify-between border border-border px-3 py-2 bg-transparent transition-colors">
        <span className="text-[10px] font-bold uppercase text-foreground">{value}</span>
        <div className="flex flex-col border-l border-border pl-2 gap-1">
          <button onClick={onIncrement} className="hover:text-accent transition-colors text-muted">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button onClick={onDecrement} className="hover:text-accent transition-colors text-muted">
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex-1 h-8 flex items-center justify-center border border-border px-3 text-foreground transition-colors">
        <span className="text-[10px] font-bold uppercase">{value}</span>
      </div>
      <button 
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
