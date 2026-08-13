'use client';

import { useRef, useEffect, useCallback } from 'react';
import { LOADING } from '@/lib/constants';

// ----- Types -----

interface ShatterBlock {
  srcX: number;
  srcY: number;
  bw: number;
  bh: number;
  dirX: number;
  dirY: number;
  force: number;
  noiseX: number;
  noiseY: number;
}

interface ShatterFieldProps {
  active: boolean;
  onComplete: () => void;
}

// ----- Constants -----

const BLOCK_SIZE = 4;
const TRAVEL_BASE = 200;
const TRAVEL_MULT = 1000;
const SHATTER_DURATION_MS = LOADING.SHATTER_DURATION;

// Deterministic hash — mirrors the C++ reference
function hashXY(x: number, y: number): number {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

// ----- Component -----

export function ShatterField({ active, onComplete }: ShatterFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<ShatterBlock[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const hasCompletedRef = useRef(false);

  // Build the block grid once when activated
  const initBlocks = useCallback((W: number, H: number) => {
    const blocks: ShatterBlock[] = [];
    const cx = W / 2;
    const cy = H / 2;

    for (let srcY = 0; srcY < H; srcY += BLOCK_SIZE) {
      for (let srcX = 0; srcX < W; srcX += BLOCK_SIZE) {
        const bw = Math.min(BLOCK_SIZE, W - srcX);
        const bh = Math.min(BLOCK_SIZE, H - srcY);

        const hash = hashXY(srcX, srcY);

        const force = ((hash >>> 8) % 100) / 100;
        const noiseX = ((hash % 2000) / 1000) - 1;
        const noiseY = (((hash >>> 4) % 2000) / 1000) - 1;

        // Direction: center of block → outward from screen center
        let dirX = srcX + bw / 2 - cx;
        let dirY = srcY + bh / 2 - cy;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);

        if (dist > 0.1) {
          dirX /= dist;
          dirY /= dist;
        }

        blocks.push({ srcX, srcY, bw, bh, dirX, dirY, force, noiseX, noiseY });
      }
    }

    blocksRef.current = blocks;
  }, []);

  // Animation loop
  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / SHATTER_DURATION_MS, 1);

    // Fade out only in the last 20% of the animation (when almost reaches finish)
    const fade = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;

    // Linear movement (no change in speed throughout)
    const travelProgress = progress;

    // Clear to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply global opacity
    ctx.globalAlpha = fade;

    const blocks = blocksRef.current;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      const travel = travelProgress * (TRAVEL_BASE + b.force * TRAVEL_MULT);
      const dX = b.dirX * travel + b.noiseX * travel * 0.4;
      const dY = b.dirY * travel + b.noiseY * travel * 0.4;

      const dstX = b.srcX + dX;
      const dstY = b.srcY + dY;

      // Each block is a solid black square (the loading screen surface)
      ctx.fillStyle = '#000';
      ctx.fillRect(dstX, dstY, b.bw, b.bh);
    }

    ctx.globalAlpha = 1;

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, []);

  // Activation
  useEffect(() => {
    if (!active || hasCompletedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    initBlocks(canvas.width, canvas.height);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [active, initBlocks, tick]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ background: 'transparent' }}
    />
  );
}
