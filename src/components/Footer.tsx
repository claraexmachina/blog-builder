import { Twitter, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-light)] bg-[var(--color-surface)]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/claraexmachina"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-alt)] border border-[var(--border-light)] hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm)] transition-all duration-200"
              aria-label="Twitter (X)"
            >
              <Twitter className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-200" />
            </a>
            <a
              href="https://github.com/claraexmachina"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-alt)] border border-[var(--border-light)] hover:border-[var(--text-primary)] hover:bg-[var(--text-primary)] transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-200" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)]">
              <span className="pixel-star">★</span> © {currentYear} claraexmachina <span className="pixel-star">★</span>
            </p>
            <p className="text-[10px] text-[var(--border-medium)] mt-1">
              sunkissed by God ✧
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
