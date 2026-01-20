'use client';

import { useTheme } from './ThemeProvider';
import { siteConfig } from '@/config/site';

export default function ProfileName() {
  const { isHorrorMode } = useTheme();

  return <>{isHorrorMode ? 'Ubi lux, ibi umbra' : siteConfig.profile.name}</>;
}
