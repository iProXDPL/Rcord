import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Server {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  icon_url: string | null;
  is_public: boolean;
  max_emojis: number;
  max_sounds: number;
  max_categories: number;
  max_channels: number;
  boost_level: number;
  created_at: string;
}

interface ServerState {
  servers: Server[];
  activeServerId: string | null; // null = Home / DMs
  loading: boolean;
  error: string | null;
  fetchServers: () => Promise<void>;
  createServer: (name: string, description: string, iconUrl?: string | null, isPublic?: boolean) => Promise<Server>;
  setActiveServerId: (id: string | null) => void;
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServerId: null,
  loading: false,
  error: null,
  fetchServers: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch public servers or servers that the user is a member of
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ servers: [], loading: false });
        return;
      }

      // Query server members to get server IDs
      const { data: memberRows, error: memberError } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const serverIds = memberRows.map(r => r.server_id);
      if (serverIds.length === 0) {
        set({ servers: [], loading: false });
        return;
      }

      const { data: servers, error: serverError } = await supabase
        .from('servers')
        .select('*')
        .in('id', serverIds);

      if (serverError) throw serverError;

      set({ servers: servers || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  createServer: async (name, description, iconUrl = null, isPublic = false) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Użytkownik nie jest zalogowany.');

      const newServer = {
        name,
        description,
        icon_url: iconUrl,
        is_public: isPublic,
        owner_id: user.id
      };

      const { data: server, error } = await supabase
        .from('servers')
        .insert(newServer)
        .select()
        .single();

      if (error) throw error;

      // Automatically add owner to server_members
      const { error: memberError } = await supabase
        .from('server_members')
        .insert({
          server_id: server.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Create a default category and general chat channel for the new server
      const { data: category, error: catError } = await supabase
        .from('channel_categories')
        .insert({
          server_id: server.id,
          name: 'KANAŁY TEKSTOWE',
          position: 0
        })
        .select()
        .single();

      if (!catError && category) {
        await supabase
          .from('channels')
          .insert({
            server_id: server.id,
            category_id: category.id,
            name: 'ogólny',
            type: 'text',
            position: 0
          });
      }

      // Add to list and fetch
      set((state) => ({
        servers: [...state.servers, server],
        loading: false
      }));

      return server;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  setActiveServerId: (id) => {
    set({ activeServerId: id });
  }
}));
