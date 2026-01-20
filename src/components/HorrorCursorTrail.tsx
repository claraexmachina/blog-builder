'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

// Horror-themed colors (blood red, dark purple, etc.)
const HORROR_COLORS = [
  '#8b0000', // dark red
  '#b30000', // blood red
  '#660000', // darker red
  '#4a0000', // very dark red
  '#330000', // almost black red
  '#800020', // burgundy
  '#722f37', // wine
];

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const HorrorCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const { isHorrorMode } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(!e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isMobile || !isHorrorMode) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotion.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';

    const createStar = (x: number, y: number): Star => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed * 0.3,
        vy: Math.sin(angle) * speed * 0.3 + 0.8, // Gentle falling
        life: 1,
        maxLife: Math.random() * 50 + 40, // Longer life for smoother trail
        size: Math.random() * 3 + 2,
        color: HORROR_COLORS[Math.floor(Math.random() * HORROR_COLORS.length)],
      };
    };

    const drawStar = (ctx: CanvasRenderingContext2D, star: Star) => {
      const opacity = star.life;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = star.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = star.color;

      // Draw a cross/star shape
      const size = star.size * opacity;
      ctx.beginPath();
      // Vertical line
      ctx.moveTo(star.x, star.y - size);
      ctx.lineTo(star.x, star.y + size);
      // Horizontal line
      ctx.moveTo(star.x - size, star.y);
      ctx.lineTo(star.x + size, star.y);
      ctx.lineWidth = size * 0.5;
      ctx.strokeStyle = star.color;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(star.x, star.y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const update = () => {
      if (!canvas || !context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Add new stars along the path from previous to current mouse position
      const dx = mouseRef.current.x - mouseRef.current.prevX;
      const dy = mouseRef.current.y - mouseRef.current.prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        // Interpolate along the path to create smooth trail
        const steps = Math.max(1, Math.floor(distance / 8));
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const interpX = mouseRef.current.prevX + dx * t;
          const interpY = mouseRef.current.prevY + dy * t;
          starsRef.current.push(
            createStar(
              interpX + (Math.random() - 0.5) * 6,
              interpY + (Math.random() - 0.5) * 6
            )
          );
        }
        mouseRef.current.prevX = mouseRef.current.x;
        mouseRef.current.prevY = mouseRef.current.y;
      }

      // Limit total stars
      if (starsRef.current.length > 150) {
        starsRef.current = starsRef.current.slice(-150);
      }

      // Update and draw stars
      for (let i = starsRef.current.length - 1; i >= 0; i--) {
        const star = starsRef.current[i];

        // Update position
        star.x += star.vx;
        star.y += star.vy;
        star.vy += 0.05; // Gravity

        // Decrease life
        star.life -= 1 / star.maxLife;

        // Remove dead stars
        if (star.life <= 0 || star.y > canvas.height) {
          starsRef.current.splice(i, 1);
          continue;
        }

        drawStar(context, star);
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resize);
    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      starsRef.current = [];
    };
  }, [isMobile, isHorrorMode]);

  if (isMobile || !isHorrorMode) return null;

  return <canvas ref={canvasRef} />;
};

export default HorrorCursorTrail;
