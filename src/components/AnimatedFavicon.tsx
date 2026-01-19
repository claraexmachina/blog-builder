'use client';

import { useEffect, useRef } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

export default function AnimatedFavicon() {
  const frameIndexRef = useRef(0);
  const framesRef = useRef<ImageData[]>([]);
  const delaysRef = useRef<number[]>([]);

  useEffect(() => {
    const gifUrl = 'https://pixelsafari.neocities.org/favicon/animals/cat/cat61.gif';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!ctx) return;

    const updateFavicon = () => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = canvas.toDataURL('image/png');
      }
    };

    const renderFrame = () => {
      if (framesRef.current.length === 0) return;

      const frame = framesRef.current[frameIndexRef.current];
      const delay = delaysRef.current[frameIndexRef.current] || 100;

      ctx.putImageData(frame, 0, 0);
      updateFavicon();

      frameIndexRef.current = (frameIndexRef.current + 1) % framesRef.current.length;
      timeoutId = setTimeout(renderFrame, delay);
    };

    const loadGif = async () => {
      try {
        const response = await fetch(gifUrl);
        const buffer = await response.arrayBuffer();
        const gif = parseGIF(buffer);
        const frames = decompressFrames(gif, true);

        if (frames.length === 0) return;

        // Set canvas size
        canvas.width = frames[0].dims.width;
        canvas.height = frames[0].dims.height;

        // Create ImageData for each frame
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        frames.forEach((frame) => {
          // Create ImageData from frame patch
          const imageData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );

          // Draw frame patch at correct position
          tempCtx.putImageData(
            imageData,
            frame.dims.left,
            frame.dims.top
          );

          // Copy full frame
          const fullFrame = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
          framesRef.current.push(fullFrame);
          delaysRef.current.push(frame.delay * 10); // delay is in centiseconds
        });

        // Start animation
        renderFrame();
      } catch (error) {
        console.error('Failed to load animated favicon:', error);
        // Fallback to static favicon
        const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (link) {
          link.href = gifUrl;
        }
      }
    };

    loadGif();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
