'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, BookOpen, PenSquare, LogIn, LogOut, User, Menu, X } from 'lucide-react';

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
    // Check authentication
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));

    // Fetch categories
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
    <header className="sticky top-0 z-50 bg-[var(--kuromi-cream)] border-b-4 border-[var(--kuromi-black)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-[var(--kuromi-dark-purple)] hover:text-[var(--kuromi-purple)] transition-colors"
          >
            <span className="text-2xl">★</span>
            <span className="hidden sm:inline">My Blog</span>
            <span className="text-2xl">★</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
            >
              <Home size={18} />
              홈
            </Link>

            <Link
              href="/posts"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/posts')
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
            >
              <BookOpen size={18} />
              전체 글
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname.startsWith('/category')
                    ? 'bg-[var(--kuromi-purple)] text-white'
                    : 'text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)]'
                }`}
              >
                카테고리
                <span className={`transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {categoryMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-[var(--kuromi-white)] border-2 border-[var(--kuromi-black)] rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setCategoryMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-[var(--kuromi-light-lavender)] transition-colors"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/write')
                    ? 'bg-[var(--kuromi-purple)] text-white'
                    : 'text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)]'
                }`}
              >
                <PenSquare size={18} />
                글쓰기
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-black)] hover:bg-[var(--kuromi-pink)] hover:text-white transition-all"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)] transition-all"
              >
                <LogIn size={18} />
                로그인
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)] transition-all"
              >
                <User size={18} />
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--kuromi-black)] hover:bg-[var(--kuromi-light-lavender)] rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-[var(--kuromi-lavender)]">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isActive('/')
                    ? 'bg-[var(--kuromi-purple)] text-white'
                    : 'text-[var(--kuromi-black)]'
                }`}
              >
                <Home size={18} />
                홈
              </Link>

              <Link
                href="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isActive('/posts')
                    ? 'bg-[var(--kuromi-purple)] text-white'
                    : 'text-[var(--kuromi-black)]'
                }`}
              >
                <BookOpen size={18} />
                전체 글
              </Link>

              <div className="px-4 py-2 text-sm font-bold text-[var(--kuromi-dark-purple)]">
                카테고리
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-8 py-2 rounded-lg font-medium text-[var(--kuromi-black)]"
                >
                  {cat.name}
                </Link>
              ))}

              {isAuthenticated && (
                <Link
                  href="/write"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isActive('/write')
                      ? 'bg-[var(--kuromi-purple)] text-white'
                      : 'text-[var(--kuromi-black)]'
                  }`}
                >
                  <PenSquare size={18} />
                  글쓰기
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-black)]"
                  >
                    <User size={18} />
                    관리
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-pink)]"
                  >
                    <LogOut size={18} />
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[var(--kuromi-black)]"
                >
                  <LogIn size={18} />
                  로그인
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
