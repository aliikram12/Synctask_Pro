import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
    }
  )
);

// Listen to global 401 unauthorized events
window.addEventListener('auth:unauthorized', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
