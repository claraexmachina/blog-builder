export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-sm text-center text-[var(--text-muted)]">
          © {currentYear} Blog
        </p>
      </div>
    </footer>
  );
}
