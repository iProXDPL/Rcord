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
  const { login, loading, error } = useAuthStore();
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
