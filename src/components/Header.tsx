'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, FileText, PenSquare, LogIn, LogOut, User, Menu, X } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[var(--kuromi-cream)] border-b-4 border-[var(--kuromi-purple)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[var(--kuromi-dark-purple)] hover:text-[var(--kuromi-pink)] transition-colors"
          >
            <span className="pixel-star">★</span>
            <span>MINI ROOM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                isActive('/')
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
              style={{ boxShadow: isActive('/') ? '2px 2px 0 0 var(--kuromi-dark-purple)' : 'none' }}
            >
              HOME
            </Link>

            <Link
              href="/posts"
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                isActive('/posts')
                  ? 'bg-[var(--kuromi-purple)] text-white'
                  : 'text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
              }`}
              style={{ boxShadow: isActive('/posts') ? '2px 2px 0 0 var(--kuromi-dark-purple)' : 'none' }}
            >
              POSTS
            </Link>

            <div className="w-px h-4 bg-[var(--kuromi-lavender)] mx-2" />

            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-2 py-1 text-xs transition-all ${
                  pathname === `/category/${cat.slug}`
                    ? 'text-[var(--kuromi-pink)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--kuromi-purple)]'
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <div className="w-px h-4 bg-[var(--kuromi-lavender)] mx-2" />

            {isAuthenticated && (
              <Link
                href="/write"
                className={`px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive('/write')
                    ? 'bg-[var(--kuromi-pink)] text-white'
                    : 'text-[var(--kuromi-pink)] hover:bg-[var(--kuromi-soft-pink)]'
                }`}
                style={{ boxShadow: isActive('/write') ? '2px 2px 0 0 var(--kuromi-dark-purple)' : 'none' }}
              >
                WRITE
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="p-1.5 text-[var(--kuromi-purple)] hover:text-[var(--kuromi-pink)] transition-colors"
                >
                  <User size={14} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--kuromi-pink)] transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--kuromi-purple)] transition-colors"
              >
                LOGIN
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--kuromi-dark-purple)]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t-2 border-[var(--kuromi-lavender)]">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-xs font-bold ${
                  isActive('/') ? 'bg-[var(--kuromi-purple)] text-white' : 'text-[var(--kuromi-dark-purple)]'
                }`}
              >
                HOME
              </Link>

              <Link
                href="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-xs font-bold ${
                  isActive('/posts') ? 'bg-[var(--kuromi-purple)] text-white' : 'text-[var(--kuromi-dark-purple)]'
                }`}
              >
                POSTS
              </Link>

              <div className="pixel-divider my-1"></div>

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--kuromi-purple)]"
                >
                  └ {cat.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="pixel-divider my-1"></div>
                  <Link
                    href="/write"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-bold text-[var(--kuromi-pink)]"
                  >
                    WRITE
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs text-[var(--kuromi-dark-purple)]"
                  >
                    ADMIN
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-xs text-left text-[var(--text-muted)]"
                  >
                    LOGOUT
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <div className="pixel-divider my-1"></div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs text-[var(--text-muted)]"
                  >
                    LOGIN
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
