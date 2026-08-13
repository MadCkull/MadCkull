"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const IDENTITIES = [
  "Data Scientist",
  "AI Engineer",
  "Builder",
  "Creative Technologist",
];

export function DynamicIdentity() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IDENTITIES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative h-8 flex items-center overflow-visible w-full">
      <AnimatePresence>
        <motion.span
          key={currentIndex}
          initial={{ filter: "blur(12px)", opacity: 0, y: 5 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          exit={{ filter: "blur(12px)", opacity: 0, y: -5 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="absolute right-0 text-zinc-400 font-light tracking-widest text-sm uppercase whitespace-nowrap text-right"
        >
          {IDENTITIES[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
