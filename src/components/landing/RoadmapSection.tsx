"use client";
import { FadeInSection } from "../shared/FadeInSection";

export function RoadmapSection() {
  const steps = [
    {
      period: "Q3 2026",
      title: "Multiplayer Engine",
      description: "Real-time collaboration with shared canvases, presence cursors, and live team syncing.",
      status: "In Progress"
    },
    {
      period: "Q4 2026",
      title: "AI Asset Generation",
      description: "Generate base sprites and palettes using our proprietary AI model trained on high-quality pixel art.",
      status: "Planning"
    },
    {
      period: "2027",
      title: "Global Marketplace",
      description: "Buy, sell, and share unique pixel art assets and animation templates within a global community.",
      status: "Vision"
    },
  ];

  return (
    <section id="roadmap" className="section-padding bg-background">
      <div className="content-container">
        <FadeInSection direction="up">
          <div className="max-w-2xl mb-24">
              <span className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-4 block">Future Vision</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Roadmap to perfection.
              </h2>
          </div>
        </FadeInSection>
        
        <div className="space-y-12">
          {steps.map((step, i) => (
            <FadeInSection key={i} delay={i * 0.15} direction="up">
              <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-start group">
                <div className="w-32 flex-shrink-0 pt-1">
                  <span className="text-sm font-black text-text-muted group-hover:text-accent transition-colors tracking-tight">{step.period}</span>
                </div>
                <div className="flex-1 pb-12 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] uppercase font-bold tracking-widest text-text-muted">{step.status}</span>
                  </div>
                  <p className="text-text-muted text-base leading-relaxed max-w-2xl">
                      {step.description}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
