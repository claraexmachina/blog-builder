'use client';

import { useRef, useState } from 'react';

interface DockItem {
  id: number;
  color: string;
  href: string;
  label: string;
}

const dockItems: DockItem[] = [
  { id: 1, color: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)', href: 'https://vidkidz.tistory.com/235', label: 'Blog 1' },
  { id: 2, color: 'linear-gradient(135deg, #98D8C8 0%, #7FCDCD 100%)', href: 'https://www.crazygames.com/game/cat-life-simulator-devil-cat', label: 'Cat Game' },
  { id: 3, color: 'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)', href: 'https://samandev.itch.io/tamaweb', label: 'Tamaweb' },
  { id: 4, color: 'linear-gradient(135deg, #FFDAB9 0%, #FFA07A 100%)', href: 'https://bongo.cat/', label: 'Bongo Cat' },
  { id: 5, color: 'linear-gradient(135deg, #87CEEB 0%, #6BB3D9 100%)', href: 'https://acidrain.hancomtaja.com/?gamekey=acidrain', label: 'Acid Rain' },
  { id: 6, color: 'linear-gradient(135deg, #FFFACD 0%, #F0E68C 100%)', href: 'https://www.youtube.com/watch?v=QwQnskHnoWg', label: 'YouTube 2' },
  { id: 7, color: 'linear-gradient(135deg, #F08080 0%, #E9967A 100%)', href: 'https://vidkidz.tistory.com/481', label: 'Blog 2' },
  { id: 8, color: 'linear-gradient(135deg, #E6E6FA 0%, #D8BFD8 100%)', href: 'https://www.astrology.com/compatibility/fortune-cookie.html', label: 'Fortune' },
  { id: 9, color: 'linear-gradient(135deg, #B0E0E6 0%, #AFEEEE 100%)', href: 'https://www.youtube.com/watch?v=UJs6__K7gSY', label: 'YouTube 3' },
];

export default function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const getLerp = (index: number): number => {
    if (hoveredIndex === null) return 0;
    const distance = Math.abs(index - hoveredIndex);
    // 줄인 lerp 값들 (기존보다 작게)
    const lerpValues = [0.6, 0.3, 0.1, 0];
    return lerpValues[Math.min(distance, lerpValues.length - 1)] || 0;
  };

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden md:block"
      aria-label="Quick links dock"
    >
      <div
        ref={dockRef}
        className="dock-container flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg"
      >
        {dockItems.map((item, index) => {
          const lerp = getLerp(index);
          const scale = 1 + lerp * 0.4; // 최대 1.4배로 제한
          const translateY = lerp * -20; // 최대 -20px로 제한

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="dock-item block transition-transform duration-150 ease-out"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                zIndex: hoveredIndex === index ? 10 : 5 - Math.abs(index - (hoveredIndex ?? 0)),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={item.label}
            >
              <div
                className="dock-icon w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-md relative overflow-hidden"
                style={{ background: item.color }}
              >
                {/* Glossy effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl sm:rounded-2xl" />
                {/* Inner highlight */}
                <div
                  className="absolute top-0.5 left-0.5 right-0.5 h-1/3 rounded-t-lg sm:rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }}
                />
              </div>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
