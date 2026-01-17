export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-[var(--kuromi-purple)] bg-[var(--kuromi-cream)]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">
            <span className="pixel-star">★</span> © {currentYear} claraexmachina <span className="pixel-star">★</span>
          </p>
          <p className="text-[10px] text-[var(--kuromi-lavender)] mt-1">
            sunkissed by God ✧
          </p>
        </div>
      </div>
    </footer>
  );
}
