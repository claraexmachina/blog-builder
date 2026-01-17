'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ArrowLeft, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push('/');
        }
        setCheckingAuth(false);
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--kuromi-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 loading-kuromi">★</div>
          <p className="text-[var(--kuromi-dark-purple)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--kuromi-light-lavender)] via-[var(--kuromi-cream)] to-[var(--kuromi-lavender)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          홈으로 돌아가기
        </Link>

        {/* Login Card */}
        <div className="pixel-border bg-[var(--kuromi-white)] p-8 rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">★</div>
            <h1 className="text-2xl font-bold text-[var(--kuromi-dark-purple)]">
              로그인
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              블로그 관리를 위해 로그인하세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-300 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
                <User size={16} className="inline mr-2" />
                사용자 이름
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자 이름을 입력하세요"
                className="input-kuromi w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--kuromi-dark-purple)] mb-2">
                <Lock size={16} className="inline mr-2" />
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="input-kuromi w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-retro w-full flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Footer decoration */}
          <div className="flex justify-center gap-2 mt-6">
            <span className="text-[var(--kuromi-lavender)]">☆</span>
            <span className="text-[var(--kuromi-pink)]">★</span>
            <span className="text-[var(--kuromi-lavender)]">☆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
