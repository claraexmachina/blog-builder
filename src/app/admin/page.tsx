'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  FileText,
  Clock,
  Edit,
  Trash2,
  PenSquare,
  ArrowLeft,
  FolderOpen,
  Plus,
  Check,
  X,
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'drafts' | 'categories'>('posts');

  // Category editing state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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

      // Fetch categories
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch(() => setCategories([]));
    }
  }, [isAuthenticated]);

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

  // Category functions
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: generateSlug(newCategoryName.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, data.category]);
        setNewCategoryName('');
        setIsAddingCategory(false);
      } else {
        alert('카테고리 추가에 실패했습니다.');
      }
    } catch {
      alert('카테고리 추가 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;

    try {
      const res = await fetch(`/api/categories/id/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategoryName.trim(),
          slug: generateSlug(editingCategoryName.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? data.category : c))
        );
        setEditingCategoryId(null);
        setEditingCategoryName('');
      } else {
        alert('카테고리 수정에 실패했습니다.');
      }
    } catch {
      alert('카테고리 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까? 해당 카테고리의 글들은 카테고리 없음 상태가 됩니다.')) return;

    try {
      const res = await fetch(`/api/categories/id/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('카테고리 삭제에 실패했습니다.');
      }
    } catch {
      alert('카테고리 삭제 중 오류가 발생했습니다.');
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
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
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-white)] text-[var(--kuromi-black)] border-2 border-[var(--kuromi-lavender)]'
            }`}
          >
            <FolderOpen size={18} />
            카테고리 ({categories.length})
          </button>
        </div>

        {/* Content */}
        <div className="card-kuromi overflow-hidden">
          {activeTab === 'categories' ? (
            <div className="p-4">
              {/* Add new category */}
              <div className="mb-4">
                {isAddingCategory ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="새 카테고리 이름"
                      className="input-kuromi flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCategory();
                        if (e.key === 'Escape') {
                          setIsAddingCategory(false);
                          setNewCategoryName('');
                        }
                      }}
                    />
                    <button
                      onClick={handleAddCategory}
                      className="p-2 text-green-500 hover:bg-green-100 rounded transition-colors"
                      title="저장"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="p-2 text-[var(--text-muted)] hover:bg-[var(--kuromi-light-lavender)] rounded transition-colors"
                      title="취소"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--kuromi-purple)] hover:bg-[var(--kuromi-light-lavender)] rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    카테고리 추가
                  </button>
                )}
              </div>

              {/* Category list */}
              <div className="divide-y-2 divide-[var(--kuromi-lavender)]">
                {categories.length === 0 ? (
                  <div className="py-8 text-center text-[var(--text-muted)]">
                    카테고리가 없습니다.
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="py-3 flex items-center justify-between hover:bg-[var(--kuromi-cream)] transition-colors px-2 -mx-2 rounded"
                    >
                      {editingCategoryId === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="input-kuromi flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateCategory(category.id);
                              if (e.key === 'Escape') cancelEditCategory();
                            }}
                          />
                          <button
                            onClick={() => handleUpdateCategory(category.id)}
                            className="p-2 text-green-500 hover:bg-green-100 rounded transition-colors"
                            title="저장"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEditCategory}
                            className="p-2 text-[var(--text-muted)] hover:bg-[var(--kuromi-light-lavender)] rounded transition-colors"
                            title="취소"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="font-medium text-[var(--kuromi-dark-purple)]">
                              {category.name}
                            </span>
                            <span className="ml-2 text-xs text-[var(--text-muted)]">
                              /{category.slug}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditCategory(category)}
                              className="p-2 text-[var(--kuromi-purple)] hover:bg-[var(--kuromi-light-lavender)] rounded transition-colors"
                              title="수정"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="삭제"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'posts' ? (
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
