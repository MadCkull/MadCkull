"use client";

import { motion } from "motion/react";
import Image from "next/image";

export function Portrait() {
  return (
    <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
      <div 
        className="absolute top-0 right-0 w-full md:w-[50vw] h-full"
        style={{
          // Creates a natural blend into the dark background, avoiding hard rectangular edges
          maskImage: "radial-gradient(ellipse at 70% 40%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 20%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 bg-zinc-900/50 mix-blend-luminosity">
          
          {/* Desktop Image */}
          <div className="hidden md:block w-full h-full relative">
            <Image 
              src="/images/hero/portrait-desktop.webp" 
              alt="Hassan Ali Desktop Portrait"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center opacity-80"
            />
          </div>

          {/* Mobile Image */}
          <div className="block md:hidden w-full h-full relative">
            <Image 
              src="/images/hero/portrait-mobile.webp" 
              alt="Hassan Ali Mobile Portrait"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top opacity-80"
            />
          </div>

          {/* Fallback overlay gradient to ensure the dark blend remains strong */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-zinc-900/40 to-black/80" />
        </div>
      </div>
    </div>
  );
}
