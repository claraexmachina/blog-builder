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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
        liked
          ? 'bg-[var(--kuromi-pink-accent)] text-white'
          : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-pink-accent)] hover:bg-[var(--kuromi-light-lavender)]'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart
        size={16}
        className={animating ? 'heart-beat' : ''}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span>{likes}</span>
    </button>
  );
}
