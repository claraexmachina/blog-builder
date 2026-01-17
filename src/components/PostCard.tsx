'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Calendar, Folder } from 'lucide-react';
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
  categorySlug,
}: PostCardProps) {
  // Limit excerpt to 3 lines (approximately 150 characters)
  const truncatedExcerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;

  return (
    <Link href={`/posts/${id}`} className="block">
      <article className="card-kuromi overflow-hidden group">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-48 h-40 sm:h-auto sm:min-h-[160px] bg-[var(--kuromi-light-lavender)] flex-shrink-0">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-50">★</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-bold text-[var(--kuromi-dark-purple)] mb-2 group-hover:text-[var(--kuromi-purple)] transition-colors line-clamp-2">
              {title}
            </h3>

            <p className="text-sm text-[var(--kuromi-black)] opacity-70 mb-3 line-clamp-3">
              {truncatedExcerpt}
            </p>

            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(createdAt), 'yyyy.MM.dd', { locale: ko })}
              </span>

              {categoryName && (
                <span className="flex items-center gap-1">
                  <Folder size={14} />
                  {categoryName}
                </span>
              )}

              <span className="flex items-center gap-1 text-[var(--kuromi-pink)]">
                <Heart size={14} fill="currentColor" />
                {likes}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
