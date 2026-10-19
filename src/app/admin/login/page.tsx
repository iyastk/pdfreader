'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff, User, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) { router.replace('/admin'); return null; }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace('/admin');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-900/50">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-400">SSLC Reader — Management Panel</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 shadow-2xl backdrop-blur-xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 py-3 pl-10 pr-12 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Hint */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-700/30 px-4 py-3">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Hint:</span>{' '}
                  Username: <code className="font-mono text-indigo-400">admin</code>{' '}
                  &nbsp;|&nbsp; Password: <code className="font-mono text-indigo-400">admin@2026</code>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-800/50 bg-red-900/30 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:shadow-indigo-900/70 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
