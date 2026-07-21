import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const isExternalUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('http') && !url.includes('/storage/v1/object/public/');
};

const syncExternalAvatar = async (userId: string, externalUrl: string) => {
  try {
    const res = await fetch(externalUrl);
    if (!res.ok) return;
    const blob = await res.blob();
    
    // Default to png if MIME type splitting doesn't give a correct extension
    let fileExt = blob.type.split('/')[1] || 'png';
    if (fileExt.includes('+') || fileExt.length > 4) fileExt = 'png';
    const filePath = `${userId}/avatar.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, { upsert: true });
      
    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
      
    if (!updateError) {
      const store = useAuthStore.getState();
      if (store.profile) {
        store.setProfile({ ...store.profile, avatar_url: publicUrl });
      }
    }
  } catch (err) {
    console.error('Failed to sync external avatar:', err);
  }
};

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  banner_url: string | null;
  points: number;
  current_theme: string;
  current_accent: string;
  current_border_url: string | null;
  is_admin: boolean;
  is_bot: boolean;
  birthdate: string | null;
  server_layout: any[];
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string, birthdate: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<() => void>;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  login: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      set({ user: data.user, session: data.session, profile, loading: false });
    } else {
      set({ loading: false });
    }
  },
  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  register: async (email, password, username, birthdate) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          birthdate,
          is_bot: false
        }
      }
    });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set({ loading: false });
  },
  logout: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null, loading: false });
    if (window.location.hash || window.location.href.includes('#')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  },
  initialize: async () => {
    if (get().initialized) return () => {};

    const { data: { session } } = await supabase.auth.getSession();
    let profile: Profile | null = null;
    if (session?.user) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (error || !data) {
          // Force clear Supabase keys from localStorage to prevent infinity loops
          for (const key in localStorage) {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
              localStorage.removeItem(key);
            }
          }
          await supabase.auth.signOut();
          set({
            session: null,
            user: null,
            profile: null,
            initialized: true
          });
          return () => {};
        }
        profile = data;
      } catch (e) {
        // Fallback for network issues
        set({
          session: null,
          user: null,
          profile: null,
          initialized: true
        });
        return () => {};
      }
    }

    if (profile && session?.user && isExternalUrl(profile.avatar_url)) {
      syncExternalAvatar(session.user.id, profile.avatar_url as string);
    }

    if (session?.user && (window.location.hash || window.location.href.includes('#'))) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    set({
      session,
      user: session?.user ?? null,
      profile,
      initialized: true
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (currentSession?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
        if (data && isExternalUrl(data.avatar_url)) {
          syncExternalAvatar(currentSession.user.id, data.avatar_url as string);
        }
        if (window.location.hash || window.location.href.includes('#')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        set({
          session: currentSession,
          user: currentSession.user,
          profile: data || null,
          initialized: true
        });
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          initialized: true
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}));
