import React from 'react';
import { useServerStore } from '../../stores/serverStore';
import { useAuthStore } from '../../stores/authStore';
import { Plus, Home, Compass } from 'lucide-react';

interface ServerSidebarProps {
  onAddServerClick: () => void;
  onUserSettingsClick: () => void;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ onAddServerClick, onUserSettingsClick }) => {
  const { servers, activeServerId, setActiveServerId } = useServerStore();
  const { profile } = useAuthStore();

  return (
    <div className="flex h-full w-[72px] flex-col items-center gap-1.5 bg-[var(--bg-primary)] py-3 text-zinc-400 border-r border-[var(--border-color)]">
      {/* Home / DMs Button */}
      <div className="group relative w-full flex justify-center py-0.5">
        {/* Active Pill Indicator */}
        <div
          className={`absolute left-0 w-1 rounded-r bg-white transition-all duration-200 -translate-y-1/2 top-1/2 ${
            activeServerId === null ? 'h-10' : 'h-0 group-hover:h-5'
          }`}
        />
        <button
          onClick={() => setActiveServerId(null)}
          className={`flex h-12 w-12 items-center justify-center transition-all duration-200 ${
            activeServerId === null
              ? 'rounded-[16px] bg-[var(--accent)] text-white'
              : 'rounded-[24px] bg-[var(--bg-tertiary)] text-zinc-300 hover:rounded-[16px] hover:bg-[var(--accent)] hover:text-white'
          }`}
          title="Prywatne wiadomości / Dom"
        >
          <Home size={24} />
        </button>
      </div>

      <div className="h-[2px] w-8 rounded bg-[var(--border-color)] my-1" />

      {/* Servers List */}
      <div className="flex flex-1 w-full flex-col gap-2 overflow-y-auto px-2 select-none scrollbar-none">
        {servers.map((server) => {
          const isActive = activeServerId === server.id;
          const initials = server.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 3)
            .toUpperCase();

          return (
            <div key={server.id} className="group relative w-full flex justify-center py-0.5">
              {/* Active Pill Indicator */}
              <div
                className={`absolute left-0 w-1 rounded-r bg-white transition-all duration-200 -translate-y-1/2 top-1/2 ${
                  isActive ? 'h-10' : 'h-0 group-hover:h-5'
                }`}
              />
              <button
                onClick={() => setActiveServerId(server.id)}
                className={`flex h-12 w-12 items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'rounded-[16px] bg-[var(--accent)] text-white'
                    : 'rounded-[24px] bg-[var(--bg-tertiary)] text-zinc-300 hover:rounded-[16px] hover:bg-[var(--accent)] hover:text-white'
                }`}
                title={server.name}
              >
                {server.icon_url ? (
                  <img
                    src={server.icon_url}
                    alt={server.name}
                    className="h-full w-full object-cover rounded-[inherit]"
                  />
                ) : (
                  <span className="text-sm font-semibold tracking-wide">{initials}</span>
                )}
              </button>
            </div>
          );
        })}

        {/* Add Server Button */}
        <button
          onClick={onAddServerClick}
          className="group flex h-12 w-12 items-center justify-center rounded-[24px] bg-[var(--bg-tertiary)] text-emerald-500 transition-all duration-200 hover:rounded-[16px] hover:bg-emerald-500 hover:text-white"
          title="Dodaj serwer"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Discovery Button */}
      <button
        className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-[var(--bg-tertiary)] text-zinc-300 transition-all duration-200 hover:rounded-[16px] hover:bg-[var(--accent)] hover:text-white"
        title="Odkrywaj publiczne serwery"
      >
        <Compass size={24} />
      </button>

      <div className="h-[2px] w-8 rounded bg-[var(--border-color)] my-1" />

      {/* User Profile Avatar Card */}
      <button
        onClick={onUserSettingsClick}
        className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] hover:rounded-[16px] transition-all duration-200 bg-[var(--bg-tertiary)] border border-[var(--border-color)] overflow-hidden"
        title="Ustawienia użytkownika"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white uppercase bg-zinc-700">
            {profile?.username ? profile.username[0] : '?'}
          </div>
        )}
        {profile && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500" />
        )}
      </button>
    </div>
  );
};
