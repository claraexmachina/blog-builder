'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

export default function PixelRoom() {
  const { isHorrorMode } = useTheme();

  return (
    <div className="relative w-full" style={{ aspectRatio: '1280 / 853' }}>
      {/* Normal mode image */}
      <Image
        src="/images/pixel-room.png"
        alt="My Pixel Room"
        fill
        className={`object-cover transition-opacity duration-300 ${isHorrorMode ? 'opacity-0' : 'opacity-100'}`}
        priority
      />
      {/* Horror mode image */}
      <Image
        src="/images/pixel-room-horror.png"
        alt="My Pixel Room - Horror"
        fill
        className={`object-cover transition-opacity duration-300 ${isHorrorMode ? 'opacity-100' : 'opacity-0'}`}
        priority
      />
    </div>
  );
}
