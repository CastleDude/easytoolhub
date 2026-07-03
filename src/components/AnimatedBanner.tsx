"use client";

import { useEffect, useRef } from "react";

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const COLS = 8;
const ROWS = 5;

export default function AnimatedBanner({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let w = 0, h = 0;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      alpha: number; alphaDir: number;
    }

    const particles: Particle[] = [];

    function initParticles() {
      particles.length = 0;
      const cols = COLS;
      const rows = ROWS;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          particles.push({
            x: cellW * col + rnd(cellW * 0.2, cellW * 0.8),
            y: cellH * row + rnd(cellH * 0.2, cellH * 0.8),
            vx: rnd(-0.15, 0.15),
            vy: rnd(-0.15, 0.15),
            r: rnd(1.5, 4),
            alpha: rnd(0.15, 0.5),
            alphaDir: rnd(0.001, 0.004),
          });
        }
      }
    }

    function resize() {
      const parent = canvas!.parentElement!;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = w;
      canvas!.height = h;
      initParticles();
    }

    resize();
    window.addEventListener("resize", resize);

    function animate() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Pulse alpha gently
        p.alpha += p.alphaDir;
        if (p.alpha > 0.55 || p.alpha < 0.12) p.alphaDir *= -1;

        // Free slow drift with gentle random perturbation
        p.vx += rnd(-0.003, 0.003);
        p.vy += rnd(-0.003, 0.003);
        // Soft speed clamp
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.3) {
          p.vx = (p.vx / speed) * 0.3;
          p.vy = (p.vy / speed) * 0.3;
        }
        if (speed < 0.05) {
          p.vx += rnd(-0.02, 0.02);
          p.vy += rnd(-0.02, 0.02);
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Outer glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99,102,241,${p.alpha * 0.1})`;
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx!.fill();
      }

      // Connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(148,163,184,${0.06 * (1 - dist / 100)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden banner-gradient">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="banner-orb banner-orb-1" />
      <div className="banner-orb banner-orb-2" />
      <div className="banner-orb banner-orb-3" />
      <div className="banner-orb banner-orb-4" />
      <div className="banner-orb banner-orb-5" />
      <div className="banner-shimmer" />
      <div className="container-main text-center relative z-10">
        {children}
      </div>
    </section>
  );
}
