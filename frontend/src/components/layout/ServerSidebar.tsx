import React from 'react';
import { useServerStore } from '../../stores/serverStore';
import { Plus, Home, Compass } from 'lucide-react';

interface ServerSidebarProps {
  onAddServerClick: () => void;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ onAddServerClick }) => {
  const { servers, activeServerId, setActiveServerId } = useServerStore();

  return (
    <div className="flex h-full w-[72px] flex-col items-center gap-2 bg-[#111214] py-3 text-zinc-400">
      {/* Home / DMs Button */}
      <button
        onClick={() => setActiveServerId(null)}
        className={`group relative flex h-12 w-12 items-center justify-center transition-all duration-200 ${
          activeServerId === null
            ? 'rounded-[16px] bg-indigo-600 text-white'
            : 'rounded-[24px] bg-zinc-800 text-zinc-300 hover:rounded-[16px] hover:bg-indigo-600 hover:text-white'
        }`}
        title="Prywatne wiadomości / Dom"
      >
        <Home size={24} />
        {/* Active Pill Indicator */}
        <div
          className={`absolute left-0 w-1 rounded-r bg-white transition-all duration-200 ${
            activeServerId === null ? 'h-10' : 'h-0 group-hover:h-5'
          }`}
        />
      </button>

      <div className="h-[2px] w-8 rounded bg-zinc-800 my-1" />

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
            <button
              key={server.id}
              onClick={() => setActiveServerId(server.id)}
              className={`group relative flex h-12 w-12 items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'rounded-[16px] bg-indigo-600 text-white'
                  : 'rounded-[24px] bg-zinc-800 text-zinc-300 hover:rounded-[16px] hover:bg-indigo-600 hover:text-white'
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
              {/* Active Pill Indicator */}
              <div
                className={`absolute left-0 w-1 rounded-r bg-white transition-all duration-200 ${
                  isActive ? 'h-10' : 'h-0 group-hover:h-5'
                }`}
              />
            </button>
          );
        })}

        {/* Add Server Button */}
        <button
          onClick={onAddServerClick}
          className="group flex h-12 w-12 items-center justify-center rounded-[24px] bg-zinc-800 text-emerald-500 transition-all duration-200 hover:rounded-[16px] hover:bg-emerald-500 hover:text-white"
          title="Dodaj serwer"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Discovery Button */}
      <button
        className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-zinc-800 text-zinc-300 transition-all duration-200 hover:rounded-[16px] hover:bg-indigo-600 hover:text-white"
        title="Odkrywaj publiczne serwery"
      >
        <Compass size={24} />
      </button>
    </div>
  );
};
