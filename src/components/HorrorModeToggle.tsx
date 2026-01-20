'use client';

import { useTheme } from './ThemeProvider';
import { Skull, Sparkles } from 'lucide-react';

export default function HorrorModeToggle() {
  const { toggleTheme, isHorrorMode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label={isHorrorMode ? '일반 모드로 전환' : '공포 모드로 전환'}
    >
      <div
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          isHorrorMode
            ? 'bg-gradient-to-r from-[#8b0000] to-[#c41e3a] shadow-[0_0_10px_rgba(196,30,58,0.5)]'
            : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)]'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
            isHorrorMode ? 'left-7' : 'left-1'
          }`}
        >
          {isHorrorMode ? (
            <Skull size={10} className="text-[#8b0000]" />
          ) : (
            <Sparkles size={10} className="text-[var(--accent-warm)]" />
          )}
        </div>
      </div>
    </button>
  );
}
