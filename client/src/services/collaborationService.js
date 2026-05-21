import api from './api';

export const fetchMembers = (workspaceId) =>
  api.get(`/collaboration/members/${workspaceId}`);

export const inviteMember = (workspaceId, email, role = 'member') =>
  api.post('/collaboration/invite', { workspaceId, email, role });

export const removeMember = (workspaceId, userId) =>
  api.delete('/collaboration/remove', { data: { workspaceId, userId } });

export const fetchActivity = (workspaceId, page = 1) =>
  api.get(`/collaboration/activity/${workspaceId}`, { params: { page } });
