import api from './api';

export const login = (data) => api.post('/users/auth', data);

export const signup = (data) => api.post('/users', data);

export const logout = () => api.post('/users/logout');

export const getProfile = () => api.get('/users/profile');

export const refreshSession = () => api.post('/users/refresh');
