'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

export default function PixelRoom() {
  const { isHorrorMode } = useTheme();

  return (
    <div className="relative w-full" style={{ aspectRatio: '1280 / 853' }}>
      <Image
        src={isHorrorMode ? '/images/pixel-room-horror.png' : '/images/pixel-room.png'}
        alt="My Pixel Room"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
