'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

export default function PixelRoom() {
  const { isHorrorMode } = useTheme();

  return (
    <Image
      src={isHorrorMode ? '/images/pixel-room-horror.png' : '/images/pixel-room.png'}
      alt="My Pixel Room"
      width={1280}
      height={853}
      className="w-full h-auto"
      priority
    />
  );
}
