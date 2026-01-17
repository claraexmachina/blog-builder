'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[var(--text-muted)]">
          <span className="pixel-loading">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          홈으로
        </Link>

        <div className="widget-box">
          <div className="widget-title">LOGIN</div>
          <div className="widget-content">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔐</div>
              <p className="text-xs text-[var(--text-muted)]">
                블로그 관리자 로그인
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mini-widget bg-[var(--kuromi-soft-pink)] border-[var(--kuromi-pink)] text-xs text-[var(--kuromi-dark-purple)]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--kuromi-dark-purple)] mb-1">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사용자 이름"
                  className="pixel-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--kuromi-dark-purple)] mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="pixel-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="pixel-btn w-full"
              >
                {loading ? <span className="pixel-loading">...</span> : 'LOGIN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
