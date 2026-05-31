"use client";
import {
    IconArtboard,
    IconBolt,
    IconCloud,
    IconDeviceLaptop,
    IconDownload,
    IconStack2
} from "@tabler/icons-react";
import { FadeInSection } from "../shared/FadeInSection";

export function FeatureGrid() {
  const features = [
    {
      title: "Cloud Persistence",
      description: "Securely save your projects and access them from any device. Real-time synchronization keeps your workflow fluid.",
      icon: <IconCloud className="w-6 h-6" />,
    },
    {
      title: "High Performance",
      description: "A canvas engine optimized for speed. Handle massive grid sizes and complex animations without dropping a frame.",
      icon: <IconBolt className="w-6 h-6" />,
    },
    {
      title: "Layered Animation",
      description: "Professional frame-by-frame animation tools. Duplicate, reorder, and refine your sprites with ease.",
      icon: <IconStack2 className="w-6 h-6" />,
    },
    {
      title: "Cross-Platform",
      description: "Works beautifully on desktop, tablet, and mobile. A consistent experience across every screen.",
      icon: <IconDeviceLaptop className="w-6 h-6" />,
    },
    {
      title: "Custom Brushes",
      description: "Precise drawing tools designed for pixel perfection. Pencil, fill, and advanced selection capabilities.",
      icon: <IconArtboard className="w-6 h-6" />,
    },
    {
      title: "Vector Export",
      description: "Export your work as high-quality PNGs or infinitely scalable SVGs. Perfect for game assets and web.",
      icon: <IconDownload className="w-6 h-6" />,
    },
  ];

  return (
    <section id="features" className="section-padding bg-background">
      <div className="content-container">
        <div className="max-w-2xl mb-20">
            <h2 className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-4">Core Workflow</h2>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Engineered for artists who <br /> demand precision.
            </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, i) => (
            <FadeInSection key={i} delay={i * 0.1} direction="up">
              <div className="group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-accent mb-6 transition-all group-hover:bg-accent group-hover:text-background group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
