import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { LayoutDashboard, FolderKanban, FileText, User, LogOut, Menu, X, Zap } from 'lucide-react';

const SECTION_TITLES: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/projects': 'Projects',
  '/admin/blogs': 'Blogs',
  '/admin/skills': 'Skills',
  '/admin/profile': 'Profile',
};

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/admin/blogs', label: 'Blogs', Icon: FileText },
  { to: '/admin/skills', label: 'Skills', Icon: Zap },
  { to: '/admin/profile', label: 'Profile', Icon: User },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerTitle = SECTION_TITLES[pathname] ?? 'Admin';
  useDocumentTitle(`${headerTitle} — OmniCMS`);

  const isCurrent = (to: string) => (to === '/admin' ? pathname === '/admin' : pathname === to);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-color">
      {/* Mobile backdrop (only while the off-canvas sidebar is open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed off-canvas on mobile, static column from md up */}
      <aside
        id="admin-sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-out fixed md:static inset-y-0 left-0 z-40 w-64 max-md:bg-bg-color glass-panel border-y-0 border-l-0 rounded-none h-full flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-color">
          <span className="font-display font-bold text-lg text-gradient-accent">OmniCMS</span>
          <button
            type="button"
            className="md:hidden p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2" aria-label="Admin">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isCurrent(to) ? 'page' : undefined}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isCurrent(to)
                  ? 'bg-glass-bg text-text-primary'
                  : 'text-text-secondary hover:bg-glass-bg hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border-color">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'W'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-glass-bg hover:bg-border-color transition-colors text-sm font-medium text-red-400"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-bg-color-light">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border-color glass-panel border-x-0 border-t-0 rounded-none sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-display font-semibold text-lg">{headerTitle}</h1>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
