import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div 
      className={cn("flex items-center gap-3 select-none", className)}
      role="img"
      aria-label="Pixel"
    >
      <div className="grid grid-cols-2 gap-0.5 shrink-0">
        <div className="w-2.5 h-2.5 border border-border" />
        <div className="w-2.5 h-2.5 bg-[#00FF41]" />
        <div className="w-2.5 h-2.5 border border-border" />
        <div className="w-2.5 h-2.5 border border-border" />
      </div>
      {!iconOnly && (
        <span className="text-lg font-bold tracking-tighter leading-none text-foreground font-mono">pixel</span>
      )}
    </div>
  );
}
