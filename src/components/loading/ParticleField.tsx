'use client';

import { useRef, useEffect, useCallback } from 'react';
import { LOADING } from '@/lib/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  decay: number; // opacity reduction per frame
}

interface ParticleFieldProps {
  active: boolean;
  onComplete: () => void;
}

export function ParticleField({ active, onComplete }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const hasCompletedRef = useRef(false);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const count = LOADING?.PARTICLE_COUNT || 300;
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      // Calculate angle from center for outward movement
      const cx = width / 2;
      const cy = height / 2;
      const angle = Math.atan2(y - cy, x - cx) + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 1.5, // slight upward bias
        size: 1 + Math.random() * 3,
        opacity: 0.8 + Math.random() * 0.2,
        decay: 0.005 + Math.random() * 0.01,
      });
    }
    
    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas instead of painting a background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      
      if (p.opacity <= 0) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= p.decay;
      
      // Slight randomness in movement for organic feel and additional upward drift
      p.vx += (Math.random() - 0.5) * 0.2;
      p.vy += (Math.random() - 0.5) * 0.2 - 0.05; 

      if (p.opacity > 0) {
        activeParticles++;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.fill();
      }
    }

    if (activeParticles > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (active && !rafRef.current && !hasCompletedRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        initParticles(canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [active, initParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ background: 'transparent' }}
    />
  );
}
