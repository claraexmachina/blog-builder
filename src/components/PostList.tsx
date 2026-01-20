'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { ChevronDown } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  createdAt: string;
  likes: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostListProps {
  initialPosts?: Post[];
  categorySlug?: string;
  showAll?: boolean;
}

export default function PostList({ initialPosts, categorySlug, showAll = false }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [loading, setLoading] = useState(!initialPosts);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));

    if (!initialPosts) {
      const url = categorySlug
        ? `/api/categories/${categorySlug}`
        : '/api/posts';

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.posts || []);
          setLoading(false);
        })
        .catch(() => {
          setPosts([]);
          setLoading(false);
        });
    }
  }, [initialPosts, categorySlug]);

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { name: undefined, slug: undefined };
    const cat = categories.find((c) => c.id === categoryId);
    return { name: cat?.name, slug: cat?.slug };
  };

  // Filter out corrupted posts (missing required fields)
  const validPosts = posts.filter((post) => post.title && post.excerpt);
  const displayedPosts = showAll ? validPosts : validPosts.slice(0, displayCount);
  const hasMore = !showAll && validPosts.length > displayCount;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pixel-card h-24 flex items-center justify-center">
            <span className="pixel-loading text-xs text-[var(--text-muted)]">loading...</span>
          </div>
        ))}
      </div>
    );
  }

  if (validPosts.length === 0) {
    return (
      <div className="widget-box">
        <div className="widget-title">POSTS</div>
        <div className="widget-content text-center py-8">
          <p className="text-sm text-[var(--text-muted)]">
            아직 작성된 글이 없어요 <span className="pixel-heart">♡</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedPosts.map((post) => {
        const { name, slug } = getCategoryInfo(post.categoryId);
        return (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            excerpt={post.excerpt}
            thumbnail={post.thumbnail}
            createdAt={post.createdAt}
            likes={post.likes}
            categoryName={name}
            categorySlug={slug}
          />
        );
      })}

      {hasMore && (
        <button
          onClick={() => setDisplayCount((prev) => prev + 5)}
          className="pixel-btn pixel-btn-secondary w-full flex items-center justify-center gap-2"
        >
          <ChevronDown size={14} />
          더보기 ({validPosts.length - displayCount}개 더)
        </button>
      )}
    </div>
  );
}
