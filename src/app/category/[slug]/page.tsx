import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getAllCategories } from '@/lib/db';
import PostList from '@/components/PostList';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categories = await getAllCategories();

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          전체 글
        </Link>

        {/* Header Widget */}
        <div className="widget-box mb-4">
          <div className="widget-title">CATEGORY</div>
          <div className="widget-content">
            <h1 className="text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
              {category.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {category.name} 카테고리의 글 목록이에요 <span className="pixel-heart">♡</span>
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mini-widget mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-3 py-1 text-xs font-bold transition-all ${
                  cat.id === category.id
                    ? 'bg-[var(--kuromi-purple)] text-white'
                    : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                }`}
                style={{
                  boxShadow: cat.id === category.id ? '2px 2px 0 0 var(--kuromi-dark-purple)' : '1px 1px 0 0 var(--kuromi-lavender)'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Post List */}
        <PostList categorySlug={slug} />
      </div>
    </div>
  );
}
