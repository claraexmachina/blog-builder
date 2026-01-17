import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/db';
import PostCard from '@/components/PostCard';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const posts = (await getAllPosts(true)).slice(0, 3);
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--kuromi-dark-purple)] mb-6 tracking-tight">
            안녕하세요
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 leading-relaxed">
            일상과 생각을 기록하는 나만의 공간입니다
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/posts" className="btn-primary inline-flex items-center gap-2">
              글 보러가기
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-[var(--kuromi-cream)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">
            카테고리
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="card card-interactive p-5 text-center"
              >
                <div className="text-2xl mb-2">
                  {category.slug === 'daily' && '📅'}
                  {category.slug === 'thoughts' && '💭'}
                  {category.slug === 'journal' && '📔'}
                  {category.slug === 'tech' && '💻'}
                </div>
                <h3 className="font-medium text-[var(--kuromi-black)]">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
              최근 글
            </h2>
            <Link
              href="/posts"
              className="text-sm text-[var(--kuromi-purple)] hover:text-[var(--kuromi-dark-purple)] font-medium inline-flex items-center gap-1"
            >
              전체보기
              <ArrowRight size={14} />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => {
                const category = categories.find((c) => c.id === post.categoryId);
                return (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    thumbnail={post.thumbnail}
                    createdAt={post.createdAt}
                    likes={post.likes}
                    categoryName={category?.name}
                    categorySlug={category?.slug}
                  />
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-[var(--text-muted)] mb-6">
                아직 작성된 글이 없습니다
              </p>
              <Link href="/write" className="btn-primary inline-flex items-center gap-2">
                첫 글 작성하기
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-[var(--kuromi-cream)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            About
          </h2>
          <p className="text-[var(--kuromi-black)] leading-relaxed">
            이곳은 일상의 소소한 순간들과 깊은 생각들을 기록하는 공간입니다.
            <br className="hidden md:block" />
            하루하루의 이야기를 편하게 써내려갑니다.
          </p>
        </div>
      </section>
    </div>
  );
}
