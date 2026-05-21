"use client";

import { useEffect, useRef } from "react";

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const PARTICLE_COUNT = 35;
const GATHER_SPEED = 0.035;
const RETURN_SPEED = 0.018;

export default function AnimatedBanner({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let w = 0, h = 0;
    const mouse = { x: -9999, y: -9999 };
    const rawMouse = { x: -9999, y: -9999 };
    let mouseOnBanner = false;

    interface Particle {
      x: number; y: number;
      homeX: number; homeY: number;
      vx: number; vy: number;
      r: number;
      alpha: number; alphaDir: number;
      gatherAngle: number;
      gatherRadius: number;
    }

    const particles: Particle[] = [];

    function resize() {
      const parent = canvas!.parentElement!;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = w;
      canvas!.height = h;
      initParticles();
    }

    function initParticles() {
      const oldHomes = particles.map((p) => ({ x: p.homeX, y: p.homeY, angle: p.gatherAngle, radius: p.gatherRadius }));
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const old = oldHomes[i];
        const x = old && old.x > 0 && old.x < w ? old.x : rnd(0, w);
        const y = old && old.y > 0 && old.y < h ? old.y : rnd(0, h);
        // Non-overlapping ring-based arrangement around mouse
        const ring = Math.floor(i / 8); // 0,1,2,3 — each ring ~8 particles
        const idxInRing = i % 8;
        const angleOffset = (ring % 2) * (Math.PI / 8); // stagger alternate rings
        const radius = 20 + ring * 22 + rnd(-4, 4);
        particles.push({
          x, y,
          homeX: x, homeY: y,
          vx: rnd(-0.3, 0.3),
          vy: rnd(-0.3, 0.3),
          r: rnd(1.5, 4.5),
          alpha: rnd(0.2, 0.6),
          alphaDir: rnd(0.003, 0.008),
          gatherAngle: (idxInRing / 8) * Math.PI * 2 + angleOffset,
          gatherRadius: radius,
        });
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const section = canvas.parentElement;
    section?.addEventListener("mousemove", (e: Event) => {
      const me = e as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      rawMouse.x = me.clientX - rect.left;
      rawMouse.y = me.clientY - rect.top;
    });
    section?.addEventListener("mouseenter", () => { mouseOnBanner = true; });
    section?.addEventListener("mouseleave", () => { mouseOnBanner = false; });

    function animate() {
      if (mouseOnBanner) {
        mouse.x += (rawMouse.x - mouse.x) * 0.07;
        mouse.y += (rawMouse.y - mouse.y) * 0.07;
      }

      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Pulse alpha
        p.alpha += p.alphaDir;
        if (p.alpha > 0.7 || p.alpha < 0.15) p.alphaDir *= -1;

        if (mouseOnBanner) {
          // Target position around mouse (non-overlapping ring arrangement)
          const tx = mouse.x + Math.cos(p.gatherAngle) * p.gatherRadius;
          const ty = mouse.y + Math.sin(p.gatherAngle) * p.gatherRadius;
          // Smoothly move toward gather target
          p.x += (tx - p.x) * GATHER_SPEED;
          p.y += (ty - p.y) * GATHER_SPEED;
          // Subtle jitter while gathered
          p.x += rnd(-0.1, 0.1);
          p.y += rnd(-0.1, 0.1);
        } else {
          // Return to home position
          p.x += (p.homeX - p.x) * RETURN_SPEED;
          p.y += (p.homeY - p.y) * RETURN_SPEED;
          // Normal free drift
          p.vx += rnd(-0.015, 0.015);
          p.vy += rnd(-0.015, 0.015);
          p.vx *= 0.995;
          p.vy *= 0.995;
          p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
          p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
          p.x += p.vx;
          p.y += p.vy;
        }

        // Wrap around edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Outer glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99,102,241,${p.alpha * 0.12})`;
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
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(148,163,184,${0.08 * (1 - dist / 120)})`;
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
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
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
