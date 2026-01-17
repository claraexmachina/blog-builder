'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
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
  const truncatedExcerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;

  return (
    <Link href={`/posts/${id}`} className="block group">
      <article className="card card-interactive overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-44 h-36 sm:h-auto sm:min-h-[140px] bg-[var(--kuromi-cream)] flex-shrink-0 overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[var(--kuromi-light-lavender)] opacity-50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              {categoryName && (
                <span className="badge text-xs">
                  {categoryName}
                </span>
              )}
              <span className="text-xs text-[var(--text-muted)]">
                {format(new Date(createdAt), 'yyyy.MM.dd', { locale: ko })}
              </span>
            </div>

            <h3 className="text-base font-semibold text-[var(--kuromi-black)] mb-2 group-hover:text-[var(--kuromi-purple)] transition-colors line-clamp-2">
              {title}
            </h3>

            <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
              {truncatedExcerpt}
            </p>

            <div className="flex items-center gap-1 text-xs text-[var(--kuromi-pink-accent)]">
              <Heart size={12} fill="currentColor" />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
