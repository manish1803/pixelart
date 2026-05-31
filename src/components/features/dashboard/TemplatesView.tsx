import { Template } from '@/lib/data/defaultTemplates';
import { Grid } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TemplatesViewProps {
  onSelectTemplate: (template: Template) => void;
}

export function TemplatesView({ onSelectTemplate }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Templates</h2>
        <p className="text-xs text-muted">Start with a pre-configured canvas and palette.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 text-foreground">
            Loading templates...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="bg-panel border border-border hover:border-accent/50 rounded-xl p-5 text-left transition-colors group flex flex-col justify-between h-44"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-panel border border-border rounded-lg flex items-center justify-center group-hover:border-accent/50 transition-colors">
                    <Grid className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {template.gridSize}x{template.gridSize}
                    </div>
                    {(template as any).isSystem && (
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted bg-panel border border-border px-1.5 py-0.5 rounded">
                        Default
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-muted mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center gap-1 mt-auto">
                {template.palette.slice(0, 8).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm border border-black/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {template.palette.length > 8 && (
                  <span className="text-[10px] text-muted ml-1">+{template.palette.length - 8}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
