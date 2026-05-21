const Workspace = require('../models/Workspace');
const Task = require('../models/Task');

// @desc    Get all workspaces for the logged in user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.userId': req.user._id }
      ]
    });
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res, next) => {
  try {
    const { name } = req.body;

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ userId: req.user._id, role: 'admin' }],
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.userId', 'name email avatar');

    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    // Check if user is member
    const isMember = workspace.owner.toString() === req.user._id.toString() || 
                     workspace.members.some(member => member.userId._id.toString() === req.user._id.toString());
                     
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to access this workspace');
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
};
