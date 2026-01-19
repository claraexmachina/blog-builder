'use client';

import { useEffect, useRef } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

export default function AnimatedFavicon() {
  const isRunning = useRef(false);

  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    const proxyUrl = '/api/proxy-favicon';
    const fallbackUrl = 'https://pixelsafari.neocities.org/favicon/animals/cat/cat61.gif';
    let timeoutId: ReturnType<typeof setTimeout>;
    let frameIndex = 0;
    let frames: { imageData: ImageData; delay: number }[] = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create or get favicon link
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const renderFrame = () => {
      if (frames.length === 0) return;

      const frame = frames[frameIndex];
      ctx.putImageData(frame.imageData, 0, 0);
      link.href = canvas.toDataURL('image/png');

      frameIndex = (frameIndex + 1) % frames.length;
      timeoutId = setTimeout(renderFrame, frame.delay || 100);
    };

    const loadGif = async () => {
      try {
        // Fetch through proxy to avoid CORS
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Fetch failed');

        const buffer = await response.arrayBuffer();
        const gif = parseGIF(buffer);
        const decompressedFrames = decompressFrames(gif, true);

        if (decompressedFrames.length === 0) {
          console.log('No frames found');
          return;
        }

        // Set canvas size to GIF dimensions
        const { width, height } = decompressedFrames[0].dims;
        canvas.width = width;
        canvas.height = height;

        // Process each frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        // Keep track of previous frame for disposal
        let previousImageData: ImageData | null = null;

        decompressedFrames.forEach((frame, index) => {
          // Handle disposal method
          if (index > 0 && previousImageData) {
            tempCtx.putImageData(previousImageData, 0, 0);
          }

          // Create ImageData from patch
          const patchData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );

          // Draw patch at correct position
          tempCtx.putImageData(patchData, frame.dims.left, frame.dims.top);

          // Store full frame
          const fullFrame = tempCtx.getImageData(0, 0, width, height);
          frames.push({
            imageData: fullFrame,
            delay: frame.delay * 10 // Convert centiseconds to milliseconds
          });

          previousImageData = fullFrame;
        });

        console.log(`Loaded ${frames.length} frames for animated favicon`);
        renderFrame();
      } catch (error) {
        console.error('Failed to load animated favicon:', error);
        // Keep static GIF as fallback
        link.href = fallbackUrl;
      }
    };

    loadGif();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
