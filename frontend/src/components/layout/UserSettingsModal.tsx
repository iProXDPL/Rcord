import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  X, Search, User, Shield, Palette, Volume2, 
  Keyboard, Terminal, Copy, Check, LogOut, Eye, EyeOff
} from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 
  | 'account' 
  | 'profile' 
  | 'privacy' 
  | 'appearance' 
  | 'audio' 
  | 'keybinds' 
  | 'developer';

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, logout, session } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state
  const [selectedTheme, setSelectedTheme] = useState(profile?.current_theme || 'dark');
  const [selectedAccent, setSelectedAccent] = useState(profile?.current_accent || 'purple');

  // Token visibility
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    // Apply theme class to HTML/Body
    const body = document.body;
    body.className = ''; // Reset classes
    if (themeName === 'light') body.classList.add('theme-light');
    if (themeName === 'cyberpunk') body.classList.add('theme-cyberpunk');
    // Save to localStorage or state if needed
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(session?.access_token || 'no-token');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Define sidebar menu items
  const menuItems = [
    { id: 'account', label: 'Moje konto', icon: User, group: 'Ustawienia Użytkownika' },
    { id: 'profile', label: 'Profil użytkownika', icon: User, group: 'Ustawienia Użytkownika' },
    { id: 'privacy', label: 'Prywatność', icon: Shield, group: 'Ustawienia Użytkownika' },
    { id: 'appearance', label: 'Wygląd i motywy', icon: Palette, group: 'Ustawienia Aplikacji' },
    { id: 'audio', label: 'Głos i wideo', icon: Volume2, group: 'Ustawienia Aplikacji' },
    { id: 'keybinds', label: 'Skróty klawiszowe', icon: Keyboard, group: 'Ustawienia Aplikacji' },
    { id: 'developer', label: 'Zaawansowane / Opcje bota', icon: Terminal, group: 'Ustawienia Aplikacji' },
  ];

  // Filter items by search query
  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items
  const groupedItems = filteredMenuItems.reduce((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
    return groups;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="fixed inset-0 z-50 flex bg-[var(--bg-primary)] text-zinc-300 select-none animate-in fade-in zoom-in-95 duration-150">
      
      {/* 1. SIDEBAR COLUMN */}
      <div className="w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col px-6 py-10 shrink-0">
        
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Szukaj ustawień..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-primary)] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 border border-[var(--border-color)] outline-none focus:border-[var(--accent)] transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-5 scrollbar-none">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
                {groupName}
              </h4>
              <div className="space-y-[2px]">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as SettingsSection)}
                      className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-sm font-semibold rounded-lg transition ${
                        isActive 
                          ? 'bg-[var(--accent)] text-white' 
                          : 'hover:bg-[var(--bg-active)]/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout at bottom */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-2.5 py-2.5 mt-4 text-sm font-bold rounded-lg text-red-500 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} />
          <span>Wyloguj się</span>
        </button>
      </div>

      {/* 2. MAIN CONTENT VIEW */}
      <div className="flex-1 flex flex-col py-10 px-10 relative overflow-hidden bg-[var(--bg-primary)]">
        
        {/* ESC Button - Top Right */}
        <div className="absolute right-12 top-10 flex flex-col items-center gap-1">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-[var(--bg-secondary)] text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg cursor-pointer"
            title="Zamknij (ESC)"
          >
            <X size={18} />
          </button>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">ESC</span>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="max-w-2xl w-full mx-auto h-full overflow-y-auto pr-4 pb-12 select-text">
          
          {/* SECTION: MY ACCOUNT */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Moje konto
              </h2>

              {/* Profile card preview */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-xl">
                {/* Banner */}
                <div 
                  className="h-28 bg-[var(--accent)] relative"
                  style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                />
                <div className="p-6 relative flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Avatar positioning */}
                  <div className="relative -mt-16 sm:-mt-20 shrink-0">
                    <div className="h-24 w-24 rounded-full border-4 border-[var(--bg-secondary)] bg-zinc-800 overflow-hidden shadow-lg">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Awatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white uppercase bg-zinc-700 font-heading">
                          {profile?.username[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                      {profile?.username.split('#')[0]}
                      <span className="text-zinc-500 font-normal">#{profile?.username.split('#')[1] || '0000'}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">ID konta: {profile?.id}</p>
                    <p className="text-xs text-zinc-400">Wiek zweryfikowany: {profile?.birthdate || 'Brak danych'}</p>
                  </div>
                </div>
              </div>

              {/* Stats & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Punkty w grach</span>
                  <p className="text-2xl font-extrabold text-amber-400 font-heading mt-1">{profile?.points ?? 0} pkt</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Uprawnienia</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {profile?.is_admin ? 'Główny Administrator (Admin)' : 'Użytkownik (Zweryfikowany)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: USER PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Profil użytkownika
              </h2>
              <p className="text-xs text-zinc-500">Dostosuj to, jak widzą Cię inni gracze na serwerach</p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Adres url awataru (GIF / Zdjęcie)</label>
                  <input
                    type="text"
                    defaultValue={profile?.avatar_url || ''}
                    placeholder="Wklej link do grafiki (np. imgur)..."
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Adres url tła profilu (Banner)</label>
                  <input
                    type="text"
                    defaultValue={profile?.banner_url || ''}
                    placeholder="Wklej link do grafiki bannera..."
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <button className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-2.5 text-sm font-semibold text-white transition">
                  Zapisz zmiany profilu
                </button>
              </div>
            </div>
          )}

          {/* SECTION: PRIVACY */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Prywatność i Bezpieczeństwo
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div>
                    <h4 className="font-bold text-white text-sm">Zezwalaj na wiadomości prywatne (DM)</h4>
                    <p className="text-xs text-zinc-500">Pozwól użytkownikom z Twoich serwerów pisać do Ciebie prywatnie</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[var(--accent)]" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div>
                    <h4 className="font-bold text-white text-sm">Filtruj NSFW i wrażliwe załączniki</h4>
                    <p className="text-xs text-zinc-500">Automatycznie filtruj drastyczne lub nieodpowiednie obrazy</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[var(--accent)]" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Wygląd i motywy
              </h2>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Wybierz motyw</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', name: 'Obsydian (Dark)', desc: 'Ciemna, elegancka noc' },
                    { id: 'light', name: 'Jasny (Light)', desc: 'Klasyczny przejrzysty motyw' },
                    { id: 'cyberpunk', name: 'Cyberpunk (Neon)', desc: 'Neonowy róż i cyjan' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${
                        selectedTheme === theme.id 
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' 
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-sm text-white">{theme.name}</span>
                      <span className="text-xs text-zinc-500 mt-2">{theme.desc}</span>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mt-8">Kolor akcentu</h3>
                <div className="flex gap-3">
                  {['purple', 'blue', 'green', 'rose'].map((accent) => (
                    <button
                      key={accent}
                      onClick={() => setSelectedAccent(accent)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        selectedAccent === accent ? 'border-white scale-110' : 'border-transparent'
                      } ${
                        accent === 'purple' ? 'bg-[#7c5cff]' : 
                        accent === 'blue' ? 'bg-blue-500' : 
                        accent === 'green' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUDIO */}
          {activeSection === 'audio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Głos i wideo
              </h2>
              <p className="text-xs text-zinc-500">Zarządzaj urządzeniami audio, redukcją szumów oraz aktywacją</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Urządzenie Wejściowe (Mikrofon)</label>
                    <select className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-white outline-none">
                      <option>Domyślny mikrofon systemowy</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Urządzenie Wyjściowe (Słuchawki)</label>
                    <select className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-white outline-none">
                      <option>Domyślne słuchawki systemowe</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Redukcja Szumów RNNoise (WASM)</h4>
                      <p className="text-xs text-zinc-500">Filtruje szum tła, klimatyzację oraz kliknięcia klawiatury</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-[var(--accent)]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: KEYBINDS */}
          {activeSection === 'keybinds' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Skróty klawiszowe
              </h2>
              <p className="text-xs text-zinc-500">Skonfiguruj skróty globalne do obsługi komunikatora podczas gry</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div>
                    <h4 className="font-bold text-white text-sm">Wyciszenie Mikrofonu (Mute Toggle)</h4>
                    <p className="text-xs text-zinc-500">Domyślny: `Ctrl + Shift + M`</p>
                  </div>
                  <button className="rounded bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 border border-zinc-700 text-white font-semibold">
                    Zmień skrót
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-[var(--bg-secondary)]">
                  <div>
                    <h4 className="font-bold text-white text-sm">Wyciszenie Słuchawek (Deafen Toggle)</h4>
                    <p className="text-xs text-zinc-500">Domyślny: `Ctrl + Shift + D`</p>
                  </div>
                  <button className="rounded bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 border border-zinc-700 text-white font-semibold">
                    Zmień skrót
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DEVELOPER */}
          {activeSection === 'developer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                Opcje Zaawansowane / Developer
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Token dostępu JWT (Auth Token)</h4>
                      <p className="text-xs text-zinc-500">Użyj tego tokenu do tworzenia botów lub odpytywania API Rcord</p>
                    </div>
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showToken ? 'Ukryj' : 'Pokaż'}</span>
                    </button>
                  </div>

                  {showToken && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="password"
                        readOnly
                        value={session?.access_token || 'brak sesji'}
                        className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-mono overflow-ellipsis outline-none"
                      />
                      <button
                        onClick={handleCopyToken}
                        className="rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-xs text-white font-bold px-3 py-1.5 flex items-center gap-1"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
