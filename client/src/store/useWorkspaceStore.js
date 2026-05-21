import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/workspaces');
          const workspaces = res.data;
          const current = get().activeWorkspace;
          const stillValid = current && workspaces.find((w) => w._id === current._id);
          set({
            workspaces,
            isLoading: false,
            activeWorkspace: stillValid || workspaces[0] || null,
          });
        } catch (err) {
          set({ isLoading: false });
        }
      },

      createWorkspace: async (name) => {
        const res = await api.post('/workspaces', { name });
        const ws = res.data;
        set((state) => ({
          workspaces: [...state.workspaces, ws],
          activeWorkspace: ws,
        }));
        return ws;
      },

      setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),

      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null }),
    }),
    { name: 'workspace-storage' }
  )
);

export default useWorkspaceStore;
