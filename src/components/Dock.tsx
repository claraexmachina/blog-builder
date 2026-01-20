'use client';

import { useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface DockItem {
  id: number;
  color: string;
  href: string;
  label: string;
}

// 일반 모드 - 밝은 파스텔 그라디언트
const normalDockItems: DockItem[] = [
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

// 호러 모드 - 어둡고 음산한 그라디언트 🎃
const horrorDockItems: DockItem[] = [
  { id: 1, color: 'linear-gradient(135deg, #8b1a1a 0%, #cc2233 100%)', href: 'https://youtu.be/hyJtGlvVzDQ?si=2sYykPOFGMnKY8N9', label: 'Spooky Music' }, // 핏빛 빨강
  { id: 2, color: 'linear-gradient(135deg, #1a3d2a 0%, #2d6d4a 100%)', href: 'https://www.boredbutton.com/', label: 'Bored Button' }, // 독 녹색
  { id: 3, color: 'linear-gradient(135deg, #3d1a3d 0%, #6a2d6a 100%)', href: 'https://vidkidz.tistory.com/1617', label: 'Blog' }, // 자주색 보라
  { id: 4, color: 'linear-gradient(135deg, #4d2800 0%, #8b4a00 100%)', href: 'https://90s.myretrotvs.com/#lLvsnkQtZLI', label: 'Retro TV' }, // 호박 오렌지
  { id: 5, color: 'linear-gradient(135deg, #1a2a4d 0%, #2d4a7a 100%)', href: 'https://ncase.me/trust/', label: 'Trust Game' }, // 심연 블루
  { id: 6, color: 'linear-gradient(135deg, #4d4a00 0%, #7a7314 100%)', href: 'https://www.youtube.com/watch?v=zjNZJ6Z93Z0', label: 'YouTube' }, // 독 황금
  { id: 7, color: 'linear-gradient(135deg, #6d1a2a 0%, #a62d4a 100%)', href: 'https://www.webhamster.com/', label: 'Hamster' }, // 크림슨
  { id: 8, color: 'linear-gradient(135deg, #2d1f3d 0%, #4a3d6a 100%)', href: 'https://http.cat/', label: 'HTTP Cat' }, // 자정 보라
  { id: 9, color: 'linear-gradient(135deg, #0d3d4d 0%, #1a5d6d 100%)', href: 'https://www.cameronsworld.net/', label: 'Camerons World' }, // 유령 청록
];

export default function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const { isHorrorMode } = useTheme();

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
        className={`dock-container flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl backdrop-blur-md ${
          isHorrorMode
            ? 'bg-black/70 border border-red-900/50 shadow-[0_0_20px_rgba(200,50,50,0.3),0_0_40px_rgba(139,26,26,0.2)]'
            : 'bg-white/50 border border-white/30 shadow-lg'
        }`}
      >
        {(isHorrorMode ? horrorDockItems : normalDockItems).map((item, index) => {
          const lerp = getLerp(index);
          const scale = 1 + lerp * 0.4; // 최대 1.4배로 제한
          const translateY = lerp * -20; // 최대 -20px로 제한

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="dock-item block transition-transform duration-150 ease-out cursor-pointer"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                zIndex: hoveredIndex === index ? 10 : 5 - Math.abs(index - (hoveredIndex ?? 0)),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={item.label}
            >
              <div
                className={`dock-icon w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl relative overflow-hidden ${
                  isHorrorMode
                    ? 'shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_12px_rgba(200,50,50,0.3)]'
                    : 'shadow-md'
                }`}
                style={{ background: item.color }}
              >
                {/* Glossy effect */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
                  isHorrorMode
                    ? 'bg-gradient-to-br from-white/15 via-transparent to-black/20'
                    : 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
                }`} />
                {/* Inner highlight */}
                <div
                  className="absolute top-0.5 left-0.5 right-0.5 h-1/3 rounded-t-lg sm:rounded-t-xl"
                  style={{
                    background: isHorrorMode
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)'
                  }}
                />
                {/* Horror mode glow edge */}
                {isHorrorMode && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-red-900/30" />
                )}
              </div>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
