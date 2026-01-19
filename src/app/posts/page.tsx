import PostList from '@/components/PostList';

export const dynamic = 'force-dynamic';

export default function PostsPage() {
  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-6">ALL POSTS</h1>

        {/* Post List */}
        <PostList />
      </div>
    </div>
  );
}
