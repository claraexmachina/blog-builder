'use client';

import { useTheme } from './ThemeProvider';
import { siteConfig } from '@/config/site';

export default function NowPlaying() {
  const { isHorrorMode } = useTheme();

  const nowPlaying = isHorrorMode ? siteConfig.nowPlayingHorror : siteConfig.nowPlaying;

  return (
    <div className="mini-widget">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[var(--icon-box-bg)] rounded-lg flex items-center justify-center text-[var(--icon-box-text)] text-sm">
          {isHorrorMode ? '💀' : '♪'}
        </div>
        <div className="text-xs">
          <p className="text-[var(--text-primary)] font-medium">{nowPlaying.title}</p>
          <p className="text-[var(--text-muted)]">{nowPlaying.artist}</p>
        </div>
      </div>
      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${nowPlaying.youtubeId}`}
          title="Now Playing"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border border-[var(--border-light)] rounded-lg"
        ></iframe>
      </div>
    </div>
  );
}
