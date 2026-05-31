'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiscreteSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function DiscreteSlider({ value, min, max, onChange }: DiscreteSliderProps) {

  const steps = [1, 2, 4, 8, 16]; 
  const markers = [1, 2, 3, 4, 5]; 

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleDecrement}
        className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex-1 h-8 flex items-center px-2 gap-2 border border-border">
        {/* Square representing size */}
        <div 
          className="w-4 h-4 border border-foreground bg-foreground transition-transform duration-200"
          style={{ 
            transform: `scale(${Math.max(0.2, Math.min(1, value / max))})` 
          }}
        />
        
        {/* Markers */}
        <div className="flex-1 flex justify-between px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`w-[1px] h-2 transition-colors duration-200 ${
                i <= (value / max) * 5 ? 'bg-foreground' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <button 
        onClick={handleIncrement}
        className="w-8 h-8 flex items-center justify-center border border-border hover-accent text-muted"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
