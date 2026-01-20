'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  postId: string;
}

export default function DeleteButton({ postId }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/posts');
        router.refresh();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2 py-1 text-xs font-bold bg-[var(--kuromi-pink)] text-white disabled:opacity-50 cursor-pointer"
          style={{ boxShadow: '2px 2px 0 0 var(--kuromi-dark-purple)' }}
        >
          {deleting ? '...' : '확인'}
        </button>
        <button
          onClick={handleCancel}
          disabled={deleting}
          className="px-2 py-1 text-xs font-bold bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] cursor-pointer"
          style={{ boxShadow: '2px 2px 0 0 var(--kuromi-lavender)' }}
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-[var(--kuromi-pink)] bg-[var(--kuromi-cream)] hover:bg-[var(--kuromi-soft-pink)] transition-colors cursor-pointer"
      style={{ boxShadow: '2px 2px 0 0 var(--kuromi-lavender)' }}
    >
      <Trash2 size={12} />
      삭제
    </button>
  );
}
