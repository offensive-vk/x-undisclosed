import React, { useState, useRef } from 'react';

export default function HoloBadge() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!badgeRef.current) return;

    const rect = badgeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation (-15 to 15 degrees)
    const rotateY = ((x / rect.width) - 0.5) * 30;
    const rotateX = ((y / rect.height) - 0.5) * -30;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="w-[320px] h-[480px] select-none mx-auto group perspective-1000">
      <div
        ref={badgeRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full rounded-2xl transition-transform duration-200 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Holographic Glare */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 10%, transparent 60%)`,
          }}
        />

        {/* Iridescent Rainbow Overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 mix-blend-color-dodge opacity-0 group-hover:opacity-40"
          style={{
            background: `linear-gradient(135deg, rgba(255,0,0,0.5), rgba(0,255,0,0.5), rgba(0,0,255,0.5))`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${glare.x}% ${glare.y}%`
          }}
        />

        {/* Badge Content */}
        <div className="absolute inset-0 p-6 flex flex-col pointer-events-none transform-gpu translate-z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="font-mono text-sm tracking-widest text-[#a476ff] drop-shadow-[0_0_5px_rgba(164,118,255,0.8)]">
              ACCESS LEVEL: OMNI
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full border-4 border-[#2a33b1]/40 overflow-hidden relative shadow-[0_0_25px_rgba(42,51,177,0.5)]">
              <img src="/logo-black.svg" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1 tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">VEDANSH</h2>
              <p className="text-[#888] text-[10px] uppercase tracking-[0.2em]">Information Security Engineer</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-white/40 mb-1">ID NUMBER</div>
                <div className="font-mono text-sm text-white/80">NS17-0001</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 mb-1">CLEARANCE</div>
                <div className="font-mono text-sm text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">GRANTED</div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="mt-6 flex justify-center opacity-30">
            <div className="w-full h-8 flex justify-between space-x-[2px]">
              {[...Array(45)].map((_, i) => (
                <div key={i} className={`bg-white h-full ${[1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0][i] ? 'w-2' : 'w-1'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .translate-z-10 { transform: translateZ(30px); }
      `}</style>
    </div>
  );
}
