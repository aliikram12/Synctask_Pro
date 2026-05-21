const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// @desc    Invite a user to a workspace
// @route   POST /api/collaboration/invite
// @access  Private
const inviteToWorkspace = async (req, res, next) => {
  try {
    const { workspaceId, email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    // Only owner or admin can invite
    const isAdmin = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.userId.toString() === req.user._id.toString() && m.role === 'admin');
    if (!isAdmin) {
      res.status(403);
      throw new Error('Only workspace admins can invite members');
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      res.status(404);
      throw new Error('User not found with that email');
    }

    // Check if already a member
    const alreadyMember = workspace.members.some(m => m.userId.toString() === userToInvite._id.toString());
    if (alreadyMember) {
      res.status(400);
      throw new Error('User is already a member of this workspace');
    }

    workspace.members.push({ userId: userToInvite._id, role: role || 'member' });
    await workspace.save();

    // Notify the invited user
    await Notification.create({
      userId: userToInvite._id,
      type: 'workspace_invite',
      message: `${req.user.name} invited you to workspace "${workspace.name}"`,
      relatedWorkspace: workspace._id,
    });

    await Activity.create({
      workspaceId: workspace._id,
      userId: req.user._id,
      action: 'joined',
      entityType: 'workspace',
      entityId: workspace._id,
      details: `${userToInvite.name} was invited to the workspace`,
    });

    const updated = await Workspace.findById(workspaceId).populate('members.userId', 'name email avatar');
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from workspace
// @route   DELETE /api/collaboration/remove
// @access  Private
const removeFromWorkspace = async (req, res, next) => {
  try {
    const { workspaceId, userId } = req.body;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only workspace owner can remove members');
    }

    workspace.members = workspace.members.filter(m => m.userId.toString() !== userId);
    await workspace.save();

    const updated = await Workspace.findById(workspaceId).populate('members.userId', 'name email avatar');
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace members
// @route   GET /api/collaboration/members/:workspaceId
// @access  Private
const getMembers = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('members.userId', 'name email avatar')
      .populate('owner', 'name email avatar');
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const uid = req.user._id.toString();
    const isMember =
      workspace.owner._id.toString() === uid ||
      workspace.members.some((m) => m.userId?._id?.toString() === uid);
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized');
    }

    res.json({ owner: workspace.owner, members: workspace.members });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity log for a workspace
// @route   GET /api/collaboration/activity/:workspaceId
// @access  Private
const getActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ workspaceId: req.params.workspaceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar');

    const total = await Activity.countDocuments({ workspaceId: req.params.workspaceId });

    res.json({ activities, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

module.exports = { inviteToWorkspace, removeFromWorkspace, getMembers, getActivity };
