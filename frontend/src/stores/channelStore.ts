import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ChannelCategory {
  id: string;
  server_id: string;
  name: string;
  position: number;
}

export interface Channel {
  id: string;
  server_id: string | null;
  category_id: string | null;
  name: string | null;
  type: 'text' | 'voice' | 'dm' | 'group_dm';
  is_temporary: boolean;
  created_by: string | null;
  position: number;
}

interface ChannelState {
  categories: ChannelCategory[];
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  error: string | null;
  fetchChannels: (serverId: string) => Promise<void>;
  createChannel: (serverId: string, name: string, type: 'text' | 'voice', categoryId: string | null, isTemporary?: boolean) => Promise<Channel>;
  createCategory: (serverId: string, name: string) => Promise<ChannelCategory>;
  setActiveChannelId: (id: string | null) => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  categories: [],
  channels: [],
  activeChannelId: null,
  loading: false,
  error: null,
  fetchChannels: async (serverId) => {
    set({ loading: true, error: null });
    try {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('channel_categories')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true });

      if (catError) throw catError;

      // Fetch channels
      const { data: channels, error: chanError } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true });

      if (chanError) throw chanError;

      set({
        categories: categories || [],
        channels: channels || [],
        loading: false
      });

      // Default active channel to the first text channel if none set or active is not in the list
      if (channels && channels.length > 0) {
        const textChannels = channels.filter(c => c.type === 'text');
        if (textChannels.length > 0) {
          set({ activeChannelId: textChannels[0].id });
        }
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  createChannel: async (serverId, name, type, categoryId, isTemporary = false) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: newChannel, error } = await supabase
        .from('channels')
        .insert({
          server_id: serverId,
          category_id: categoryId,
          name,
          type,
          is_temporary: isTemporary,
          created_by: user?.id || null,
          position: get().channels.filter(c => c.category_id === categoryId).length
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        channels: [...state.channels, newChannel],
        loading: false
      }));

      return newChannel;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  createCategory: async (serverId, name) => {
    set({ loading: true, error: null });
    try {
      const { data: newCategory, error } = await supabase
        .from('channel_categories')
        .insert({
          server_id: serverId,
          name,
          position: get().categories.length
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false
      }));

      return newCategory;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  setActiveChannelId: (id) => {
    set({ activeChannelId: id });
  }
}));
