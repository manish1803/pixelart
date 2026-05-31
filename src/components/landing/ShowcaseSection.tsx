"use client";
import { DraggableShowcase } from "./DraggableShowcase";

export function ShowcaseSection() {
  const items = [
    { src: "/sample-spaceship.png", title: "Void Strider", tag: "Sprite" },
    { src: "/sample-dragon.png", title: "Solstice Wyvern", tag: "Character" },
    { src: "/sample-landscape.png", title: "Neon Outpost", tag: "Environment" },
    { src: "/cyber-warrior.png", title: "Neon Samurai", tag: "Character" },
    { src: "/pixel-forest.png", title: "Aether Woods", tag: "Environment" },
    { src: "/mecha-beast.png", title: "Iron Goliath", tag: "Boss" },
  ];

  return (
    <section id="gallery" className="py-32 bg-surface-sunken overflow-visible">
      <div className="content-container">
        <div className="flex flex-col items-center text-center mb-12">
            <div className="max-w-xl">
                <h2 className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-4">The Gallery</h2>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                    Interactive Masterpieces.
                </h1>
                <p className="text-text-muted text-base max-w-sm mx-auto">
                    Grab, drag, and explore the high-quality assets built by the Pixel.art community.
                </p>
            </div>
        </div>
        
        {/* New Draggable Card Stack */}
        <DraggableShowcase items={items} />
      </div>
    </section>
  );
}
