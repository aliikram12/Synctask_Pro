import api from './api';

export const fetchWorkspaces = () => api.get('/workspaces');

export const createWorkspace = (name) => api.post('/workspaces', { name });

export const fetchWorkspace = (id) => api.get(`/workspaces/${id}`);
