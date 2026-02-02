'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ThumbnailProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function Thumbnail({ src, alt, size = 64, className = '' }: ThumbnailProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`bg-[var(--color-surface-alt)] rounded-lg border border-[var(--border-light)] flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[var(--border-medium)] text-lg">◇</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--color-surface-alt)] rounded-lg border border-[var(--border-light)] flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full rounded-lg"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
}
