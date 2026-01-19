export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-light)] bg-[var(--color-surface)]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">
            <span className="pixel-star">★</span> © {currentYear} claraexmachina <span className="pixel-star">★</span>
          </p>
          <p className="text-[10px] text-[var(--border-medium)] mt-1">
            sunkissed by God ✧
          </p>
        </div>
      </div>
    </footer>
  );
}
