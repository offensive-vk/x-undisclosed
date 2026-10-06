import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  transparent?: boolean;
}

export default function MatrixRain({
  color = '#a476ff',
  transparent = true,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const fontSize = 14;
    const characters =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    interface Column {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
    }

    let columns: Column[] = [];
    let canvasW = 0;
    let canvasH = 0;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.clientWidth || (canvas.parentElement?.clientWidth ?? window.innerWidth);
      const height = rect.height || canvas.clientHeight || (canvas.parentElement?.clientHeight ?? window.innerHeight);

      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvasW = width;
      canvasH = height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const colCount = Math.floor(width / fontSize);
      columns = [];

      for (let i = 0; i < colCount; i++) {
        const length = Math.floor(Math.random() * 18) + 12;
        const colChars: string[] = [];
        for (let j = 0; j < length; j++) {
          colChars.push(characters.charAt(Math.floor(Math.random() * characters.length)));
        }

        columns.push({
          x: i * fontSize,
          // Distribute initially across screen height so it is immediately visible
          y: Math.random() * height,
          speed: Math.random() * 1.8 + 1.2,
          length,
          chars: colChars,
        });
      }
    };

    setupCanvas();

    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = time - lastTime;
      if (delta < interval) return;
      lastTime = time - (delta % interval);

      if (canvasW === 0 || canvasH === 0) {
        setupCanvas();
        return;
      }

      // Clear the canvas cleanly
      if (transparent) {
        ctx.clearRect(0, 0, canvasW, canvasH);
      } else {
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        // Randomly mutate characters in the stream
        if (Math.random() > 0.85) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] = characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }

        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * fontSize;

          if (charY < -fontSize || charY > canvasH) continue;

          // Head of the drop is bright white with glow
          if (j === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
          } else if (j < 3) {
            ctx.fillStyle = '#dfc9ff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
          } else {
            // Tail characters fade with smooth alpha
            const alpha = Math.max(0.08, 1 - j / col.length);
            ctx.fillStyle = `rgba(164, 118, 255, ${alpha.toFixed(2)})`;
            ctx.shadowBlur = 0;
          }

          const char = col.chars[j] || characters.charAt(0);
          ctx.fillText(char, col.x, charY);
        }

        // Advance column
        col.y += col.speed * fontSize * 0.6;

        // Reset column if it went completely off screen
        if (col.y - col.length * fontSize > canvasH) {
          col.y = -20;
          col.speed = Math.random() * 1.8 + 1.2;
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [color, transparent]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none"
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
