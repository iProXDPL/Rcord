import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculateAge = (bdate: string) => {
    if (!bdate) return 0;
    const today = new Date();
    const birthDate = new Date(bdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !username || !birthdate) {
      setLocalError('Wypełnij wszystkie pola.');
      return;
    }

    if (username.includes('#')) {
      setLocalError('Nazwa użytkownika nie może zawierać znaku #.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    try {
      await register(email, password, username, birthdate);
      setSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Wystąpił błąd podczas rejestracji.');
    }
  };

  if (success) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4" style={{ backgroundImage: 'radial-gradient(circle at center, #1b1b3a 0%, #05050a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-heading">Rejestracja pomyślna!</h2>
          <p className="mt-4 text-sm text-zinc-300">
            Konto zostało utworzone. Wysłaliśmy link aktywacyjny na podany adres email (jeśli włączona jest weryfikacja) lub możesz się teraz zalogować.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="mt-8 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 outline-none transition duration-200 hover:bg-indigo-500 active:bg-indigo-700"
          >
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(birthdate);
  const isMinor = birthdate ? age < 18 : false;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4" style={{ backgroundImage: 'radial-gradient(circle at center, #1b1b3a 0%, #05050a 100%)' }}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-heading">Stwórz konto</h2>
          <p className="mt-2 text-sm text-zinc-400">Dołącz do Rcord już dziś i zacznij grać ze znajomymi</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {(localError || error) && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {localError || error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nazwa użytkownika</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-indigo-500 focus:bg-zinc-950"
              placeholder="np. ipro (system wygeneruje tag, np. ipro#1234)"
              required
            />
          </div>

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
                placeholder="Co najmniej 6 znaków"
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

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Data Urodzenia</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none transition duration-200 focus:border-indigo-500 focus:bg-zinc-950"
              required
            />
            {birthdate && (
              <p className={`text-xs mt-1 ${isMinor ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isMinor 
                  ? 'Masz poniżej 18 lat. Kanały oznaczone jako NSFW będą dla Ciebie zablokowane.' 
                  : 'Wiek zweryfikowany. Otrzymasz pełny dostęp do kanałów NSFW.'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 mt-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 outline-none transition duration-200 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Masz już konto?{' '}
          <button
            onClick={onNavigateToLogin}
            className="font-medium text-indigo-400 transition hover:text-indigo-300 hover:underline"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  );
};
