import PostList from '@/components/PostList';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-[var(--kuromi-cream)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--kuromi-dark-purple)] flex items-center gap-3 mb-2">
            <BookOpen className="text-[var(--kuromi-pink)]" />
            전체 글
          </h1>
          <p className="text-[var(--text-muted)]">
            모든 글을 최신순으로 확인하세요
          </p>
        </div>

        {/* Post List */}
        <PostList />
      </div>
    </div>
  );
}
