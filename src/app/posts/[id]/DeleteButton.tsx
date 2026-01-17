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
          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {deleting ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={handleCancel}
          disabled={deleting}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
    >
      <Trash2 size={16} />
      삭제
    </button>
  );
}
