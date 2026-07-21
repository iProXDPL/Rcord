import React, { useState, useEffect } from 'react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { ActiveView } from './ActiveView';
import { MemberSidebar } from './MemberSidebar';
import { useServerStore } from '../../stores/serverStore';
import { useChannelStore } from '../../stores/channelStore';
import { useAuthStore } from '../../stores/authStore';
import { X, Globe, Lock, Shield } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { fetchServers, createServer } = useServerStore();
  const { createChannel } = useChannelStore();
  const { logout, profile } = useAuthStore();

  // Collapsible Sidebars State
  const [isChannelSidebarCollapsed, setIsChannelSidebarCollapsed] = useState(false);
  const [isMemberSidebarCollapsed, setIsMemberSidebarCollapsed] = useState(false);

  // Modals state
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  // Form states
  const [newServerName, setNewServerName] = useState('');
  const [newServerDesc, setNewServerDesc] = useState('');
  const [newServerPublic, setNewServerPublic] = useState(false);

  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
  const [newChannelTemp, setNewChannelTemp] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch servers at startup
  useEffect(() => {
    fetchServers();
  }, []);

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    try {
      await createServer(newServerName, newServerDesc, null, newServerPublic);
      setIsAddServerOpen(false);
      setNewServerName('');
      setNewServerDesc('');
      setNewServerPublic(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const { activeServerId } = useServerStore.getState();
    if (!activeServerId) return;

    try {
      await createChannel(activeServerId, newChannelName, newChannelType, selectedCategoryId, newChannelTemp);
      setIsAddChannelOpen(false);
      setNewChannelName('');
      setNewChannelType('text');
      setNewChannelTemp(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      <ServerSidebar
        onAddServerClick={() => setIsAddServerOpen(true)}
        onUserSettingsClick={() => setIsUserSettingsOpen(true)}
      />

      {/* Column 2: Channel Sidebar (Collapsible) */}
      <ChannelSidebar
        collapsed={isChannelSidebarCollapsed}
        onAddChannelClick={(categoryId) => {
          setSelectedCategoryId(categoryId);
          setIsAddChannelOpen(true);
        }}
        onServerSettingsClick={() => {}}
        onUserSettingsClick={() => setIsUserSettingsOpen(true)}
      />

      {/* Column 3: Main Chat View */}
      <ActiveView
        onToggleChannelSidebar={() => setIsChannelSidebarCollapsed(!isChannelSidebarCollapsed)}
        onToggleMemberSidebar={() => setIsMemberSidebarCollapsed(!isMemberSidebarCollapsed)}
      />

      {/* Column 4: Server Members Sidebar (Collapsible) */}
      <MemberSidebar collapsed={isMemberSidebarCollapsed} />

      {/* ================= MODALS ================= */}

      {/* ADD SERVER MODAL */}
      {isAddServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#313338] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading">Stwórz własny serwer</h3>
              <button onClick={() => setIsAddServerOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateServer} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nazwa Serwera</label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="np. Serwer Grzybków"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Opis Serwera</label>
                <textarea
                  value={newServerDesc}
                  onChange={(e) => setNewServerDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 h-20 resize-none"
                  placeholder="Krótki opis serwera..."
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-zinc-800/40 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">Serwer Publiczny</p>
                    <p className="text-xs text-zinc-500">Każdy użytkownik będzie mógł go wyszukać</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newServerPublic}
                  onChange={(e) => setNewServerPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddServerOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition"
                >
                  Stwórz Serwer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CHANNEL MODAL */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#313338] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading">Stwórz nowy kanał</h3>
              <button onClick={() => setIsAddChannelOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateChannel} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Typ Kanału</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('text')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition ${
                      newChannelType === 'text'
                        ? 'border-indigo-500 bg-indigo-600/10 text-white'
                        : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>Czat Tekstowy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('voice')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition ${
                      newChannelType === 'voice'
                        ? 'border-indigo-500 bg-indigo-600/10 text-white'
                        : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>Pokój Głosowy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nazwa Kanału</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="np. pogaduchy"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-zinc-800/40 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">Kanał Tymczasowy</p>
                    <p className="text-xs text-zinc-500">Zostanie automatycznie usunięty gdy opuści go ostatni gracz</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelTemp}
                  onChange={(e) => setNewChannelTemp(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition"
                >
                  Stwórz Kanał
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER SETTINGS MODAL */}
      {isUserSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#313338] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 select-none">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-heading">Ustawienia Konta</h3>
              </div>
              <button onClick={() => setIsUserSettingsOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/20 border border-zinc-800/40 select-none">
                <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold uppercase text-white font-heading border border-zinc-600/30">
                  {profile?.username[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white font-heading text-lg">{profile?.username}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Nazwa konta wraz z tagiem</p>
                  <p className="text-xs text-zinc-500">Zgromadzone punkty gier: {profile?.points ?? 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none">Opcje aplikacji</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col items-start gap-1 p-3 rounded-lg border border-zinc-800 bg-zinc-950/20 text-left hover:border-zinc-700 select-none">
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">Motyw wizualny</span>
                    <span className="text-sm font-semibold text-white">Ciemny (Domyślny)</span>
                  </button>
                  <button className="flex flex-col items-start gap-1 p-3 rounded-lg border border-zinc-800 bg-zinc-950/20 text-left hover:border-zinc-700 select-none">
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">Skróty klawiszowe</span>
                    <span className="text-sm font-semibold text-white">Konfiguruj klawisze</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-800 pt-6 mt-6">
                <button
                  onClick={() => {
                    logout();
                    setIsUserSettingsOpen(false);
                  }}
                  className="rounded-lg bg-red-600/10 border border-red-500/20 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-red-500 hover:text-white transition"
                >
                  Wyloguj się
                </button>
                <button
                  onClick={() => setIsUserSettingsOpen(false)}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
