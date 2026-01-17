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
import { ArrowLeft, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  const session = await getSession();

  if (!post) {
    notFound();
  }

  if (!post.published && !session) {
    notFound();
  }

  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === post.categoryId);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로
        </Link>

        <article>
          {post.thumbnail && (
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="mb-8">
            {!post.published && (
              <span className="badge badge-accent text-xs mb-4 inline-block">
                비공개
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--kuromi-dark-purple)] mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
              <span>
                {format(new Date(post.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>

              {category && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <Link
                    href={`/category/${category.slug}`}
                    className="hover:text-[var(--kuromi-purple)] transition-colors"
                  >
                    {category.name}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="markdown-content pb-8 border-b border-[var(--card-border)]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="flex items-center justify-between py-6">
            <LikeButton postId={post.id} initialLikes={post.likes} />

            {session && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/write?edit=${post.id}`}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Edit size={16} />
                  수정
                </Link>
                <DeleteButton postId={post.id} />
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
