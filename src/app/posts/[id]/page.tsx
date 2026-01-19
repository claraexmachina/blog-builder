import { notFound } from 'next/navigation';
import Link from 'next/link';
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
import { ArrowLeft, Edit, Clock, Folder } from 'lucide-react';

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
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          목록으로
        </Link>

        {/* Post Widget */}
        <article className="widget-box">
          <div className="widget-title flex items-center gap-2">
            POST
            {!post.published && (
              <span className="pixel-badge-pink text-[10px]">비공개</span>
            )}
          </div>
          <div className="widget-content">
            {/* Title */}
            <h1 className="text-lg font-bold text-[var(--kuromi-dark-purple)] mb-3">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-4 pb-4 border-b-2 border-dashed border-[var(--kuromi-lavender)]">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {format(new Date(post.createdAt), 'yyyy.MM.dd', { locale: ko })}
              </span>

              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-1 hover:text-[var(--kuromi-pink)] transition-colors"
                >
                  <Folder size={12} />
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-[var(--kuromi-lavender)]">
              <LikeButton postId={post.id} initialLikes={post.likes} />

              {session && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/write?edit=${post.id}`}
                    className="pixel-btn pixel-btn-secondary inline-flex items-center gap-1 text-xs"
                  >
                    <Edit size={12} />
                    수정
                  </Link>
                  <DeleteButton postId={post.id} />
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-4 text-center">
          <Link href="/posts" className="pixel-btn inline-flex items-center gap-1">
            <ArrowLeft size={12} />
            다른 글 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
