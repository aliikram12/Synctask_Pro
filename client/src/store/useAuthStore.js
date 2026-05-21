import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProfile, refreshSession, logout as logoutApi } from '../services/authService';
import useWorkspaceStore from './useWorkspaceStore';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,

      setAuth: (user) => set({ user, isAuthenticated: true, isBootstrapping: false }),

      bootstrap: async () => {
        try {
          const res = await getProfile();
          set({ user: res.data, isAuthenticated: true, isBootstrapping: false });
          return true;
        } catch {
          try {
            const res = await refreshSession();
            set({ user: res.data, isAuthenticated: true, isBootstrapping: false });
            return true;
          } catch {
            set({ user: null, isAuthenticated: false, isBootstrapping: false });
            return false;
          }
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch {}
        set({ user: null, isAuthenticated: false });
        useWorkspaceStore.getState().clearWorkspaces();
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
);

window.addEventListener('auth:unauthorized', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
