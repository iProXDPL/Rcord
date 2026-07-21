import React, { useEffect, useState } from 'react';
import { useServerStore } from '../../stores/serverStore';
import { useChannelStore, Channel } from '../../stores/channelStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Hash,
  Volume2,
  ChevronDown,
  Plus,
  Mic,
  MicOff,
  Headphones,
  Settings,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ChannelSidebarProps {
  onAddChannelClick: (categoryId: string | null) => void;
  onServerSettingsClick: () => void;
  onUserSettingsClick: () => void;
  collapsed: boolean;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  onAddChannelClick,
  onServerSettingsClick,
  onUserSettingsClick,
  collapsed
}) => {
  const { servers, activeServerId } = useServerStore();
  const { categories, channels, activeChannelId, setActiveChannelId, fetchChannels } = useChannelStore();
  const { profile } = useAuthStore();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  // Find active server
  const activeServer = servers.find((s) => s.id === activeServerId);

  // Fetch channels when active server changes
  useEffect(() => {
    if (activeServerId) {
      fetchChannels(activeServerId);
    }
  }, [activeServerId]);

  if (collapsed) return null;

  const handleMicToggle = () => {
    setIsMicMuted(!isMicMuted);
    // Play microphone mute sound
    const audio = new Audio('/sound/' + (isMicMuted ? 'microfon-mute.mp3' : 'microfon-mute.mp3')); // Simple toggle sound
    audio.play().catch(() => {});
  };

  const handleDeafenToggle = () => {
    const nextDeafen = !isDeafened;
    setIsDeafened(nextDeafen);
    // Play headphone mute/deafen sound
    const audio = new Audio('/sound/headphones-mute.mp3');
    audio.play().catch(() => {});
  };

  return (
    <div className="flex h-full w-60 flex-col bg-[var(--bg-secondary)] text-zinc-300 border-r border-[var(--border-color)]">
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-[var(--border-color)] font-bold text-white shadow-sm">
        {activeServer ? (
          <button
            onClick={onServerSettingsClick}
            className="flex w-full items-center justify-between hover:bg-[var(--bg-active)]/30 py-1.5 px-2 rounded transition text-left"
          >
            <span className="truncate pr-2 font-heading">{activeServer.name}</span>
            <ChevronDown size={18} className="text-zinc-400 shrink-0" />
          </button>
        ) : (
          <div className="flex w-full items-center gap-2 py-1.5 px-2 font-heading">
            <span>Rcord Dom</span>
          </div>
        )}
      </div>

      {/* Events / Options for active Server */}
      {activeServer && (
        <div className="px-2 py-2 flex flex-col gap-1 border-b border-[#1f2023]/30">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-indigo-400 hover:bg-zinc-700/20 hover:text-indigo-300 rounded transition font-medium">
            <Calendar size={18} />
            <span>Wydarzenia serwerowe</span>
          </button>
          {activeServer.boost_level > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-amber-400 font-bold bg-amber-500/10 rounded border border-amber-500/20">
              <Sparkles size={12} />
              <span>Server Boost Level {activeServer.boost_level}</span>
            </div>
          )}
        </div>
      )}

      {/* Categories & Channels Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 select-none">
        {activeServerId ? (
          <div className="space-y-4">
            {/* Uncategorized channels */}
            <div className="space-y-[2px]">
              {channels
                .filter((c) => c.category_id === null)
                .map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannelId === channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                  />
                ))}
            </div>

            {/* Categorized channels */}
            {categories.map((category) => {
              const categoryChannels = channels.filter((c) => c.category_id === category.id);
              return (
                <div key={category.id} className="space-y-[2px]">
                  <div className="flex items-center justify-between px-1 py-1 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300">
                    <span className="truncate">{category.name}</span>
                    <button
                      onClick={() => onAddChannelClick(category.id)}
                      className="text-zinc-500 hover:text-zinc-300 transition"
                      title="Utwórz kanał"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-[2px]">
                    {categoryChannels.map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        channel={channel}
                        isActive={activeChannelId === channel.id}
                        onClick={() => setActiveChannelId(channel.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* DMs / Home sidebar view placeholder */
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Prywatne Wiadomości</div>
            <p className="px-2 py-4 text-xs text-zinc-500">Brak aktywnych rozmów. Dodaj znajomego, aby zacząć czatować.</p>
          </div>
        )}
      </div>

      {/* User Footer Panel */}
      <div className="flex h-[52px] items-center justify-between bg-[var(--bg-primary)] px-2 py-3 select-none border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2 min-w-0 max-w-[120px] cursor-pointer hover:bg-[var(--bg-active)]/30 p-1 rounded transition">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full bg-zinc-700 overflow-hidden border border-zinc-600/30">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Awatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white uppercase">
                  {profile?.username[0]}
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-semibold text-white">{profile?.username.split('#')[0]}</span>
              {profile?.is_bot && (
                <span className="rounded bg-[var(--accent)] px-1 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                  Bot
                </span>
              )}
            </div>
            <span className="truncate text-[11px] text-zinc-400">
              #{profile?.username.split('#')[1] || '0000'}
            </span>
          </div>
        </div>

        {/* Audio / settings controls */}
        <div className="flex items-center gap-0.5 text-zinc-400">
          <button
            onClick={handleMicToggle}
            className={`p-1.5 rounded transition ${isMicMuted ? 'text-red-500 hover:bg-red-500/10' : 'hover:bg-[var(--bg-active)] hover:text-white'}`}
            title={isMicMuted ? 'Odcisz mikrofon' : 'Wycisz mikrofon'}
          >
            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={handleDeafenToggle}
            className={`p-1.5 rounded transition ${isDeafened ? 'text-red-500 hover:bg-red-500/10' : 'hover:bg-[var(--bg-active)] hover:text-white'}`}
            title={isDeafened ? 'Odcisz słuchawki' : 'Wycisz słuchawki'}
          >
            {isDeafened ? <MicOff size={18} /> : <Headphones size={18} />}
          </button>
          <button
            onClick={onUserSettingsClick}
            className="p-1.5 rounded transition hover:bg-[var(--bg-active)] hover:text-white"
            title="Ustawienia użytkownika"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, isActive, onClick }) => {
  const isText = channel.type === 'text';

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium rounded transition ${
        isActive
          ? 'bg-zinc-700/40 text-white font-semibold'
          : 'text-zinc-400 hover:bg-zinc-700/20 hover:text-zinc-200'
      }`}
    >
      {isText ? (
        <Hash size={18} className="shrink-0 text-zinc-500 group-hover:text-zinc-400" />
      ) : (
        <Volume2 size={18} className="shrink-0 text-zinc-500 group-hover:text-zinc-400" />
      )}
      <span className="truncate">{channel.name}</span>
    </button>
  );
};
