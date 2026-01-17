import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getAllCategories } from '@/lib/db';
import PostList from '@/components/PostList';
import { Folder, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--kuromi-cream)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          전체 글 보기
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--kuromi-dark-purple)] flex items-center gap-3 mb-2">
            <Folder className="text-[var(--kuromi-pink)]" />
            {category.name}
          </h1>
          <p className="text-[var(--text-muted)]">
            {category.name} 카테고리의 글 목록입니다
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                cat.id === category.id
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'bg-[var(--kuromi-white)] text-[var(--kuromi-black)] border-2 border-[var(--kuromi-lavender)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Post List */}
        <PostList categorySlug={slug} />
      </div>
    </div>
  );
}
