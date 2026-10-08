import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { LoadingState, ErrorState } from '../../components/admin/AdminStates';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
          setError(null);
        } else {
          setError('Unable to load dashboard stats.');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Unable to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [reloadKey]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setReloadKey(key => key + 1);
  };

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold mb-2">Overview</h2>
        <p className="text-text-muted">Welcome to your portfolio command center.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: stats.stats.projects.total, accent: 'bg-blue-500' },
            { label: 'Published Blogs', value: stats.stats.blogs.published, accent: 'bg-purple-500' },
            { label: 'Unread Messages', value: stats.stats.messages.unread, accent: 'bg-red-500' },
            { label: 'Media Assets', value: stats.stats.media.total, accent: 'bg-green-500' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                <div className={`w-2 h-2 rounded-full ${stat.accent}`}></div>
              </div>
              <p className="text-4xl font-display font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4 border-b border-border-color pb-4">Recent Messages</h3>
            <div className="space-y-4">
              {stats.recentMessages.length === 0 ? (
                <p className="text-sm text-text-muted">No messages yet.</p>
              ) : (
                stats.recentMessages.map((msg: any) => (
                  <div key={msg._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {msg.name} {!msg.read && <span className="w-2 h-2 rounded-full bg-accent-primary"></span>}
                      </p>
                      <p className="text-xs text-text-muted">{msg.subject}</p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4 border-b border-border-color pb-4">Recent Projects</h3>
            <div className="space-y-4">
              {stats.recentProjects.length === 0 ? (
                <p className="text-sm text-text-muted">No projects yet.</p>
              ) : (
                stats.recentProjects.map((proj: any) => (
                  <div key={proj._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{proj.title}</p>
                      <p className="text-xs text-text-muted">{proj.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${proj.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {proj.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
