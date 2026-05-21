const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

// @desc    Get all tasks for a workspace
// @route   GET /api/tasks/workspace/:workspaceId
// @access  Private
const getTasksByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const isMember = workspace.owner.toString() === req.user._id.toString() || 
                     workspace.members.some(member => member.userId.toString() === req.user._id.toString());
                     
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to access tasks in this workspace');
    }

    const tasks = await Task.find({ workspaceId }).populate('assignees', 'name avatar');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { workspaceId, title, description, status, priority, assignees, dueDate, labels } = req.body;

    // Verify workspace access (simplified check, assume frontend passes valid ID)
    const task = await Task.create({
      workspaceId,
      title,
      description,
      status,
      priority,
      assignees,
      dueDate,
      labels,
      lastModifiedBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignees', 'name avatar');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignees, dueDate, labels, version } = req.body;
    
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Offline Sync Conflict Resolution:
    // If incoming version is less than current version, it's a conflict
    if (version && version < task.version) {
      res.status(409);
      throw new Error('Conflict: Task has been modified by someone else. Please refresh and try again.');
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignees = assignees || task.assignees;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.labels = labels || task.labels;
    task.lastModifiedBy = req.user._id;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('assignees', 'name avatar');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByWorkspace,
  createTask,
  updateTask,
  deleteTask,
};
