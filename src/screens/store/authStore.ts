import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { fetchUserProfile } from '../services/auth.service';

type Role = 'candidate' | 'company-admin' | null;

interface AuthState {
  session: Session | null;
  role: Role;
  isLoading: boolean;
  isLoggedIn: boolean;
  initialize: () => void;
  setRoleFromProfile: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  role: null,
  isLoading: true,
  isLoggedIn: false,

  initialize: () => {
    // check for an existing session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, isLoading: false, isLoggedIn: !!session });
      if (session?.user) {
        get().setRoleFromProfile(session.user.id);
      }
    });

    // keep in sync with login/logout/token refresh
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, isLoggedIn: !!session });
      if (session?.user) {
        get().setRoleFromProfile(session.user.id);
      } else {
        set({ role: null });
      }
    });
  },

  setRoleFromProfile: async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      set({ role: profile.role });
    } catch (e) {
      // profile row doesn't exist yet — shouldn't normally happen since
      // signUp() upserts it immediately, but handle gracefully
      console.log('No profile found for user yet:', e);
      set({ role: null });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, role: null, isLoggedIn: false });
  },
}));












