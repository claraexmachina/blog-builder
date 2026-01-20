'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
}

export default function LikeButton({ postId, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/likes/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setLikes(data.count);
        setLiked(data.liked);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [postId]);

  const handleLike = async () => {
    if (loading) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const res = await fetch(`/api/likes/${postId}`, {
        method: 'POST',
      });
      const data = await res.json();
      setLikes(data.count);
      setLiked(data.liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
        liked
          ? 'bg-[var(--kuromi-pink)] text-white'
          : 'bg-[var(--kuromi-soft-pink)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-pink)] hover:text-white'
      } ${loading ? 'opacity-50' : ''}`}
      style={{
        boxShadow: '2px 2px 0 0 var(--kuromi-dark-purple)',
        transform: animating ? 'scale(1.1)' : 'scale(1)'
      }}
    >
      <Heart
        size={12}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span>{likes}</span>
    </button>
  );
}
