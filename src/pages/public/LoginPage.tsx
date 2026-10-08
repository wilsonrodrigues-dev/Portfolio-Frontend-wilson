import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  useDocumentTitle('Admin Login — OmniCMS');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        login(res.data.data.user);
        window.location.href = '/admin'; // Force full reload into admin context
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Admin Login</h1>
          <p className="text-text-muted text-sm">Access the OmniCMS Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input 
              id="login-email"
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-color border border-border-color rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="admin@wilsonrodrigues.dev"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input 
              id="login-password"
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg-color border border-border-color rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-text-primary text-bg-color font-bold rounded-md py-3 hover:bg-text-secondary transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
