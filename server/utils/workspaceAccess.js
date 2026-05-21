const Workspace = require('../models/Workspace');

const canAccessWorkspace = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { allowed: false, workspace: null, error: 'Workspace not found' };

  const uid = userId.toString();
  const isMember =
    workspace.owner.toString() === uid ||
    workspace.members.some((m) => m.userId.toString() === uid);

  if (!isMember) {
    return { allowed: false, workspace, error: 'Not authorized to access this workspace' };
  }

  return { allowed: true, workspace, error: null };
};

const canManageWorkspace = async (workspaceId, userId) => {
  const { allowed, workspace, error } = await canAccessWorkspace(workspaceId, userId);
  if (!allowed) return { allowed: false, workspace, error };

  const uid = userId.toString();
  const isAdmin =
    workspace.owner.toString() === uid ||
    workspace.members.some((m) => m.userId.toString() === uid && m.role === 'admin');

  if (!isAdmin) {
    return { allowed: false, workspace, error: 'Admin access required' };
  }

  return { allowed: true, workspace, error: null };
};

module.exports = { canAccessWorkspace, canManageWorkspace };
