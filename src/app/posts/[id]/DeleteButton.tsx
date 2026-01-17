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
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {deleting ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={handleCancel}
          disabled={deleting}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 transition-colors"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded font-medium hover:bg-red-200 transition-colors"
    >
      <Trash2 size={18} />
      삭제
    </button>
  );
}
