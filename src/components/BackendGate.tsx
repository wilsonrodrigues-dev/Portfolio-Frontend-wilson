import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface BackendGateProps {
  children: React.ReactNode;
}

type WakeStatus = 'waking' | 'ready' | 'error';

/**
 * Shows a "Waking up server..." splash screen while the Render backend is
 * starting (cold-start can take ~30-60 s on the free tier). Polls the health
 * endpoint until it responds, then fades out and renders children.
 */
export default function BackendGate({ children }: BackendGateProps) {
  const [status, setStatus] = useState<WakeStatus>('waking');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 2 s = 60 s max wait
    let timer: ReturnType<typeof setTimeout>;

    async function pingHealth() {
      try {
        const res = await api.get('/health', { timeout: 8000 });
        if (res.status === 200) {
          setStatus('ready');
          return;
        }
      } catch {
        // Still waking
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        return;
      }
      timer = setTimeout(pingHealth, 2000);
    }

    pingHealth();
    return () => clearTimeout(timer);
  }, []);

  // Elapsed seconds counter
  useEffect(() => {
    if (status !== 'waking') return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Animated dots
  useEffect(() => {
    if (status !== 'waking') return;
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'ready') return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-color gap-6"
      >
        {/* Animated logo / glow orb */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 bg-accent-primary rounded-full filter blur-[60px] opacity-30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl glass-panel border border-white/10 flex items-center justify-center shadow-2xl">
            <span className="font-display font-bold text-2xl text-gradient-accent">WR</span>
          </div>
        </div>

        {status === 'waking' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
          >
            <p className="text-base font-medium text-text-primary">
              Waking up server{dots}
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              The backend is starting up on Render's free tier.
              <br />
              This usually takes 20–50 seconds.
            </p>

            {/* Progress bar */}
            <div className="w-56 h-1 bg-border-color rounded-full overflow-hidden mx-auto mt-4">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min((elapsedSeconds / 50) * 100, 95)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-text-muted">{elapsedSeconds}s elapsed</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <p className="text-base font-medium text-red-400">Could not reach the server</p>
            <p className="text-sm text-text-muted max-w-xs">
              The backend may be down or taking longer than usual to start.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2.5 rounded-full bg-text-primary text-bg-color text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
