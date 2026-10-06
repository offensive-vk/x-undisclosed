import React, { useEffect, useRef } from 'react';

export default function MatrixRain({ color = '#0F0', transparent = false }: { color?: string; transparent?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let drops: number[] = [];
    const fontSize = 14;
    
    const initCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || canvas.offsetWidth;
      canvas.height = canvas.parentElement?.offsetHeight || canvas.offsetHeight;
      const columns = canvas.width / fontSize;
      drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100; // stagger initial start
      }
    };

    initCanvas();

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}|:"<>?';

    let lastDrawTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);
      
      const deltaTime = currentTime - lastDrawTime;
      if (deltaTime > interval) {
        lastDrawTime = currentTime - (deltaTime % interval);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          if (drops[i] < 0) {
            drops[i]++;
            continue;
          }
          
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    window.addEventListener('resize', initCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initCanvas);
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      className={transparent 
        ? "w-full h-full block" 
        : "w-full h-full block rounded-xl overflow-hidden border border-[#ffffff10]"
      }
      style={{ background: transparent ? 'transparent' : '#050505' }}
    />
  );
}
