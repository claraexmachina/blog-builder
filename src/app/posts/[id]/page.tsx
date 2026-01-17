import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getPostById, getAllCategories } from '@/lib/db';
import { getSession } from '@/lib/auth';
import LikeButton from '@/components/LikeButton';
import DeleteButton from './DeleteButton';
import { Calendar, Folder, ArrowLeft, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = getPostById(id);
  const session = await getSession();

  if (!post) {
    notFound();
  }

  // Non-authenticated users can only see published posts
  if (!post.published && !session) {
    notFound();
  }

  const categories = getAllCategories();
  const category = categories.find((c) => c.id === post.categoryId);

  return (
    <div className="min-h-screen bg-[var(--kuromi-cream)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          목록으로 돌아가기
        </Link>

        {/* Post Card */}
        <article className="card-kuromi overflow-hidden">
          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Not published badge */}
            {!post.published && (
              <div className="mb-4">
                <span className="bg-[var(--kuromi-pink)] text-white text-sm px-3 py-1 rounded-full">
                  비공개
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--kuromi-dark-purple)] mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] mb-6 pb-6 border-b-2 border-[var(--kuromi-lavender)]">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {format(new Date(post.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>

              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-1 hover:text-[var(--kuromi-purple)] transition-colors"
                >
                  <Folder size={16} />
                  {category.name}
                </Link>
              )}
            </div>

            {/* Content */}
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-[var(--kuromi-lavender)]">
              <LikeButton postId={post.id} initialLikes={post.likes} />

              {session && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/write?edit=${post.id}`}
                    className="btn-retro-secondary flex items-center gap-2"
                  >
                    <Edit size={18} />
                    수정
                  </Link>
                  <DeleteButton postId={post.id} />
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/posts" className="btn-retro inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            다른 글 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
