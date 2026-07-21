import React, { useState } from 'react';
import { useServerStore } from '../../stores/serverStore';
import { useChannelStore } from '../../stores/channelStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Hash,
  Send,
  PlusCircle,
  Smile,
  Gift,
  Search,
  Users,
  ShoppingBag,
  Sparkles,
  Play
} from 'lucide-react';

interface ActiveViewProps {
  onToggleMemberSidebar: () => void;
  onToggleChannelSidebar: () => void;
}

export const ActiveView: React.FC<ActiveViewProps> = ({
  onToggleMemberSidebar,
  onToggleChannelSidebar
}) => {
  const { activeServerId } = useServerStore();
  const { activeChannelId, channels } = useChannelStore();
  const { profile } = useAuthStore();

  const [message, setMessage] = useState('');
  const [homeTab, setHomeTab] = useState<'friends' | 'shop' | 'games'>('friends');

  const activeChannel = channels.find(c => c.id === activeChannelId);

  // Simple demo mock data
  const mockShopItems = [
    { id: '1', name: 'Cyberpunk Neon', price: 500, type: 'border', color: 'border-[#ff007f]' },
    { id: '2', name: 'Emerald Matrix', price: 350, type: 'border', color: 'border-[#00ffcc]' },
    { id: '3', name: 'Royal Gold', price: 800, type: 'border', color: 'border-amber-400' },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg-tertiary)] text-zinc-200">
      {/* Top Header Bar */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-[var(--border-color)] shadow-sm select-none">
        <div className="flex items-center gap-2 font-semibold text-white">
          <button
            onClick={onToggleChannelSidebar}
            className="p-1 hover:bg-[var(--bg-active)]/40 rounded md:hidden text-zinc-400 hover:text-white mr-1"
          >
            <Users size={18} />
          </button>

          {activeServerId && activeChannel ? (
            <div className="flex items-center gap-2">
              <Hash size={20} className="text-zinc-400" />
              <span className="font-heading font-bold text-sm tracking-wide">{activeChannel.name}</span>
              {activeChannel.is_temporary && (
                <span className="text-[10px] bg-[var(--accent)]/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-[var(--accent)]/30">
                  Tymczasowy
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button
                onClick={() => setHomeTab('friends')}
                className={`flex items-center gap-1.5 pb-0.5 border-b-2 text-sm font-semibold tracking-wide transition ${
                  homeTab === 'friends' ? 'border-[var(--accent)] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users size={16} />
                <span>Znajomi</span>
              </button>
              <button
                onClick={() => setHomeTab('shop')}
                className={`flex items-center gap-1.5 pb-0.5 border-b-2 text-sm font-semibold tracking-wide transition ${
                  homeTab === 'shop' ? 'border-[var(--accent)] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShoppingBag size={16} />
                <span>Sklep</span>
              </button>
              <button
                onClick={() => setHomeTab('games')}
                className={`flex items-center gap-1.5 pb-0.5 border-b-2 text-sm font-semibold tracking-wide transition ${
                  homeTab === 'games' ? 'border-[var(--accent)] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Play size={16} />
                <span>Gry</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3 text-zinc-400 select-none">
          {activeServerId && (
            <button
              onClick={onToggleMemberSidebar}
              className="p-1.5 hover:bg-[var(--bg-active)]/40 rounded transition hover:text-white"
              title="Lista członków"
            >
              <Users size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeServerId && activeChannel ? (
          /* SERVER CHAT PANEL */
          <div className="flex-1 flex flex-col justify-end p-4 overflow-hidden">
            {/* Messages Viewport */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
              <div className="flex flex-col justify-end min-h-full">
                <div className="space-y-4">
                  {/* Default welcome message */}
                  <div className="border-b border-[var(--border-color)]/20 pb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-white mb-2">
                      <Hash size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-heading">
                      Witamy na kanale #{activeChannel.name}!
                    </h3>
                    <p className="text-sm text-zinc-400">
                      To jest początek historii tego kanału.
                    </p>
                  </div>

                  {/* Demo static messages */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                      RC
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white leading-none">Rcord Bot</span>
                        <span className="rounded bg-indigo-500 px-1 py-0.5 text-[9px] font-bold text-white uppercase">
                          Bot
                        </span>
                        <span className="text-xs text-zinc-500">dzisiaj o 12:00</span>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">
                        Cześć! Wdrożyliśmy pomyślnie Fazę 2 komunikatora Rcord. Możesz klikać na paski boczne i zarządzać wyciszeniem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMessage('');
              }}
              className="flex items-center gap-3 bg-[#383a40] px-4 py-2.5 rounded-lg select-none"
            >
              <button type="button" className="text-zinc-400 hover:text-white transition">
                <PlusCircle size={22} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Napisz na kanale #${activeChannel.name}...`}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500"
              />
              <div className="flex items-center gap-2 text-zinc-400">
                <button type="button" className="hover:text-white transition">
                  <Gift size={20} />
                </button>
                <button type="button" className="hover:text-white transition">
                  <Smile size={20} />
                </button>
                <button type="submit" className="hover:text-indigo-400 transition text-zinc-500">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* HOME TAB ACTIVE VIEWS */
          <div className="flex-1 overflow-y-auto p-6">
            {homeTab === 'friends' && (
              <div className="space-y-6 select-none">
                <div className="flex items-center justify-between border-b border-[#1f2023] pb-4">
                  <h3 className="text-xl font-bold text-white font-heading">Twoi znajomi</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Szukaj..."
                      className="bg-[#1e1f22] rounded-lg pl-8 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 border border-transparent focus:border-indigo-500 outline-none"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
                  <Users size={48} className="mb-4" />
                  <p className="text-sm">Brak aktywnych znajomych online.</p>
                  <p className="text-xs mt-1">Użyj linku zaproszenia, aby kogoś dodać.</p>
                </div>
              </div>
            )}

            {homeTab === 'shop' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1f2023] pb-4 select-none">
                  <div>
                    <h3 className="text-xl font-bold text-white font-heading">Sklep Rcord</h3>
                    <p className="text-xs text-zinc-500 mt-1">Wymieniaj punkty z gier na unikalne bordery profilu</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1 text-xs font-bold text-amber-400">
                    <Sparkles size={14} />
                    <span>Punkty: {profile?.points ?? 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 select-none">
                  {mockShopItems.map((item) => (
                    <div key={item.id} className="glass rounded-xl p-5 flex flex-col items-center justify-between gap-4 border border-zinc-800 bg-[#2b2d31]/40">
                      <div className="relative">
                        <div className={`h-16 w-16 rounded-full border-4 ${item.color} p-0.5 overflow-hidden shadow-lg`}>
                          <div className="h-full w-full rounded-full bg-zinc-700 flex items-center justify-center text-xl font-bold uppercase text-white font-heading">
                            {profile?.username[0]}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 text-white border border-zinc-900">
                          <Sparkles size={10} />
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-white font-heading text-sm">{item.name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">Obramowanie profilu</p>
                      </div>
                      <button className="w-full rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 py-1.5 text-xs font-bold text-white transition">
                        Kup za {item.price} pkt
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {homeTab === 'games' && (
              <div className="space-y-6 select-none">
                <div className="border-b border-[#1f2023] pb-4">
                  <h3 className="text-xl font-bold text-white font-heading">Centrum Gier</h3>
                  <p className="text-xs text-zinc-500 mt-1">Zagraj w gry i zbieraj punkty na kosmetyki profilu</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {['Szachy PvP', 'Saper', 'Snake'].map((game, i) => (
                    <div key={i} className="glass rounded-xl p-5 border border-zinc-800 bg-[#2b2d31]/40 flex flex-col gap-3 justify-between">
                      <div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-3">
                          <Play size={20} />
                        </div>
                        <h4 className="font-bold text-white font-heading text-sm">{game}</h4>
                        <p className="text-xs text-zinc-500 mt-1">Zdobądź punkty za aktywność.</p>
                      </div>
                      <button className="w-full rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 py-1.5 text-xs font-bold text-white transition">
                        Uruchom
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
