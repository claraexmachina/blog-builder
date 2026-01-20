'use client';

import { useTheme } from './ThemeProvider';
import { siteConfig } from '@/config/site';

export default function ProfileEmoji() {
  const { isHorrorMode } = useTheme();

  return <>{isHorrorMode ? '😈' : siteConfig.profile.emoji}</>;
}
