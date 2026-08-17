"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useThreadriftStore } from "../store/threadrift-store";
import { 
  SCROLL_SENSITIVITY, 
  SCROLL_IDLE_TIMEOUT 
} from "../engine/constants";
import { 
  detectBranchIntent, 
  applyMagneticSnap 
} from "../engine/physics";

export function ThreadriftNavigation() {
  const lenisRef = useRef<Lenis | null>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zustand bindings
  const graph = useThreadriftStore((s) => s.graph);
  const activePath = useThreadriftStore((s) => s.activePath);
  const branchChoices = useThreadriftStore((s) => s.branchChoices);
  
  const scrollTarget = useThreadriftStore((s) => s.scrollTarget);
  const setScrollTarget = useThreadriftStore((s) => s.setScrollTarget);
  const setScrollCurrent = useThreadriftStore((s) => s.setScrollCurrent);
  const setIsScrolling = useThreadriftStore((s) => s.setIsScrolling);
  const setBranchChoice = useThreadriftStore((s) => s.setBranchChoice);

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expoOut
      orientation: "vertical",
      gestureOrientation: "both", // allow x and y
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    // Use requestAnimationFrame for Lenis loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Handle Wheel Events (Custom Physics)
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!graph.nodes || activePath.length === 0) return;

      // Disable default scrolling behavior when navigating the graph
      e.preventDefault();

      setIsScrolling(true);
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);

      const dx = e.deltaX;
      const dy = e.deltaY;

      // 1. Determine base movement
      const currentIdx = Math.max(0, Math.min(Math.round(scrollTarget), activePath.length - 1));
      const currentNode = activePath[currentIdx];

      let movement = 0;
      if (currentNode) {
        // If they scroll vertically (mouse wheel), treat as forward/backward.
        // If they scroll horizontally (trackpad), project onto the path's x-direction.
        const vx = currentNode.vx || 0;
        
        if (Math.abs(dy) >= Math.abs(dx)) {
          movement = dy * SCROLL_SENSITIVITY;
        } else {
          // Trackpad swiping left/right
          const signX = vx >= 0 ? 1 : -1;
          movement = dx * signX * SCROLL_SENSITIVITY;
        }
      } else {
        movement = dy * SCROLL_SENSITIVITY;
      }

      // 2. Branch Detection
      // STRICT LOCK: Only allow branch changes if we are EXTREMELY close to the node center.
      // Once scrollTarget moves > 0.05 away from the node, they are locked into the path.
      const isStrictlyAtNode = Math.abs(scrollTarget - Math.round(scrollTarget)) < 0.05;

      if (currentNode && isStrictlyAtNode) {
        const { edgeId, type } = detectBranchIntent(
          dx,
          dy,
          currentNode,
          graph,
          branchChoices[currentNode.id]
        );

        if (type === "branch" && edgeId) {
          setBranchChoice(currentNode.id, edgeId);
        } else if (type === "main") {
          setBranchChoice(currentNode.id, null);
        }
      }

      // 3. Update scroll target
      const maxScroll = activePath.length - 1;
      let newTarget = scrollTarget + movement;
      newTarget = Math.max(-1, Math.min(newTarget, maxScroll));
      
      setScrollTarget(newTarget);

      // 4. Setup magnetic snap timeout
      snapTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, SCROLL_IDLE_TIMEOUT);
    }

    // Attach passive: false so we can preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollTarget, activePath, graph, branchChoices, setIsScrolling, setBranchChoice, setScrollTarget]);

  // Handle Animation Loop (Snapping and Current Interpolation)
  useEffect(() => {
    let rafId: number;

    function loop() {
      // Magnetic snapping
      const isScrolling = useThreadriftStore.getState().isScrolling;
      if (!isScrolling) {
        const snappedTarget = applyMagneticSnap(useThreadriftStore.getState().scrollTarget);
        if (Math.abs(useThreadriftStore.getState().scrollTarget - snappedTarget) > 0.001) {
          setScrollTarget(snappedTarget);
        }
      }

      // Smooth interpolation from current to target
      const target = useThreadriftStore.getState().scrollTarget;
      let current = useThreadriftStore.getState().scrollCurrent;
      
      current += (target - current) * 0.1; // Smooth lerp
      setScrollCurrent(current);

      rafId = requestAnimationFrame(loop);
    }
    
    loop();
    
    return () => cancelAnimationFrame(rafId);
  }, [setScrollCurrent, setScrollTarget]);

  return null; // This is a logic-only component
}

export const NodeNavigation = ThreadriftNavigation;
