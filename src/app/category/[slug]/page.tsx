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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          전체 글
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--kuromi-dark-purple)] mb-2">
            {category.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {category.name} 카테고리의 글 목록
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                cat.id === category.id
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <PostList categorySlug={slug} />
      </div>
    </div>
  );
}
