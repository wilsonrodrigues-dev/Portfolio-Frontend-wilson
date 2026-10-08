import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#blogs', label: 'Blogs' },
  { href: '/#contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  // A full-page load with a section hash (e.g. /#about clicked from a detail
  // page) happens before the SPA has rendered the target, so the browser's own
  // fragment scroll finds nothing. Scroll once after mount instead.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed w-full top-0 z-50 glass-panel border-x-0 border-t-0 rounded-none h-16 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <span className="font-display font-bold text-xl tracking-tight text-gradient">WR.</span>
          <nav className="hidden md:flex gap-6 text-sm font-medium" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } md:hidden absolute top-16 left-0 right-0 flex-col gap-1 px-6 py-4 border-b border-border-color bg-bg-color/95 backdrop-blur-md`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-bg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <footer className="py-8 border-t border-border-color mt-20 text-center text-text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} Wilson Rodrigues. All rights reserved.</p>
      </footer>
    </div>
  );
}
