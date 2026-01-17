'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  FileText,
  Clock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  PenSquare,
  ArrowLeft,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  likes: number;
}

interface Draft {
  id: string;
  title: string;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'drafts'>('posts');

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          router.push('/login');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch all posts (including unpublished)
      fetch('/api/posts')
        .then((res) => res.json())
        .then((data) => setPosts(data.posts || []))
        .catch(() => setPosts([]));

      // Fetch drafts
      fetch('/api/drafts')
        .then((res) => res.json())
        .then((data) => setDrafts(data.drafts || []))
        .catch(() => setDrafts([]));
    }
  }, [isAuthenticated]);

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, published: !currentStatus } : p
          )
        );
      }
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('이 글을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('이 임시저장을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      }
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[var(--kuromi-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 loading-kuromi">★</div>
          <p className="text-[var(--kuromi-dark-purple)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--kuromi-cream)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] transition-colors mb-2"
            >
              <ArrowLeft size={20} />
              홈으로
            </Link>
            <h1 className="text-3xl font-bold text-[var(--kuromi-dark-purple)]">
              관리 페이지
            </h1>
          </div>

          <Link href="/write" className="btn-retro flex items-center gap-2">
            <PenSquare size={18} />
            새 글 작성
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'posts'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-white)] text-[var(--kuromi-black)] border-2 border-[var(--kuromi-lavender)]'
            }`}
          >
            <FileText size={18} />
            글 목록 ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'drafts'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-white)] text-[var(--kuromi-black)] border-2 border-[var(--kuromi-lavender)]'
            }`}
          >
            <Clock size={18} />
            임시저장 ({drafts.length})
          </button>
        </div>

        {/* Content */}
        <div className="card-kuromi overflow-hidden">
          {activeTab === 'posts' ? (
            <div className="divide-y-2 divide-[var(--kuromi-lavender)]">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  작성된 글이 없습니다.
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 flex items-center justify-between hover:bg-[var(--kuromi-cream)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.published ? (
                          <Eye size={16} className="text-green-500" />
                        ) : (
                          <EyeOff size={16} className="text-[var(--text-muted)]" />
                        )}
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-medium text-[var(--kuromi-dark-purple)] hover:text-[var(--kuromi-purple)] truncate"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', {
                          locale: ko,
                        })}{' '}
                        · ♡ {post.likes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        className={`p-2 rounded transition-colors ${
                          post.published
                            ? 'text-green-500 hover:bg-green-100'
                            : 'text-[var(--text-muted)] hover:bg-[var(--kuromi-light-lavender)]'
                        }`}
                        title={post.published ? '비공개로 전환' : '공개로 전환'}
                      >
                        {post.published ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <Link
                        href={`/write?edit=${post.id}`}
                        className="p-2 text-[var(--kuromi-purple)] hover:bg-[var(--kuromi-light-lavender)] rounded transition-colors"
                        title="수정"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y-2 divide-[var(--kuromi-lavender)]">
              {drafts.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  임시저장된 글이 없습니다.
                </div>
              ) : (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 flex items-center justify-between hover:bg-[var(--kuromi-cream)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/write?draft=${draft.id}`}
                        className="font-medium text-[var(--kuromi-dark-purple)] hover:text-[var(--kuromi-purple)] truncate block"
                      >
                        {draft.title || '제목 없음'}
                      </Link>
                      <p className="text-xs text-[var(--text-muted)]">
                        {format(new Date(draft.updatedAt), 'yyyy.MM.dd HH:mm', {
                          locale: ko,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/write?draft=${draft.id}`}
                        className="p-2 text-[var(--kuromi-purple)] hover:bg-[var(--kuromi-light-lavender)] rounded transition-colors"
                        title="이어서 작성"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
