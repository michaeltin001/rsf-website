'use client';

import { useEffect, useRef, useState } from 'react';

export default function CircuitBoard() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // For the CSS Mask effect
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const hoverCanvas = hoverCanvasRef.current;
    if (!bgCanvas || !hoverCanvas) return;
    
    const bgCtx = bgCanvas.getContext('2d');
    const hoverCtx = hoverCanvas.getContext('2d');
    if (!bgCtx || !hoverCtx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;

    type Point = { x: number; y: number };
    type Trace = {
      path: Point[];
      path2D: Path2D;
      activePulse: number; 
      speed: number;
      pulseSize: number;
      segmentLens: number[];
      totalLen: number;
    };

    let traces: Trace[] = [];
    const gridScale = 30; // Grid snapping size for PCB feel

    let primaryColor = '#3b82f6';
    let accentColor = '#10b981';

    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      primaryColor = style.getPropertyValue('--primary').trim() || '#3b82f6';
      accentColor = style.getPropertyValue('--accent').trim() || '#10b981';
    };

    // Pre-calculate paths and lengths ONCE for massive performance boost
    const initTraces = () => {
      traces = [];
      const numTraces = Math.floor((width * height) / 15000);
      const snap = (v: number) => Math.round(v / gridScale) * gridScale;

      for (let i = 0; i < numTraces; i++) {
        const startX = snap(Math.random() * width);
        const startY = snap(Math.random() * height);
        
        let endX = startX + snap((Math.random() - 0.5) * 600);
        let endY = startY + snap((Math.random() - 0.5) * 600);

        endX = Math.max(0, Math.min(width, endX));
        endY = Math.max(0, Math.min(height, endY));

        const dx = endX - startX;
        const dy = endY - startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        const path: Point[] = [{ x: startX, y: startY }];
        
        if (absDx > absDy) {
          const signX = Math.sign(dx);
          const signY = Math.sign(dy);
          const diagLength = absDy;
          if (diagLength > 0) {
              path.push({ x: startX + diagLength * signX, y: startY + diagLength * signY });
          }
          if (endX !== startX + diagLength * signX || endY !== startY + diagLength * signY) {
             path.push({ x: endX, y: endY });
          }
        } else {
          const signX = Math.sign(dx);
          const signY = Math.sign(dy);
          const diagLength = absDx;
          if (diagLength > 0) {
              path.push({ x: startX + diagLength * signX, y: startY + diagLength * signY });
          }
          if (endX !== startX + diagLength * signX || endY !== startY + diagLength * signY) {
              path.push({ x: endX, y: endY });
          }
        }

        // Cache Path2D and lengths to eliminate frame-by-frame math
        const path2D = new Path2D();
        path2D.moveTo(path[0].x, path[0].y);
        
        let totalLen = 0;
        const segmentLens: number[] = [];
        for (let j = 1; j < path.length; j++) {
            path2D.lineTo(path[j].x, path[j].y);
            const l = Math.hypot(path[j].x - path[j-1].x, path[j].y - path[j-1].y);
            totalLen += l;
            segmentLens.push(l);
        }

        traces.push({
          path,
          path2D,
          activePulse: Math.random(),
          speed: Math.random() * 0.003 + 0.001,
          pulseSize: Math.random() * 1.5 + 1,
          segmentLens,
          totalLen
        });
      }
    };

    // Pre-render the STATIC traces to separate off-screen canvases so we only composite them 
    const staticBgCanvas = document.createElement('canvas');
    const staticHoverCanvas = document.createElement('canvas');
    
    const redrawStaticLayers = () => {
        staticBgCanvas.width = width;
        staticBgCanvas.height = height;
        staticHoverCanvas.width = width;
        staticHoverCanvas.height = height;
        
        const sBgCtx = staticBgCanvas.getContext('2d');
        const sHoverCtx = staticHoverCanvas.getContext('2d');
        if(!sBgCtx || !sHoverCtx) return;

        sBgCtx.strokeStyle = primaryColor;
        sBgCtx.fillStyle = primaryColor;
        sBgCtx.globalAlpha = 0.15;
        sBgCtx.lineWidth = 1;

        sHoverCtx.strokeStyle = accentColor;
        sHoverCtx.fillStyle = accentColor;
        sHoverCtx.globalAlpha = 0.6;
        sHoverCtx.lineWidth = 2;

        traces.forEach(trace => {
            // Draw Default Blue Background Trace
            sBgCtx.stroke(trace.path2D);
            sBgCtx.beginPath(); sBgCtx.arc(trace.path[0].x, trace.path[0].y, 3, 0, Math.PI*2); sBgCtx.fill();
            sBgCtx.beginPath(); sBgCtx.arc(trace.path[trace.path.length-1].x, trace.path[trace.path.length-1].y, 4, 0, Math.PI*2); sBgCtx.fill();

            // Draw Hover Green Trace
            sHoverCtx.stroke(trace.path2D);
            sHoverCtx.globalAlpha = 0.8;
            sHoverCtx.beginPath(); sHoverCtx.arc(trace.path[0].x, trace.path[0].y, 3, 0, Math.PI*2); sHoverCtx.fill();
            sHoverCtx.beginPath(); sHoverCtx.arc(trace.path[trace.path.length-1].x, trace.path[trace.path.length-1].y, 4, 0, Math.PI*2); sHoverCtx.fill();
            sHoverCtx.globalAlpha = 0.6; // reset for next trace
        });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width;
      bgCanvas.height = height;
      hoverCanvas.width = width;
      hoverCanvas.height = height;
      
      updateColors();
      initTraces();
      redrawStaticLayers();
    };

    window.addEventListener('resize', resize);
    
    let rafMouseActive = false;
    function handleMouseMove(e: MouseEvent) {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsHovering(true);
      rafMouseActive = true;
    }
    function handleMouseLeave() {
      // Intentionally don't update mouse pos so the mask fades out smoothly exactly where it left
      setIsHovering(false);
      rafMouseActive = false;
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const observer = new MutationObserver(() => {
      updateColors();
      redrawStaticLayers();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Initialize
    resize();

    // The render loop is now INSANELY fast: O(N) instead of O(N*M)
    const render = () => {
      bgCtx.clearRect(0, 0, width, height);
      hoverCtx.clearRect(0, 0, width, height);
      
      // 1. Draw pre-rendered static textures (GPU accelerated, basically free)
      bgCtx.drawImage(staticBgCanvas, 0, 0);
      
      if (rafMouseActive) {
          hoverCtx.drawImage(staticHoverCanvas, 0, 0);
      }

      // 2. Draw only the moving pulses
      bgCtx.fillStyle = primaryColor;
      bgCtx.globalAlpha = 0.5;

      hoverCtx.fillStyle = accentColor;
      hoverCtx.shadowBlur = 12;
      hoverCtx.shadowColor = accentColor;

      traces.forEach(trace => {
        if (trace.totalLen === 0) return;

        trace.activePulse += trace.speed;
        if (trace.activePulse > 1) trace.activePulse = 0;

        const targetDist = trace.activePulse * trace.totalLen;
        let currentDist = 0;
        let pulsePoint = { x: trace.path[0].x, y: trace.path[0].y };

        for (let j = 0; j < trace.segmentLens.length; j++) {
            if (currentDist + trace.segmentLens[j] >= targetDist) {
                const t = (targetDist - currentDist) / trace.segmentLens[j];
                pulsePoint.x = trace.path[j].x + (trace.path[j+1].x - trace.path[j].x) * t;
                pulsePoint.y = trace.path[j].y + (trace.path[j+1].y - trace.path[j].y) * t;
                break;
            }
            currentDist += trace.segmentLens[j];
        }

        // Draw pulse to bg layer
        bgCtx.beginPath();
        bgCtx.arc(pulsePoint.x, pulsePoint.y, trace.pulseSize, 0, Math.PI * 2);
        bgCtx.fill();

        // Draw pulse to hover layer
        if (rafMouseActive) {
            hoverCtx.beginPath();
            hoverCtx.arc(pulsePoint.x, pulsePoint.y, trace.pulseSize * 1.5, 0, Math.PI * 2);
            hoverCtx.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-neutral-100 dark:bg-neutral-950 overflow-hidden pointer-events-none text-neutral-900 dark:text-neutral-100">
        <div 
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
            style={{
                backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
            }}
        />
        
        {/* Base Layer: Blue layout with constant pulses */}
        <canvas ref={bgCanvasRef} className="absolute inset-0 block" />
        
        {/* Hover Layer: Green layout masked entirely by the browser's CSS Compositor (0 JS overhead) */}
        <div 
            className="absolute inset-0 block"
            style={{
                WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.4) 50%, transparent 100%)`,
                maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.4) 50%, transparent 100%)`,
                opacity: isHovering ? 1 : 0,
                transition: 'opacity 0.4s ease-out'
            }}
        >
            <canvas ref={hoverCanvasRef} className="absolute inset-0 block" />
        </div>
    </div>
  );
}
