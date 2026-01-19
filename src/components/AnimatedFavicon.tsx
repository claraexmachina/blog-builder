'use client';

import { useEffect } from 'react';

export default function AnimatedFavicon() {
  useEffect(() => {
    const gifUrl = 'https://pixelsafari.neocities.org/favicon/animals/cat/cat61.gif';

    // Create a canvas to extract frames from GIF
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = gifUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Draw the GIF frame
      ctx.drawImage(img, 0, 0, 32, 32);

      // Update favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/gif';
      link.rel = 'icon';
      link.href = gifUrl;
      document.head.appendChild(link);
    };

    // Fallback: directly set the GIF URL
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/gif';
    link.rel = 'icon';
    link.href = gifUrl;
    document.head.appendChild(link);
  }, []);

  return null;
}
