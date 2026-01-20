'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import HorrorModeToggle from './HorrorModeToggle';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isHorrorMode } = useTheme();

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--border-light)]"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: isHorrorMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Theme Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xl">
              🌱
            </span>
            <HorrorModeToggle />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 text-xs font-medium tracking-wide transition-all rounded-md ${
                isActive('/')
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              HOME
            </Link>

            <Link
              href="/posts"
              className={`px-4 py-2 text-xs font-medium tracking-wide transition-all rounded-md ${
                isActive('/posts')
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              POSTS
            </Link>

            <div className="w-px h-4 bg-[var(--border-light)] mx-3" />

            {isAuthenticated && (
              <Link
                href="/write"
                className={`px-4 py-2 text-xs font-medium tracking-wide transition-all rounded-md ${
                  isActive('/write')
                    ? 'bg-[var(--accent-warm)] text-white'
                    : 'text-[var(--accent-warm)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                WRITE
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--accent-soft)]"
                >
                  <User size={16} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--accent-soft)]"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                LOGIN
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--text-primary)] rounded-md hover:bg-[var(--accent-soft)]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-light)]">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive('/') ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                HOME
              </Link>

              <Link
                href="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive('/posts') ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                POSTS
              </Link>

              {isAuthenticated && (
                <>
                  <div className="h-px bg-[var(--border-light)] my-2"></div>
                  <Link
                    href="/write"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-[var(--accent-warm)] rounded-lg hover:bg-[var(--accent-soft)]"
                  >
                    WRITE
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--accent-soft)]"
                  >
                    ADMIN
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-sm font-medium text-left text-[var(--text-muted)] rounded-lg hover:bg-[var(--accent-soft)]"
                  >
                    LOGOUT
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <div className="h-px bg-[var(--border-light)] my-2"></div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-[var(--text-muted)] rounded-lg hover:bg-[var(--accent-soft)]"
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
