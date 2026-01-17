import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/db';
import PostCard from '@/components/PostCard';
import { BookOpen, PenSquare, Sparkles, Star, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const posts = getAllPosts(true).slice(0, 3);
  const categories = getAllCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-[var(--kuromi-light-lavender)] via-[var(--kuromi-cream)] to-[var(--kuromi-lavender)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">★</div>
        <div className="absolute top-20 right-20 text-4xl opacity-30 animate-pulse delay-100">☆</div>
        <div className="absolute bottom-10 left-1/4 text-5xl opacity-20 animate-pulse delay-200">♡</div>
        <div className="absolute bottom-20 right-1/3 text-3xl opacity-25 animate-pulse delay-300">★</div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Pixel art-style frame */}
          <div className="inline-block mb-8">
            <div className="pixel-border bg-[var(--kuromi-white)] p-8 rounded-lg">
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--kuromi-dark-purple)] mb-4">
                <span className="star-decoration">My Blog</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--kuromi-black)] opacity-80">
                일상과 생각을 기록하는 나만의 공간
              </p>
            </div>
          </div>

          {/* Game Boy style message box */}
          <div className="pixel-border-sm bg-[var(--kuromi-white)] p-4 rounded max-w-md mx-auto mb-8">
            <p className="font-mono text-sm text-[var(--kuromi-dark-purple)]">
              ▶ Press START to explore...
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/posts" className="btn-retro flex items-center gap-2">
              <BookOpen size={20} />
              글 보러가기
            </Link>
            <Link href="/write" className="btn-retro-secondary flex items-center gap-2">
              <PenSquare size={20} />
              글 작성하기
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-[var(--kuromi-cream)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--kuromi-dark-purple)] mb-8 flex items-center gap-2">
            <Sparkles className="text-[var(--kuromi-pink)]" />
            카테고리
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="card-kuromi p-6 text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {category.slug === 'daily' && '📅'}
                  {category.slug === 'thoughts' && '💭'}
                  {category.slug === 'journal' && '📔'}
                  {category.slug === 'tech' && '💻'}
                </div>
                <h3 className="font-bold text-[var(--kuromi-dark-purple)]">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 px-4 bg-[var(--kuromi-white)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--kuromi-dark-purple)] flex items-center gap-2">
              <Star className="text-[var(--kuromi-pink)]" />
              최근 글
            </h2>
            <Link
              href="/posts"
              className="text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] font-medium flex items-center gap-1"
            >
              전체보기 →
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
            <div className="card-kuromi p-12 text-center">
              <div className="text-6xl mb-4">★</div>
              <h3 className="text-xl font-bold text-[var(--kuromi-dark-purple)] mb-2">
                아직 글이 없어요!
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                첫 번째 글을 작성해보세요~
              </p>
              <Link href="/write" className="btn-retro inline-flex items-center gap-2">
                <PenSquare size={18} />
                글 작성하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[var(--kuromi-lavender)] to-[var(--kuromi-purple)]">
        <div className="max-w-4xl mx-auto">
          <div className="pixel-border bg-[var(--kuromi-white)] p-8 rounded-lg text-center">
            <div className="flex justify-center gap-2 mb-4">
              <Heart className="text-[var(--kuromi-pink)]" fill="currentColor" />
              <Heart className="text-[var(--kuromi-pink)]" fill="currentColor" />
              <Heart className="text-[var(--kuromi-pink)]" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--kuromi-dark-purple)] mb-4">
              About This Blog
            </h2>
            <p className="text-[var(--kuromi-black)] opacity-80 max-w-2xl mx-auto leading-relaxed">
              이곳은 일상의 소소한 순간들과 깊은 생각들을 기록하는 나만의 공간입니다.
              90년대 게임보이의 향수와 귀여운 감성을 담아,
              하루하루의 이야기를 써내려갑니다.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="text-2xl">★</span>
              <span className="text-2xl">☆</span>
              <span className="text-2xl">★</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
