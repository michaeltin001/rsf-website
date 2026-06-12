'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Helper to determine if dark mode is active
    const isDarkMode = () => document.documentElement.classList.contains('dark');
    
    // Dynamic colors based on theme
    let particleColor = isDarkMode() ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)';
    let lineColorBase = isDarkMode() ? '255, 255, 255' : '0, 0, 0';

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      particleColor = isDarkMode() ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      lineColorBase = isDarkMode() ? '255, 255, 255' : '0, 0, 0';
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Adjust density here (higher divisor = fewer particles)
      const numParticles = Math.floor((width * height) / 18000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15, // Slowed down from 0.5 to 0.15
          vy: (Math.random() - 0.5) * 0.15, // Slowed down from 0.5 to 0.15
          radius: Math.random() * 1.5 + 1,
        });
      }
    };

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Opacity fades out based on distance
            const opacity = 0.15 - (dist / 800);
            ctx.strokeStyle = `rgba(${lineColorBase}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect to mouse (disabled on mobile)
        if (!isTouchDevice) {
          const dxMouse = p.x - mouse.x;
          const dyMouse = p.y - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 180) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const opacity = 0.2 - (distMouse / 900);
            ctx.strokeStyle = `rgba(${lineColorBase}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Subtle repel effect when mouse is very close
            if (distMouse < 80) {
                p.x += dxMouse * 0.02;
                p.y += dyMouse * 0.02;
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ background: 'transparent' }}
    />
  );
}
