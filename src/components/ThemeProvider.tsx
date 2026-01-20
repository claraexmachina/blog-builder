'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'pink' | 'horror';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isHorrorMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('pink');
  const [mounted, setMounted] = useState(false);

  // 마운트 시 localStorage에서 테마 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem('blog-theme') as Theme | null;
    if (savedTheme && (savedTheme === 'pink' || savedTheme === 'horror')) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // 테마 변경 시 DOM 및 localStorage 업데이트
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === 'horror') {
      root.setAttribute('data-theme', 'horror');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('blog-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'pink' ? 'horror' : 'pink'));
  };

  // 하이드레이션 불일치 방지를 위해 마운트 전에는 기본 테마 사용
  const value = {
    theme: mounted ? theme : 'pink',
    toggleTheme,
    isHorrorMode: mounted ? theme === 'horror' : false,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
