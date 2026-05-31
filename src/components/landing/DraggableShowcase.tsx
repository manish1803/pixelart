"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ShowcaseItem {
  src: string;
  title: string;
  tag: string;
}

interface DraggableShowcaseProps {
  items: ShowcaseItem[];
}

interface CardState extends ShowcaseItem {
  id: number;
  rotation: number;
  xOffset: number;
  yOffset: number;
}

export function DraggableShowcase({ items }: DraggableShowcaseProps) {
  const [cards, setCards] = useState<CardState[]>([]);
  const itemsSignature = JSON.stringify(items);

  // Fix Hydration mismatch by generating random values only on the client
  useEffect(() => {
    setCards(
      items.map((item, i) => ({
        ...item,
        id: i,
        rotation: Math.random() * 20 - 10,
        xOffset: Math.random() * 120 - 60,
        yOffset: Math.random() * 80 - 40,
      }))
    );
  }, [itemsSignature]);

  return (
    <div className="relative w-full h-[650px] md:h-[750px] flex items-center justify-center overflow-visible select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full scale-75 pointer-events-none" />
      
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            drag
            dragConstraints={{ left: -450, right: 450, top: -300, bottom: 300 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            initial={{ 
              rotate: card.rotation,
              x: card.xOffset,
              y: 200, 
              opacity: 0,
              scale: 0.9
            }}
            whileInView={{ 
              opacity: 1, 
              scale: 1,
              y: card.yOffset,
              x: card.xOffset,
              transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 20, 
                delay: index * 0.12 
              }
            }}
            viewport={{ once: true, amount: 0.1 }}
            className="absolute cursor-grab active:cursor-grabbing will-change-transform"
            style={{ zIndex: index }}
          >
            <div className="w-[200px] md:w-[260px] p-2.5 bg-[#141414] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md group overflow-hidden">
              {/* Image Container */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/5 pointer-events-none">
                <Image
                  src={card.src}
                  alt={card.title}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 200px, 260px"
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 select-none"
                />
                
                {/* Tag Overlay */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 border border-white/10 rounded text-[7px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-md">
                  {card.tag}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="mt-3 pb-1 px-1 pointer-events-none">
                <h4 className="text-[11px] font-bold tracking-tight text-white/80 truncate">
                  {card.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 opacity-30">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-[8px] uppercase font-bold tracking-widest text-white">
                    PIXEL.ART
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructional Label */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 border border-white/5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 pointer-events-none z-50"
      >
        Drag cards to explore
      </motion.div>
    </div>
  );
}
