import React, { useEffect, useRef } from 'react';

interface CursorFXProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  trailLength?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface SatelliteTrail {
  x: number;
  y: number;
  alpha: number;
}

export default function CursorFX({
  primaryColor = '#a476ff',
  secondaryColor = '#2a33b1',
  accentColor = '#38bdf8',
  trailLength = 16,
}: CursorFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates & state
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let lastX = -1000;
    let lastY = -1000;
    let isInside = false;
    let presenceAlpha = 0;

    // Movement & stability metrics
    let lastMoveTime = performance.now();
    let stableWeight = 0;
    let movementEnergy = 0;
    let speed = 0;

    // Particles & ripples
    const trailPoints: Array<{ x: number; y: number; time: number; speed: number }> = [];
    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];

    // Satellite trails for stable mode
    const satelliteTrails: [SatelliteTrail[], SatelliteTrail[], SatelliteTrail[]] = [[], [], []];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: PointerEvent) => {
      // Ignore touch moves if needed, or allow all pointer types
      if (e.pointerType === 'touch' && !('ontouchstart' in window && window.innerWidth < 768)) {
        // Allow mobile touch drag if desired, but prioritize precision mouse
      }

      const now = performance.now();
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isInside || currentX < -100) {
        currentX = targetX;
        currentY = targetY;
        lastX = targetX;
        lastY = targetY;
      }

      isInside = true;
      lastMoveTime = now;
      movementEnergy = Math.min(1, movementEnergy + 0.2);
    };

    const onPointerLeave = () => {
      isInside = false;
    };

    const onPointerEnter = (e: PointerEvent) => {
      isInside = true;
      targetX = e.clientX;
      targetY = e.clientY;
      currentX = targetX;
      currentY = targetY;
      lastX = targetX;
      lastY = targetY;
      lastMoveTime = performance.now();
    };

    const onPointerDown = (e: PointerEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Add shockwave
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: 52,
        alpha: 0.85,
        color: accentColor,
      });

      // Add click spark burst
      const sparkCount = 12;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const burstSpeed = Math.random() * 3.5 + 2.0;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * burstSpeed,
          vy: Math.sin(angle) * burstSpeed,
          size: Math.random() * 2.2 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.035 + 0.025,
          color: i % 2 === 0 ? primaryColor : accentColor,
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerenter', onPointerEnter);
    window.addEventListener('pointerdown', onPointerDown);

    let lastFrameTime = performance.now();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Fade presence
      if (isInside) {
        presenceAlpha = Math.min(1, presenceAlpha + dt * 4);
      } else {
        presenceAlpha = Math.max(0, presenceAlpha - dt * 2.5);
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (presenceAlpha <= 0.001 && particles.length === 0 && shockwaves.length === 0) {
        return;
      }

      // Smooth position interpolation
      const lerpFactor = 0.28;
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      const dx = targetX - lastX;
      const dy = targetY - lastY;
      speed = Math.hypot(dx, dy);
      lastX = targetX;
      lastY = targetY;

      // Calculate stable duration
      const timeSinceMove = now - lastMoveTime;
      const isStationary = timeSinceMove > 110 && speed < 1.0;

      if (isStationary) {
        stableWeight = Math.min(1, stableWeight + dt * 3.0);
        movementEnergy = Math.max(0, movementEnergy - dt * 4.0);
      } else {
        stableWeight = Math.max(0, stableWeight - dt * 6.0);
      }

      // 1. UPDATE & DRAW TRAIL RIBBON
      if (currentX > -100 && currentY > -100) {
        trailPoints.unshift({
          x: currentX,
          y: currentY,
          time: now,
          speed: speed,
        });

        if (trailPoints.length > trailLength) {
          trailPoints.pop();
        }
      }

      if (trailPoints.length > 2 && presenceAlpha > 0.01) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < trailPoints.length - 1; i++) {
          const p1 = trailPoints[i];
          const p2 = trailPoints[i + 1];
          const ratio = 1 - i / trailPoints.length;
          const strokeWidth = (ratio * 3.5 + 0.4) * (0.6 + movementEnergy * 0.4);
          const alpha = ratio * 0.5 * presenceAlpha * (0.3 + movementEnergy * 0.7);

          if (alpha <= 0.01) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineWidth = strokeWidth;

          // Gradient color transition along trail
          if (i < 4) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 6;
          } else if (i < 10) {
            ctx.strokeStyle = `rgba(164, 118, 255, ${alpha})`;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 4;
          } else {
            ctx.strokeStyle = `rgba(42, 51, 177, ${alpha * 0.8})`;
            ctx.shadowBlur = 0;
          }

          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. SPAWN PARTICLES WHEN MOVING
      if (speed > 1.8 && isInside && currentX > -100) {
        const count = speed > 15 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.6;
          const sparkSpeed = Math.random() * 2.2 + 0.5;
          const colors = [primaryColor, accentColor, '#c084fc', '#818cf8', '#ffffff'];
          particles.push({
            x: currentX + (Math.random() - 0.5) * 6,
            y: currentY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * sparkSpeed,
            vy: Math.sin(angle) * sparkSpeed,
            size: Math.random() * 1.8 + 0.8,
            alpha: 0.9 * presenceAlpha,
            decay: Math.random() * 0.035 + 0.02,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }

      // 3. UPDATE & DRAW PARTICLES + CONSTELLATION MESH
      if (particles.length > 0) {
        ctx.save();

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.alpha -= p.decay;

          if (p.alpha <= 0.01) {
            particles.splice(i, 1);
            continue;
          }

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 5;
          ctx.fill();
        }

        // Draw subtle constellation vector links between close particles
        const maxDist = 45;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.25;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(164, 118, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.shadowBlur = 0;
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }

      // 4. SOFT AMBIENT SPOTLIGHT (Flashlight effect over dark background)
      if (currentX > -100 && currentY > -100 && presenceAlpha > 0.01) {
        ctx.save();
        const glowRadius = 85 + movementEnergy * 30;
        const glowAlpha = (0.07 + movementEnergy * 0.05) * presenceAlpha;
        const radial = ctx.createRadialGradient(
          currentX,
          currentY,
          2,
          currentX,
          currentY,
          glowRadius
        );
        radial.addColorStop(0, `rgba(164, 118, 255, ${glowAlpha})`);
        radial.addColorStop(0.5, `rgba(42, 51, 177, ${glowAlpha * 0.5})`);
        radial.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(currentX, currentY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. STABLE MODE EFFECTS (When mouse is stationary)
      if (stableWeight > 0.02 && currentX > -100 && currentY > -100 && presenceAlpha > 0.05) {
        ctx.save();
        const timeSec = now / 1000;
        const combinedAlpha = stableWeight * presenceAlpha;

        // A. Sonar / Cyber Radar Ping Waves
        const pingPeriod = 1.8;
        const pingCycle = (timeSec % pingPeriod) / pingPeriod;

        // Primary Sonar Ping
        const r1 = pingCycle * 65;
        const pingAlpha1 = (1 - pingCycle) * 0.38 * combinedAlpha;
        if (pingAlpha1 > 0.01) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, r1, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(164, 118, 255, ${pingAlpha1})`;
          ctx.lineWidth = 1;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }

        // Secondary Echo Ping (Offset by 0.28)
        const pingCycle2 = (pingCycle + 0.72) % 1;
        const r2 = pingCycle2 * 50;
        const pingAlpha2 = (1 - pingCycle2) * 0.22 * combinedAlpha;
        if (pingAlpha2 > 0.01 && pingCycle > 0.2) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, r2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${pingAlpha2})`;
          ctx.lineWidth = 0.8;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 6;
          ctx.stroke();
        }

        // B. Harmonic Orbiting Micro-Satellites
        const satelliteCount = 3;
        const baseRadius = 20 + Math.sin(timeSec * 3) * 4;
        const satColors = [accentColor, primaryColor, '#818cf8'];

        for (let s = 0; s < satelliteCount; s++) {
          const satAngle = timeSec * 2.2 + (s * (Math.PI * 2)) / satelliteCount;
          const satX = currentX + Math.cos(satAngle) * baseRadius;
          const satY = currentY + Math.sin(satAngle) * baseRadius;

          // Record micro-trail
          const sTrail = satelliteTrails[s];
          sTrail.unshift({ x: satX, y: satY, alpha: 0.7 * combinedAlpha });
          if (sTrail.length > 5) sTrail.pop();

          // Draw trail
          ctx.beginPath();
          for (let ti = 0; ti < sTrail.length - 1; ti++) {
            const t1 = sTrail[ti];
            const t2 = sTrail[ti + 1];
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.strokeStyle = `rgba(164, 118, 255, ${t1.alpha * (1 - ti / sTrail.length) * 0.5})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Draw satellite node
          ctx.beginPath();
          ctx.arc(satX, satY, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = satColors[s];
          ctx.shadowColor = satColors[s];
          ctx.shadowBlur = 7;
          ctx.globalAlpha = combinedAlpha * 0.85;
          ctx.fill();
        }

        // C. Standby Crosshair Brackets (Cyber Scanning Reticle)
        const reticleRadius = 24 + Math.sin(timeSec * 2) * 2;
        const rotAngle = timeSec * 0.35;
        const bracketLen = 4;
        const bracketAlpha = combinedAlpha * 0.3;

        ctx.strokeStyle = `rgba(164, 118, 255, ${bracketAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;

        for (let b = 0; b < 4; b++) {
          const bAngle = rotAngle + (b * Math.PI) / 2;
          const bx = currentX + Math.cos(bAngle) * reticleRadius;
          const by = currentY + Math.sin(bAngle) * reticleRadius;
          const bvx = -Math.sin(bAngle) * bracketLen;
          const bvy = Math.cos(bAngle) * bracketLen;

          ctx.beginPath();
          ctx.moveTo(bx - bvx * 0.5, by - bvy * 0.5);
          ctx.lineTo(bx + bvx * 0.5, by + bvy * 0.5);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 6. DRAW CLICK SHOCKWAVES
      if (shockwaves.length > 0) {
        ctx.save();
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.radius += dt * 140;
          sw.alpha = Math.max(0, (1 - sw.radius / sw.maxRadius) * 0.8);

          if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
            shockwaves.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerenter', onPointerEnter);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [primaryColor, secondaryColor, accentColor, trailLength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}
