import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDocumentTitle } from './utils/useDocumentTitle';

// Public Pages (Placeholders)
import PublicLayout from './components/layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage.tsx';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import BlogDetailPage from './pages/public/BlogDetailPage';

// Admin Pages (Placeholders)
import AdminLayout from './components/layouts/AdminLayout.tsx';
import DashboardPage from './pages/admin/DashboardPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import BlogsPage from './pages/admin/BlogsPage';
import ProfilePage from './pages/admin/ProfilePage';
import SkillsPage from './pages/admin/SkillsPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-color text-sm text-text-muted animate-pulse">
        Loading...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AdminNotFound() {
  return (
    <div className="text-center py-16 space-y-4">
      <h2 className="font-display text-2xl font-semibold">Page not found</h2>
      <p className="text-sm text-text-muted">The admin page you are looking for does not exist.</p>
      <Link
        to="/admin"
        className="inline-block px-4 py-2 rounded-md bg-glass-bg hover:bg-border-color transition-colors text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

function NotFoundPage() {
  useDocumentTitle('Page Not Found — Wilson Rodrigues');
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="glass-panel p-12 text-center space-y-4 max-w-md">
        <p className="text-6xl font-display font-bold text-gradient-accent">404</p>
        <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
        <p className="text-sm text-text-muted">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-text-primary text-bg-color text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="blogs/:slug" element={<BlogDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes (all children are protected) */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
