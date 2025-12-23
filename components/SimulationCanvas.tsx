import React, { useRef, useEffect } from 'react';
import { SimulationObjectState } from '../types';
import { PHYSICS, COLORS, CHARACTERS } from '../constants';

interface SimulationCanvasProps {
  objects: SimulationObjectState[];
  maxDistance: number;
  globalFriction: number;
  globalDrag: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
  objects, 
  maxDistance, 
  globalFriction,
  globalDrag 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  
  // Use refs for the animation loop to access latest state without re-triggering effects
  const objectsRef = useRef(objects);
  const maxDistanceRef = useRef(maxDistance);
  const globalFrictionRef = useRef(globalFriction);
  const globalDragRef = useRef(globalDrag);

  // Sync state refs on every render
  useEffect(() => {
    objectsRef.current = objects;
    maxDistanceRef.current = maxDistance;
    globalFrictionRef.current = globalFriction;
    globalDragRef.current = globalDrag;
  }, [objects, maxDistance, globalFriction, globalDrag]);

  // Pre-load images once on mount
  useEffect(() => {
    CHARACTERS.forEach(char => {
      const img = new Image();
      img.src = char.image;
      img.onload = () => {
        imagesRef.current[char.id] = img;
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      // Ensure canvas matches container size
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

      // Background clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentMaxDist = maxDistanceRef.current;
      const currentObjects = objectsRef.current;
      const currentFriction = globalFrictionRef.current;
      const currentDrag = globalDragRef.current;

      // Dynamic track margin for mobile landscape
      const trackMargin = canvas.height < 450 ? 30 : 80;
      const trackHeight = (canvas.height - trackMargin * 2) / 3;
      const trackWidth = canvas.width - trackMargin * 2;
      const pixelsPerMeter = trackWidth / currentMaxDist;

      // Draw tracks
      for (let i = 0; i < 3; i++) {
        const yBase = trackMargin + i * trackHeight;
        const gradient = ctx.createLinearGradient(trackMargin, 0, trackMargin + trackWidth, 0);
        const intensity = (currentFriction + currentDrag) * 0.5;
        gradient.addColorStop(0, '#131c2e');
        gradient.addColorStop(1, `rgba(${30 + intensity * 120}, 25, 35, 0.4)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(trackMargin, yBase, trackWidth, trackHeight);

        ctx.strokeStyle = COLORS.TRACK_ACCENT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trackMargin, yBase + trackHeight);
        ctx.lineTo(trackMargin + trackWidth, yBase + trackHeight);
        ctx.stroke();

        // Finish line
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([8, 4]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trackMargin + trackWidth, yBase);
        ctx.lineTo(trackMargin + trackWidth, yBase + trackHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Metric markers
      ctx.fillStyle = '#94a3b8';
      ctx.font = canvas.height < 450 ? 'bold 10px "Inter", sans-serif' : 'bold 12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      for (let m = 0; m <= currentMaxDist; m += currentMaxDist / 5) {
        const xPos = trackMargin + m * pixelsPerMeter;
        ctx.fillText(`${Math.round(m)}m`, xPos, trackMargin - (canvas.height < 450 ? 10 : 20));
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.moveTo(xPos, trackMargin - (canvas.height < 450 ? 8 : 15));
        ctx.lineTo(xPos, canvas.height - trackMargin + 10);
        ctx.stroke();
      }

      // Draw objects
      currentObjects.forEach((obj, idx) => {
        const yBase = trackMargin + idx * trackHeight;
        const yCenter = yBase + trackHeight / 2;
        const xPos = trackMargin + obj.position * pixelsPerMeter;
        
        // Slightly smaller radius in landscape if height is restricted
        const radius = canvas.height < 450 ? 20 : 30;

        // Render Motion Trails
        if (obj.trail.length > 1) {
          ctx.lineCap = 'round';
          for (let pIdx = 0; pIdx < obj.trail.length - 1; pIdx++) {
            const p1 = obj.trail[pIdx];
            const p2 = obj.trail[pIdx + 1];
            const px1 = trackMargin + p1.x * pixelsPerMeter;
            const px2 = trackMargin + p2.x * pixelsPerMeter;
            ctx.strokeStyle = `${obj.color}${Math.floor(p1.opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = (canvas.height < 450 ? 10 : 15) * p1.opacity;
            ctx.beginPath();
            ctx.moveTo(px1, yCenter);
            ctx.lineTo(px2, yCenter);
            ctx.stroke();
          }
        }

        // Data Overlay Box (Only if height allows, or more compact in landscape)
        if (canvas.height >= 400) {
          const boxWidth = 100;
          const boxHeight = 52;
          const boxX = xPos - boxWidth / 2;
          const boxY = yCenter - radius - boxHeight - 12;

          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
          else ctx.rect(boxX, boxY, boxWidth, boxHeight);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`v: ${obj.velocity.toFixed(1)} m/s`, boxX + 10, boxY + 18);
          ctx.fillText(`m: ${obj.variables.mass} kg`, boxX + 10, boxY + 31);
          ctx.fillText(`μ: ${obj.variables.friction.toFixed(2)}`, boxX + 10, boxY + 44);
        }

        // Character Aura
        const glow = ctx.createRadialGradient(xPos, yCenter, radius * 0.7, xPos, yCenter, radius * 1.6);
        glow.addColorStop(0, `${obj.color}55`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(xPos, yCenter, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Character Circle
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(xPos, yCenter, radius, 0, Math.PI * 2);
        ctx.fill();

        // Character Image Clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(xPos, yCenter, radius - 4, 0, Math.PI * 2);
        ctx.clip();
        
        const characterImg = imagesRef.current[obj.id];
        if (characterImg && characterImg.complete && characterImg.naturalWidth !== 0) {
          ctx.drawImage(characterImg, xPos - radius + 4, yCenter - radius + 4, (radius - 4) * 2, (radius - 4) * 2);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.font = `bold ${canvas.height < 450 ? '16px' : '24px'} sans-serif`;
          ctx.fillText(obj.name.charAt(0), xPos, yCenter + (canvas.height < 450 ? 6 : 9));
        }
        ctx.restore();

        // Circle Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 w-full bg-slate-900 overflow-hidden relative border-4 landscape:max-lg:border-2 border-slate-950 rounded-xl shadow-2xl">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Dynamic positioning for Legend in mobile landscape */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-none text-right scale-90 sm:scale-100 transform origin-top-right">
        <div className="bg-slate-950/90 p-2 sm:p-3 rounded-xl border border-slate-700 backdrop-blur-md shadow-lg">
          <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 sm:mb-2">Vector Legend</p>
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-[9px] sm:text-xs">
              <span className="text-pink-400 font-bold">Thrust</span>
              <i className="fas fa-arrow-right text-pink-500"></i>
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-[9px] sm:text-xs">
              <i className="fas fa-arrow-left text-orange-500"></i>
              <span className="text-orange-400 font-bold">Friction</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-[9px] sm:text-xs">
              <i className="fas fa-arrow-left text-sky-500"></i>
              <span className="text-sky-400 font-bold">Drag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;