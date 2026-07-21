import React from 'react';
import { useServerStore } from '../../stores/serverStore';

interface MemberSidebarProps {
  collapsed: boolean;
}

interface MemberMock {
  id: string;
  username: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'online' | 'idle' | 'dnd' | 'offline';
  game?: string;
  isBot?: boolean;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ collapsed }) => {
  const { activeServerId } = useServerStore();

  if (collapsed || !activeServerId) return null;

  // Mock list of server members
  const mockMembers: MemberMock[] = [
    { id: '1', username: 'ipro#4829', role: 'owner', status: 'online', game: 'Gra w szachy' },
    { id: '2', username: 'moderator#1212', role: 'moderator', status: 'idle' },
    { id: '3', username: 'BotMuzyczny#0001', role: 'member', status: 'online', isBot: true },
    { id: '4', username: 'gracz#9999', role: 'member', status: 'offline' }
  ];

  const onlineMembers = mockMembers.filter(m => m.status !== 'offline');
  const offlineMembers = mockMembers.filter(m => m.status === 'offline');

  const getStatusColor = (status: MemberMock['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'idle': return 'bg-amber-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-zinc-500';
    }
  };



  return (
    <div className="h-full w-60 bg-[#2b2d31] text-zinc-400 flex flex-col border-l border-[#1f2023]/40 select-none">
      {/* Title */}
      <div className="flex h-12 items-center px-4 border-b border-[#1f2023] font-semibold text-white text-sm">
        Członkowie serwera — {mockMembers.length}
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {/* ONLINE SECTION */}
        {onlineMembers.length > 0 && (
          <div className="space-y-1">
            <h4 className="px-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Dostępni — {onlineMembers.length}
            </h4>
            <div className="space-y-[2px]">
              {onlineMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-700/20 cursor-pointer transition"
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white uppercase border border-zinc-600/30">
                      {member.username[0]}
                    </div>
                    {/* Status dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#2b2d31] ${getStatusColor(member.status)}`} />
                  </div>

                  <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-zinc-300 group-hover:text-white">
                        {member.username.split('#')[0]}
                      </span>
                      {member.isBot && (
                        <span className="rounded bg-indigo-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase shrink-0">
                          Bot
                        </span>
                      )}
                    </div>
                    {member.game && (
                      <span className="truncate text-[10px] text-zinc-500 font-medium">
                        {member.game}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OFFLINE SECTION */}
        {offlineMembers.length > 0 && (
          <div className="space-y-1">
            <h4 className="px-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Niedostępni — {offlineMembers.length}
            </h4>
            <div className="space-y-[2px]">
              {offlineMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-700/20 cursor-pointer transition opacity-60 hover:opacity-100"
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white uppercase border border-zinc-600/30">
                      {member.username[0]}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#2b2d31] ${getStatusColor(member.status)}`} />
                  </div>

                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="truncate text-sm font-medium text-zinc-400">
                      {member.username.split('#')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
