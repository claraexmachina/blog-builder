'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownEditor from '@/components/MarkdownEditor';
import {
  Save,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  X,
  FileText,
  Trash2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  categoryId: string | null;
  updatedAt: string;
}

export default function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const draftId = searchParams.get('draft');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Check authentication
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

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch drafts
  const fetchDrafts = useCallback(() => {
    fetch('/api/drafts')
      .then((res) => res.json())
      .then((data) => setDrafts(data.drafts || []))
      .catch(() => setDrafts([]));
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Load post for editing
  useEffect(() => {
    if (editId) {
      fetch(`/api/posts/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.post) {
            setTitle(data.post.title);
            setContent(data.post.content);
            setThumbnail(data.post.thumbnail);
            setCategoryId(data.post.categoryId || '');
          }
        })
        .catch(console.error);
    }
  }, [editId]);

  // Load draft
  useEffect(() => {
    if (draftId) {
      fetch(`/api/drafts/${draftId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.draft) {
            setTitle(data.draft.title);
            setContent(data.draft.content);
            setThumbnail(data.draft.thumbnail);
            setCategoryId(data.draft.categoryId || '');
            setCurrentDraftId(draftId);
          }
        })
        .catch(console.error);
    }
  }, [draftId]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      setThumbnail(url);
    } catch {
      alert('썸네일 업로드에 실패했습니다.');
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts';
      const method = currentDraftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || '제목 없음',
          content,
          thumbnail,
          categoryId: categoryId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!currentDraftId) {
          setCurrentDraftId(data.draft.id);
        }
        fetchDrafts();
        alert('임시저장되었습니다.');
      } else {
        alert('임시저장에 실패했습니다.');
      }
    } catch {
      alert('임시저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setPublishing(true);
    try {
      const excerpt = content
        .replace(/[#*`>\-\[\]()!]/g, '')
        .substring(0, 150)
        .trim();

      if (editId) {
        // Update existing post
        const res = await fetch(`/api/posts/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            excerpt,
            thumbnail,
            categoryId: categoryId || null,
            published: true,
          }),
        });

        if (res.ok) {
          // Delete draft if exists
          if (currentDraftId) {
            await fetch(`/api/drafts/${currentDraftId}`, { method: 'DELETE' });
          }
          router.push(`/posts/${editId}`);
        } else {
          alert('수정에 실패했습니다.');
        }
      } else {
        // Create new post
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            excerpt,
            thumbnail,
            categoryId: categoryId || null,
            published: true,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Delete draft if exists
          if (currentDraftId) {
            await fetch(`/api/drafts/${currentDraftId}`, { method: 'DELETE' });
          }
          router.push(`/posts/${data.post.id}`);
        } else {
          alert('게시에 실패했습니다.');
        }
      }
    } catch {
      alert('게시 중 오류가 발생했습니다.');
    } finally {
      setPublishing(false);
    }
  };

  const handleLoadDraft = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setThumbnail(draft.thumbnail);
    setCategoryId(draft.categoryId || '');
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
  };

  const handleDeleteDraft = async (draftIdToDelete: string) => {
    if (!confirm('이 임시저장을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/drafts/${draftIdToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDrafts();
        if (currentDraftId === draftIdToDelete) {
          setCurrentDraftId(null);
        }
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
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] transition-colors"
          >
            <ArrowLeft size={20} />
            취소
          </Link>

          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className="btn-retro-secondary flex items-center gap-2"
              >
                <FileText size={18} />
                임시저장 ({drafts.length})
              </button>
            )}
          </div>
        </div>

        {/* Drafts panel */}
        {showDrafts && (
          <div className="card-kuromi p-4 mb-6">
            <h3 className="font-bold text-[var(--kuromi-dark-purple)] mb-4">
              임시저장 목록
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-3 bg-[var(--kuromi-cream)] rounded-lg"
                >
                  <button
                    onClick={() => handleLoadDraft(draft)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium text-[var(--kuromi-black)]">
                      {draft.title || '제목 없음'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(draft.updatedAt).toLocaleString('ko-KR')}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card-kuromi p-6">
          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
              대표 이미지
            </label>
            {thumbnail ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" />
                <button
                  onClick={() => setThumbnail(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--kuromi-lavender)] rounded-lg cursor-pointer hover:bg-[var(--kuromi-light-lavender)] transition-colors">
                <ImageIcon size={32} className="text-[var(--kuromi-lavender)] mb-2" />
                <span className="text-sm text-[var(--text-muted)]">
                  클릭하여 이미지 업로드
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="input-kuromi w-full text-lg"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
              카테고리
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-kuromi w-full"
            >
              <option value="">카테고리 없음</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
              내용
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="btn-retro-secondary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? '저장 중...' : '임시저장'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-retro flex items-center gap-2"
            >
              <Send size={18} />
              {publishing ? '게시 중...' : editId ? '수정하기' : '게시하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
