import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, loading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Wypełnij wszystkie pola.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Wystąpił błąd podczas logowania.');
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Wystąpił błąd podczas logowania przez Google.');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4" style={{ backgroundImage: 'radial-gradient(circle at center, #1b1b3a 0%, #05050a 100%)' }}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Witaj z powrotem!</h2>
          <p className="mt-2 text-sm text-zinc-400">Zaloguj się, aby połączyć się z Rcord</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {(localError || error) && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {localError || error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Adres Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-indigo-500 focus:bg-zinc-950"
              placeholder="np. jan.kowalski@gmail.com"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Hasło</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 pl-4 pr-12 py-3 text-sm text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-indigo-500 focus:bg-zinc-950"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 outline-none transition duration-200 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <span className="absolute left-0 right-0 h-px bg-zinc-800" />
          <span className="relative bg-[#11131a] px-3 text-xs uppercase tracking-wider text-zinc-500">LUB</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/40 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 focus:outline-none disabled:opacity-50"
        >
          <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Zaloguj się przez Google
        </button>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Nie masz jeszcze konta?{' '}
          <button
            onClick={onNavigateToRegister}
            className="font-medium text-indigo-400 transition hover:text-indigo-300 hover:underline"
          >
            Zarejestruj się
          </button>
        </div>
      </div>
    </div>
  );
};
