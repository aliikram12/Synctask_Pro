import api from './api';

export const fetchTasks = (workspaceId, params = {}) =>
  api.get(`/tasks/workspace/${workspaceId}`, { params });

export const fetchTaskStats = (workspaceId) =>
  api.get(`/tasks/stats/${workspaceId}`);

export const createTask = (data) => api.post('/tasks', data);

export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);
