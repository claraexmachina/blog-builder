'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  const truncatedExcerpt = excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt;

  return (
    <Link href={`/posts/${id}`} className="block group">
      <article className="pixel-card p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 flex-shrink-0 bg-[var(--kuromi-cream)] border-2 border-[var(--kuromi-lavender)] flex items-center justify-center overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-[var(--kuromi-lavender)] text-xl">✦</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--kuromi-dark-purple)] truncate group-hover:text-[var(--kuromi-pink)] transition-colors">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
              {truncatedExcerpt}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
              {categoryName && (
                <span className="pixel-badge">{categoryName}</span>
              )}
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-[var(--kuromi-pink)]" fill="currentColor" />
                {likes}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {format(new Date(createdAt), 'MM.dd')}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
