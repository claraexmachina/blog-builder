import PostList from '@/components/PostList';

export const dynamic = 'force-dynamic';

export default function PostsPage() {
  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="widget-box mb-6">
          <div className="widget-title">ALL POSTS</div>
          <div className="widget-content">
            <p className="text-xs text-[var(--text-muted)]">
              <span className="pixel-star">✦</span> 모든 글을 최신순으로 볼 수 있어요
            </p>
          </div>
        </div>

        {/* Post List */}
        <PostList />
      </div>
    </div>
  );
}
