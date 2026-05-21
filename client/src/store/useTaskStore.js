import { create } from 'zustand';
import { db } from '../offline/db';
import api from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (workspaceId) => {
    set({ isLoading: true });
    try {
      // 1. Load from IndexedDB first for instant UI
      const localTasks = await db.tasks.where('workspaceId').equals(workspaceId).toArray();
      set({ tasks: localTasks });

      // 2. Fetch from network
      if (navigator.onLine) {
        const response = await api.get(`/tasks/workspace/${workspaceId}`);
        const serverTasks = response.data;
        
        // 3. Update IndexedDB and Store
        await db.tasks.bulkPut(serverTasks);
        set({ tasks: serverTasks, isLoading: false, error: null });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      // Optimistic update locally
      const tempId = `temp_${Date.now()}`;
      const newTask = { ...taskData, _id: tempId, status: taskData.status || 'Pending', version: 1 };
      
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      await db.tasks.put(newTask);

      if (navigator.onLine) {
        const response = await api.post('/tasks', taskData);
        const createdTask = response.data;
        
        // Replace temp task with real task
        await db.tasks.delete(tempId);
        await db.tasks.put(createdTask);
        
        set((state) => ({
          tasks: state.tasks.map((t) => (t._id === tempId ? createdTask : t)),
        }));
      } else {
        // Queue for offline sync
        await db.syncQueue.add({
          action: 'create',
          payload: taskData,
          tempId,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Add task error', error);
      // Revert optimistic update here if needed
    }
  },

  updateTaskStatus: async (taskId, newStatus, currentTasks) => {
    try {
      // Optimistic update
      const taskIndex = currentTasks.findIndex(t => t._id === taskId);
      if (taskIndex === -1) return;
      
      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
      
      set({ tasks: updatedTasks });
      await db.tasks.update(taskId, { status: newStatus });

      if (navigator.onLine) {
        if (!taskId.startsWith('temp_')) {
          await api.put(`/tasks/${taskId}`, { status: newStatus, version: updatedTasks[taskIndex].version });
        }
      } else {
        await db.syncQueue.add({
          action: 'update',
          payload: { id: taskId, updates: { status: newStatus } },
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Update status error', error);
    }
  },

  // Added for Socket.io real-time updates
  handleRealtimeTaskUpdate: async (updatedTask) => {
    set((state) => {
      const exists = state.tasks.some(t => t._id === updatedTask._id);
      if (exists) {
        return { tasks: state.tasks.map(t => t._id === updatedTask._id ? updatedTask : t) };
      }
      return { tasks: [...state.tasks, updatedTask] };
    });
    await db.tasks.put(updatedTask);
  }
}));

export default useTaskStore;
