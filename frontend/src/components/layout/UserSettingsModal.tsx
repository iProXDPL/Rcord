import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  X, Search, User, Shield, Palette, Volume2, 
  Keyboard, Terminal, Copy, Check, LogOut, Eye, EyeOff, Upload, FileImage
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

  // File upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setStatusMessage(null);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setStatusMessage(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setUploading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      let finalAvatarUrl = profile.avatar_url;
      let finalBannerUrl = profile.banner_url;

      // 1. Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const filePath = `${profile.id}/avatar_${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;
      }

      // 2. Upload banner if selected
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop() || 'png';
        const filePath = `${profile.id}/banner_${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('banners')
          .upload(filePath, bannerFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(filePath);
        finalBannerUrl = publicUrl;
      }

      // 3. Save to database profiles table
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({
          avatar_url: finalAvatarUrl,
          banner_url: finalBannerUrl
        })
        .eq('id', profile.id);

      if (dbErr) throw dbErr;

      // 4. Update state in store
      useAuthStore.getState().setProfile({
        ...profile,
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl
      });

      setStatusMessage('Pomyślnie zaktualizowano Twój profil!');
      setStatusType('success');
      setAvatarFile(null);
      setBannerFile(null);
    } catch (err: any) {
      setStatusMessage(err.message || 'Wystąpił błąd podczas zapisywania profilu.');
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    const body = document.body;
    body.className = ''; // Reset classes
    if (themeName === 'light') body.classList.add('theme-light');
    if (themeName === 'cyberpunk') body.classList.add('theme-cyberpunk');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Dialog container */}
      <div className="relative w-full max-w-4xl h-[80vh] min-h-[500px] flex rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 text-zinc-300">
        
        {/* 1. SIDEBAR COLUMN */}
        <div className="w-[240px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col px-4 py-8 shrink-0">
          
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
                        onClick={() => {
                          setActiveSection(item.id as SettingsSection);
                          setStatusMessage(null);
                        }}
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
        <div className="flex-1 flex flex-col py-8 px-8 relative overflow-hidden bg-[var(--bg-primary)]">
          
          {/* ESC Button - Top Right */}
          <div className="absolute right-8 top-8 flex flex-col items-center gap-1 z-20">
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
          <div className="max-w-2xl w-full mx-auto h-full overflow-y-auto pr-2 pb-12 select-text scrollbar-thin">
            
            {/* SECTION: MY ACCOUNT */}
            {activeSection === 'account' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h2 className="text-2xl font-extrabold text-white font-heading tracking-wide border-b border-[var(--border-color)] pb-3">
                  Profil użytkownika
                </h2>
                <p className="text-xs text-zinc-500">Wgraj własne pliki graficzne, aby spersonalizować swój profil w aplikacji</p>

                {/* Status Message */}
                {statusMessage && (
                  <div className={`p-3.5 rounded-lg text-sm font-semibold flex items-center gap-2 border ${
                    statusType === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {statusType === 'success' ? <Check size={16} /> : <X size={16} />}
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Local Avatar File Selector */}
                  <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                      <FileImage size={14} className="text-[var(--accent)]" />
                      Zdjęcie Profilowe
                    </span>
                    <div className="h-24 w-24 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 mb-4 relative group shadow-inner">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold uppercase text-zinc-500">
                          {profile?.username[0]}
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow shadow-indigo-600/30">
                      <Upload size={14} />
                      Wgraj Awatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-zinc-500 mt-2">Maksymalny rozmiar: 5MB</span>
                  </div>

                  {/* Local Banner File Selector */}
                  <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                      <FileImage size={14} className="text-[var(--accent)]" />
                      Baner Profilowy
                    </span>
                    <div className="w-full h-24 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 mb-4 relative group shadow-inner">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : profile?.banner_url ? (
                        <img src={profile.banner_url} alt="Banner" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 uppercase font-bold">
                          Brak baneru
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow shadow-indigo-600/30">
                      <Upload size={14} />
                      Wgraj Baner
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-zinc-500 mt-2">Maksymalny rozmiar: 10MB</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={uploading || (!avatarFile && !bannerFile)}
                    className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? 'Zapisywanie...' : 'Zapisz zmiany profilu'}
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: PRIVACY */}
            {activeSection === 'privacy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
    </div>
  );
};
