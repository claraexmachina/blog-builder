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
    setTimeout(() => setAnimating(false), 600);

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
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        liked
          ? 'bg-[var(--kuromi-pink)] text-white'
          : 'bg-[var(--kuromi-white)] border-2 border-[var(--kuromi-pink)] text-[var(--kuromi-pink)]'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
    >
      <Heart
        size={20}
        className={`${animating ? 'heart-beat' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="font-bold">{likes}</span>
    </button>
  );
}
