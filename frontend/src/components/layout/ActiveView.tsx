import React, { useState, useEffect } from 'react';
import { useServerStore } from '../../stores/serverStore';
import { useChannelStore } from '../../stores/channelStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
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
  Play,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Clock
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

  // Friends System States
  const [friendsSubTab, setFriendsSubTab] = useState<'all' | 'pending' | 'add'>('all');
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Load friends list and pending requests
  const fetchFriends = async () => {
    if (!profile) return;
    try {
      const { data: rels } = await supabase
        .from('relationships')
        .select('friend_id, status')
        .eq('user_id', profile.id);

      if (rels) {
        const friendIds = rels.filter(r => r.status === 'friends').map(r => r.friend_id);
        const pendingIds = rels.filter(r => r.status === 'pending_received' || r.status === 'pending_sent').map(r => r.friend_id);

        let fetchedFriends: any[] = [];
        let fetchedPending: any[] = [];

        if (friendIds.length > 0) {
          const { data: fProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', friendIds);
          if (fProfiles) fetchedFriends = fProfiles;
        }

        if (pendingIds.length > 0) {
          const { data: pProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', pendingIds);
          if (pProfiles) {
            fetchedPending = pProfiles.map(p => {
              const rel = rels.find(r => r.friend_id === p.id);
              return {
                ...p,
                status: rel?.status || 'pending'
              };
            });
          }
        }

        setFriends(fetchedFriends);
        setPendingRequests(fetchedPending);
      }
    } catch (e) {
      console.error('Error fetching friends:', e);
    }
  };

  useEffect(() => {
    if (!activeServerId && homeTab === 'friends') {
      fetchFriends();
    }
  }, [activeServerId, homeTab, profile]);

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNickname.trim() || !profile) return;
    setLoadingSearch(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchNickname.trim()}%`)
        .neq('id', profile.id)
        .limit(10);
      if (data) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!profile) return;
    try {
      await supabase.from('relationships').upsert({
        user_id: profile.id,
        friend_id: friendId,
        status: 'pending_sent',
        updated_at: new Date().toISOString()
      });
      await supabase.from('relationships').upsert({
        user_id: friendId,
        friend_id: profile.id,
        status: 'pending_received',
        updated_at: new Date().toISOString()
      });
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    if (!profile) return;
    try {
      await supabase.from('relationships')
        .upsert({ user_id: profile.id, friend_id: friendId, status: 'friends', updated_at: new Date().toISOString() });
      await supabase.from('relationships')
        .upsert({ user_id: friendId, friend_id: profile.id, status: 'friends', updated_at: new Date().toISOString() });
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (friendId: string) => {
    if (!profile) return;
    try {
      await supabase.from('relationships').delete().eq('user_id', profile.id).eq('friend_id', friendId);
      await supabase.from('relationships').delete().eq('user_id', friendId).eq('friend_id', profile.id);
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

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
              <div className="space-y-6 select-none animate-in fade-in duration-200">
                {/* Friends Sub-navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Users size={22} className="text-zinc-400" />
                    <h3 className="text-lg font-bold text-white font-heading mr-4">Znajomi</h3>
                    
                    <button
                      onClick={() => setFriendsSubTab('all')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        friendsSubTab === 'all' 
                          ? 'bg-[var(--bg-active)] text-white' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Wszyscy ({friends.length})
                    </button>
                    <button
                      onClick={() => setFriendsSubTab('pending')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition relative ${
                        friendsSubTab === 'pending' 
                          ? 'bg-[var(--bg-active)] text-white' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Oczekujące ({pendingRequests.length})
                      {pendingRequests.filter(r => r.status === 'pending_received').length > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => setFriendsSubTab('add')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        friendsSubTab === 'add' 
                          ? 'bg-emerald-500 text-white shadow shadow-emerald-500/30' 
                          : 'text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    >
                      Dodaj znajomego
                    </button>
                  </div>

                  {/* Local filtering for existing friends */}
                  {friendsSubTab === 'all' && friends.length > 0 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Szukaj znajomego..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="bg-[#11131a] rounded-lg pl-8 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 border border-zinc-800 focus:border-[var(--accent)] outline-none transition"
                      />
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                  )}
                </div>

                {/* SUBTAB: ALL FRIENDS */}
                {friendsSubTab === 'all' && (
                  <div>
                    {friends.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-[#11131a]/30 border border-zinc-800/40 rounded-2xl p-6">
                        <Users size={40} className="mb-4 text-zinc-600" />
                        <p className="text-sm font-semibold text-zinc-400">Nikt tu jeszcze nie gra sam!</p>
                        <p className="text-xs mt-1 text-zinc-500">Przejdź do zakładki "Dodaj znajomego", aby zaprosić kogoś do wspólnej gry.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {friends
                          .filter(f => f.username.toLowerCase().includes(searchFilter.toLowerCase()))
                          .map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/50 bg-[#11131a]/20 hover:bg-[#11131a]/40 hover:border-zinc-700/60 transition group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                    {friend.avatar_url ? (
                                      <img src={friend.avatar_url} alt={friend.username} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white uppercase bg-zinc-700">
                                        {friend.username[0]}
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                    {friend.username.split('#')[0]}
                                    <span className="text-zinc-500 font-normal text-xs">#{friend.username.split('#')[1] || '0000'}</span>
                                    {friend.is_bot && (
                                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-bold px-1 py-0.2 rounded border border-indigo-500/30">BOT</span>
                                    )}
                                  </h4>
                                  <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Online</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--accent)] text-zinc-400 hover:text-white rounded-lg transition border border-zinc-800/80 hover:border-transparent"
                                  title="Rozpocznij czat"
                                >
                                  <MessageSquare size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(friend.id)}
                                  className="p-2 bg-[var(--bg-secondary)] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition border border-zinc-800/80 hover:border-red-500/20"
                                  title="Usuń ze znajomych"
                                >
                                  <UserX size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: PENDING REQUESTS */}
                {friendsSubTab === 'pending' && (
                  <div>
                    {pendingRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-[#11131a]/30 border border-zinc-800/40 rounded-2xl p-6">
                        <Clock size={40} className="mb-4 text-zinc-600" />
                        <p className="text-sm font-semibold text-zinc-400">Brak oczekujących zaproszeń</p>
                        <p className="text-xs mt-1 text-zinc-500">Kiedy wyślesz lub otrzymasz zaproszenie do znajomych, pojawi się ono tutaj.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pendingRequests.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/50 bg-[#11131a]/20 hover:bg-[#11131a]/40 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                {req.avatar_url ? (
                                  <img src={req.avatar_url} alt={req.username} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white uppercase bg-zinc-700">
                                    {req.username[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                  {req.username.split('#')[0]}
                                  <span className="text-zinc-500 font-normal text-xs">#{req.username.split('#')[1] || '0000'}</span>
                                </h4>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1.5 inline-block ${
                                  req.status === 'pending_received'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}>
                                  {req.status === 'pending_received' ? 'Zaproszenie Otrzymane' : 'Zaproszenie Wysłane'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === 'pending_received' ? (
                                <>
                                  <button
                                    onClick={() => handleAcceptRequest(req.id)}
                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition border border-emerald-500/20 hover:border-transparent"
                                    title="Zaakceptuj zaproszenie"
                                  >
                                    <UserCheck size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeclineRequest(req.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition border border-red-500/20 hover:border-transparent"
                                    title="Odrzuć zaproszenie"
                                  >
                                    <UserX size={16} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleDeclineRequest(req.id)}
                                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition border border-zinc-700"
                                  title="Anuluj zaproszenie"
                                >
                                  <UserX size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: ADD FRIEND SEARCH */}
                {friendsSubTab === 'add' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-[#11131a]/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Dodaj Znajomego</h4>
                      <p className="text-xs text-zinc-500">Wyszukaj innego użytkownika po jego unikalnej nazwie gracza Rcord, aby wysłać zaproszenie.</p>
                      
                      <form onSubmit={handleSearchUsers} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Wpisz nazwę gracza (np. ipro)..."
                            value={searchNickname}
                            onChange={(e) => setSearchNickname(e.target.value)}
                            className="w-full bg-[#11131a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-[var(--accent)] outline-none transition"
                          />
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>
                        <button
                          type="submit"
                          disabled={loadingSearch}
                          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition shadow shadow-indigo-600/30 disabled:opacity-50"
                        >
                          {loadingSearch ? 'Szukanie...' : 'Wyszukaj'}
                        </button>
                      </form>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide px-1">Wyniki Wyszukiwania</h4>
                        <div className="space-y-2">
                          {searchResults.map((user) => {
                            const isAlreadyFriend = friends.some(f => f.id === user.id);
                            const isReqPending = pendingRequests.some(r => r.id === user.id);
                            
                            return (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/50 bg-[#11131a]/10 hover:bg-[#11131a]/20 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                    {user.avatar_url ? (
                                      <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white uppercase bg-zinc-700">
                                        {user.username[0]}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                      {user.username.split('#')[0]}
                                      <span className="text-zinc-500 font-normal text-xs">#{user.username.split('#')[1] || '0000'}</span>
                                    </h4>
                                  </div>
                                </div>

                                <div>
                                  {isAlreadyFriend ? (
                                    <span className="text-xs text-zinc-500 font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                                      Jesteście znajomymi
                                    </span>
                                  ) : isReqPending ? (
                                    <span className="text-xs text-zinc-500 font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center gap-1.5">
                                      <Clock size={12} />
                                      Oczekuje
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleSendFriendRequest(user.id)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow shadow-emerald-500/20 flex items-center gap-1.5"
                                    >
                                      <UserPlus size={12} />
                                      Dodaj Znajomego
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
