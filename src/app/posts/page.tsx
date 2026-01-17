import PostList from '@/components/PostList';

export const dynamic = 'force-dynamic';

export default function PostsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--kuromi-dark-purple)] mb-2">
            전체 글
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            모든 글을 최신순으로 확인하세요
          </p>
        </div>

        <PostList />
      </div>
    </div>
  );
}
