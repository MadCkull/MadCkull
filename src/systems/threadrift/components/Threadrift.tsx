"use client";

import { useEffect, useState } from "react";
import { useThreadriftStore } from "../store/threadrift-store";
import { ThreadriftCanvas } from "./ThreadriftCanvas";
import { ThreadriftNavigation } from "./ThreadriftNavigation";
import { EditorPanel } from "./editor/EditorPanel";
import { EditorToggle } from "./editor/EditorToggle";
import type { GraphJSON } from "../types/graph";

export function Threadrift() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadGraph = useThreadriftStore((s) => s.loadGraph);
  const scrollCurrent = useThreadriftStore((s) => s.scrollCurrent);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch("/data/graph.json");
        if (!res.ok) throw new Error("Failed to load Threadrift graph data");
        const data: GraphJSON = await res.json();
        
        loadGraph(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading Threadrift graph:", err);
        setError("Could not load Threadrift graph data.");
        setLoading(false);
      }
    }

    fetchGraph();
  }, [loadGraph]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950 text-red-500 font-mono text-sm">
        {error}
      </div>
    );
  }

  // Parallax Math
  // scrollCurrent goes from -1 (Hero fully visible) to 0 (Threadrift fully visible)
  const heroProgress = Math.max(0, Math.min(1, scrollCurrent + 1)); 
  
  // Parallax translate for the Threadrift Canvas (starts slightly below, moves up to 0)
  const canvasTranslateY = (1 - heroProgress) * 100; // starts at 100vh, ends at 0vh
  const canvasOpacity = Math.min(1, heroProgress * 1.5); // Fades in smoothly

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      
      {/* Dynamic Gradient Background for Threadrift */}
      <div 
        className="absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none mix-blend-screen"
        style={{
          opacity: heroProgress,
          background: "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 60%)"
        }}
      />

      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none will-change-transform"
        style={{
          transform: `translateY(${canvasTranslateY}vh)`,
          opacity: canvasOpacity,
        }}
      >
        {/* Canvas container with pointer-events-auto for node interaction */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          {!loading && (
            <>
              <ThreadriftNavigation />
              <ThreadriftCanvas />
            </>
          )}
        </div>
        
        {/* Loading State Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="text-zinc-500 text-xs animate-pulse tracking-widest uppercase font-mono">
              Initializing Threadrift Engine...
            </div>
          </div>
        )}
      </div>

      {/* Threadrift Studio UI — Fixed, outside parallax */}
      {!loading && (
        <div className="pointer-events-auto">
          <EditorPanel />
          <EditorToggle />
        </div>
      )}
    </div>
  );
}

export const NodeGraph = Threadrift;
