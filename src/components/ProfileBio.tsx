'use client';

import { useTheme } from './ThemeProvider';
import { siteConfig } from '@/config/site';

export default function ProfileBio() {
  const { isHorrorMode } = useTheme();

  return <>{isHorrorMode ? '제가 보이시나요..? 👻' : siteConfig.profile.bio}</>;
}
