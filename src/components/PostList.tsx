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
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));

    // Fetch posts if not provided
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

  const displayedPosts = showAll ? posts : posts.slice(0, displayCount);
  const hasMore = !showAll && posts.length > displayCount;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card-kuromi h-40 loading-kuromi" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card-kuromi p-8 text-center">
        <span className="text-4xl block mb-4">★</span>
        <p className="text-[var(--kuromi-dark-purple)] font-medium">
          아직 작성된 글이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          className="btn-retro-secondary w-full flex items-center justify-center gap-2"
        >
          <ChevronDown size={20} />
          더보기 ({posts.length - displayCount}개 더)
        </button>
      )}
    </div>
  );
}
