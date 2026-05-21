import { create } from 'zustand';
import { db } from '../offline/db';
import * as taskService from '../services/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  conflict: null,

  clearConflict: () => set({ conflict: null }),

  fetchTasks: async (workspaceId, filters = {}) => {
    if (!workspaceId) return;
    set({ isLoading: true });
    try {
      const localTasks = await db.tasks.where('workspaceId').equals(workspaceId).toArray();
      if (localTasks.length) set({ tasks: localTasks });

      if (navigator.onLine) {
        const response = await taskService.fetchTasks(workspaceId, filters);
        const serverTasks = response.data;
        await db.tasks.bulkPut(serverTasks.map((t) => ({ ...t, workspaceId: t.workspaceId?.toString?.() || workspaceId })));
        set({ tasks: serverTasks, isLoading: false, error: null });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (taskData) => {
    const tempId = `temp_${Date.now()}`;
    const newTask = {
      ...taskData,
      _id: tempId,
      status: taskData.status || 'Pending',
      priority: taskData.priority || 'Medium',
      version: 1,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));
    await db.tasks.put(newTask);

    if (navigator.onLine) {
      const response = await taskService.createTask(taskData);
      const createdTask = response.data;
      await db.tasks.delete(tempId);
      await db.tasks.put(createdTask);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === tempId ? createdTask : t)),
      }));
      return createdTask;
    }

    await db.syncQueue.add({
      action: 'create',
      payload: taskData,
      tempId,
      timestamp: Date.now(),
    });
    return newTask;
  },

  updateTask: async (taskId, updates) => {
    const currentTasks = get().tasks;
    const task = currentTasks.find((t) => t._id === taskId);
    if (!task) return;

    const optimistic = { ...task, ...updates };
    set({ tasks: currentTasks.map((t) => (t._id === taskId ? optimistic : t)) });
    await db.tasks.put(optimistic);

    if (navigator.onLine && !taskId.startsWith('temp_')) {
      try {
        const response = await taskService.updateTask(taskId, {
          ...updates,
          version: task.version,
        });
        const updated = response.data;
        if (response.status === 409 || updated.serverTask) {
          set({
            conflict: {
              taskId,
              serverTask: updated.serverTask || updated,
              localTask: optimistic,
            },
          });
          return;
        }
        await db.tasks.put(updated);
        set((state) => ({
          tasks: state.tasks.map((t) => (t._id === taskId ? updated : t)),
        }));
      } catch (err) {
        if (err.response?.status === 409) {
          set({
            conflict: {
              taskId,
              serverTask: err.response.data?.serverTask,
              localTask: optimistic,
            },
          });
        }
        throw err;
      }
    } else {
      await db.syncQueue.add({
        action: 'update',
        payload: { id: taskId, updates },
        timestamp: Date.now(),
      });
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    await get().updateTask(taskId, { status: newStatus });
  },

  deleteTask: async (taskId) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) }));
    await db.tasks.delete(taskId);

    if (navigator.onLine && !taskId.startsWith('temp_')) {
      await taskService.deleteTask(taskId);
    } else {
      await db.syncQueue.add({
        action: 'delete',
        payload: { id: taskId },
        timestamp: Date.now(),
      });
    }
  },

  resolveConflict: async (useServer) => {
    const { conflict } = get();
    if (!conflict) return;

    if (useServer && conflict.serverTask) {
      await db.tasks.put(conflict.serverTask);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t._id === conflict.taskId ? conflict.serverTask : t
        ),
        conflict: null,
      }));
    } else {
      await get().updateTask(conflict.taskId, {
        ...conflict.localTask,
        version: conflict.serverTask?.version,
      });
      set({ conflict: null });
    }
  },

  handleRealtimeTaskUpdate: async (updatedTask) => {
    set((state) => {
      const exists = state.tasks.some((t) => t._id === updatedTask._id);
      if (exists) {
        return { tasks: state.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)) };
      }
      return { tasks: [...state.tasks, updatedTask] };
    });
    await db.tasks.put(updatedTask);
  },

  removeTask: (taskId) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) }));
    db.tasks.delete(taskId);
  },
}));

window.addEventListener('sync:completed', () => {
  const wsId = window.__activeWorkspaceId;
  if (wsId) useTaskStore.getState().fetchTasks(wsId);
});

window.addEventListener('sync:conflict', (e) => {
  const data = e.detail;
  if (data?.serverTask) {
    useTaskStore.setState({
      conflict: {
        taskId: data.serverTask._id,
        serverTask: data.serverTask,
        localTask: data.serverTask,
      },
    });
  }
});

export default useTaskStore;
