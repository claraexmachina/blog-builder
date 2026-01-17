export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-[var(--kuromi-black)] bg-[var(--kuromi-dark-purple)] text-[var(--kuromi-light-lavender)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Decorative stars */}
          <div className="flex items-center gap-2 text-2xl">
            <span className="text-[var(--kuromi-pink)]">★</span>
            <span className="text-[var(--kuromi-lavender)]">☆</span>
            <span className="text-[var(--kuromi-pink)]">★</span>
            <span className="text-[var(--kuromi-lavender)]">☆</span>
            <span className="text-[var(--kuromi-pink)]">★</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-center">
            © {currentYear} My Blog. Made with ♡
          </p>

          {/* Retro decoration */}
          <div className="flex items-center gap-4 text-xs opacity-60">
            <span className="font-mono">&lt;/&gt;</span>
            <span>GAME OVER? NO WAY!</span>
            <span className="font-mono">&lt;/&gt;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
