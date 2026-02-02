'use client';

import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Thumbnail from '@/components/Thumbnail';

// 마크다운과 HTML 문법 제거
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  createdAt: string;
  likes: number;
  categoryName?: string;
  categorySlug?: string;
}

export default function PostCard({
  id,
  title,
  excerpt,
  thumbnail,
  createdAt,
  likes,
  categoryName,
}: PostCardProps) {
  const cleanExcerpt = stripMarkdown(excerpt);
  const truncatedExcerpt = cleanExcerpt.length > 100 ? cleanExcerpt.substring(0, 100) + '...' : cleanExcerpt;

  return (
    <Link href={`/posts/${id}`} className="block group">
      <article className="pixel-card p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <Thumbnail
            src={thumbnail}
            alt={title}
            size={64}
            className="flex-shrink-0"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-warm)] transition-colors">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
              {truncatedExcerpt}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
              {categoryName && (
                <span className="pixel-badge">{categoryName}</span>
              )}
              <span className="flex items-center gap-1">
                <Heart size={11} className="text-[var(--accent-warm)]" fill="currentColor" />
                {likes}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {format(new Date(createdAt), 'MM.dd')}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
