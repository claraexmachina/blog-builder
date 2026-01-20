'use client';

import { useTheme } from './ThemeProvider';
import { Skull, Sparkles } from 'lucide-react';

export default function HorrorModeToggle() {
  const { theme, toggleTheme, isHorrorMode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="mini-widget flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      aria-label={isHorrorMode ? '일반 모드로 전환' : '공포 모드로 전환'}
    >
      {/* 토글 스위치 */}
      <div
        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
          isHorrorMode
            ? 'bg-gradient-to-r from-[#8b0000] to-[#c41e3a] shadow-[0_0_12px_rgba(196,30,58,0.5)]'
            : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)]'
        }`}
      >
        {/* 토글 원 */}
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
            isHorrorMode ? 'left-8' : 'left-1'
          }`}
        >
          {isHorrorMode ? (
            <Skull size={12} className="text-[#8b0000]" />
          ) : (
            <Sparkles size={12} className="text-[var(--accent-warm)]" />
          )}
        </div>
      </div>

      {/* 라벨 */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-[var(--text-primary)]">
          {isHorrorMode ? '공포모드' : '일반모드'}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {isHorrorMode ? 'Horror Mode ON' : 'Horror Mode OFF'}
        </span>
      </div>
    </button>
  );
}
