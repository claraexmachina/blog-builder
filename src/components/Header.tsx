'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, FileText, PenSquare, LogIn, LogOut, User, Menu, X, ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--card-border)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold text-[var(--kuromi-dark-purple)] hover:text-[var(--kuromi-purple)] transition-colors"
          >
            Blog
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-[var(--kuromi-purple)] bg-[var(--kuromi-cream)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)]'
              }`}
            >
              홈
            </Link>

            <Link
              href="/posts"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/posts')
                  ? 'text-[var(--kuromi-purple)] bg-[var(--kuromi-cream)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)]'
              }`}
            >
              전체 글
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                onBlur={() => setTimeout(() => setCategoryMenuOpen(false), 150)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/category')
                    ? 'text-[var(--kuromi-purple)] bg-[var(--kuromi-cream)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)]'
                }`}
              >
                카테고리
                <ChevronDown size={14} className={`transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[var(--card-border)] rounded-lg shadow-soft-lg overflow-hidden min-w-[140px]">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-2.5 text-sm text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && (
              <Link
                href="/write"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/write')
                    ? 'text-[var(--kuromi-purple)] bg-[var(--kuromi-cream)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)]'
                }`}
              >
                글쓰기
              </Link>
            )}

            <div className="w-px h-5 bg-[var(--card-border)] mx-2" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)] transition-colors"
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--kuromi-pink-accent)] hover:bg-[var(--kuromi-cream)] transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)] transition-colors"
              >
                로그인
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--kuromi-black)] hover:bg-[var(--kuromi-cream)] rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--card-border)]">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-[var(--kuromi-cream)] text-[var(--kuromi-purple)]' : 'text-[var(--kuromi-black)]'
                }`}
              >
                홈
              </Link>

              <Link
                href="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive('/posts') ? 'bg-[var(--kuromi-cream)] text-[var(--kuromi-purple)]' : 'text-[var(--kuromi-black)]'
                }`}
              >
                전체 글
              </Link>

              <div className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                카테고리
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2 rounded-lg text-sm text-[var(--kuromi-black)]"
                >
                  {cat.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="h-px bg-[var(--card-border)] my-2" />
                  <Link
                    href="/write"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                      isActive('/write') ? 'bg-[var(--kuromi-cream)] text-[var(--kuromi-purple)]' : 'text-[var(--kuromi-black)]'
                    }`}
                  >
                    글쓰기
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--kuromi-black)]"
                  >
                    관리
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-left text-[var(--kuromi-pink-accent)]"
                  >
                    로그아웃
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <div className="h-px bg-[var(--card-border)] my-2" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--kuromi-black)]"
                  >
                    로그인
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
