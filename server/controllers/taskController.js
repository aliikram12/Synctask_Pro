const Task = require('../models/Task');
const { canAccessWorkspace } = require('../utils/workspaceAccess');
const logActivity = require('../utils/logActivity');
const Notification = require('../models/Notification');

const getTasksByWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const access = await canAccessWorkspace(workspaceId, req.user._id);

    if (!access.allowed) {
      res.status(access.error === 'Workspace not found' ? 404 : 403);
      throw new Error(access.error);
    }

    const { status, priority, assignee, label, search, sort = 'newest' } = req.query;
    const filter = { workspaceId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (label) filter.labels = label;
    if (assignee) filter.assignees = assignee;
    if (search) filter.title = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') sortOption = { priority: -1 };

    const tasks = await Task.find(filter).sort(sortOption).populate('assignees', 'name avatar email');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const access = await canAccessWorkspace(workspaceId, req.user._id);

    if (!access.allowed) {
      res.status(access.error === 'Workspace not found' ? 404 : 403);
      throw new Error(access.error);
    }

    const now = new Date();
    const tasks = await Task.find({ workspaceId });

    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed'
      ).length,
      byStatus: {
        Pending: tasks.filter((t) => t.status === 'Pending').length,
        'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
        Completed: tasks.filter((t) => t.status === 'Completed').length,
      },
      byPriority: {
        Low: tasks.filter((t) => t.priority === 'Low').length,
        Medium: tasks.filter((t) => t.priority === 'Medium').length,
        High: tasks.filter((t) => t.priority === 'High').length,
        Urgent: tasks.filter((t) => t.priority === 'Urgent').length,
      },
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { workspaceId, title, description, status, priority, assignees, dueDate, labels } = req.body;

    const access = await canAccessWorkspace(workspaceId, req.user._id);
    if (!access.allowed) {
      res.status(403);
      throw new Error(access.error);
    }

    const task = await Task.create({
      workspaceId,
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      assignees,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      labels,
      lastModifiedBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignees', 'name avatar email');

    await logActivity({
      workspaceId,
      userId: req.user._id,
      action: 'created',
      entityType: 'task',
      entityId: task._id,
      details: `Created task "${title}"`,
    });

    if (assignees?.length) {
      for (const assigneeId of assignees) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          await Notification.create({
            userId: assigneeId,
            type: 'task_assigned',
            message: `${req.user.name} assigned you to "${title}"`,
            relatedTask: task._id,
            relatedWorkspace: workspaceId,
          });
        }
      }
    }

    const io = req.app.get('io');
    if (io) io.to(workspaceId.toString()).emit('task_created', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignees, dueDate, labels, version } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const access = await canAccessWorkspace(task.workspaceId, req.user._id);
    if (!access.allowed) {
      res.status(403);
      throw new Error(access.error);
    }

    if (version && version < task.version) {
      res.status(409);
      return res.json({
        message: 'Conflict: Task has been modified by someone else.',
        serverTask: await Task.findById(task._id).populate('assignees', 'name avatar email'),
        clientVersion: version,
        serverVersion: task.version,
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignees !== undefined) task.assignees = assignees;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (labels !== undefined) task.labels = labels;
    task.lastModifiedBy = req.user._id;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('assignees', 'name avatar email');

    await logActivity({
      workspaceId: task.workspaceId,
      userId: req.user._id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      details: `Updated task "${populatedTask.title}"`,
    });

    const io = req.app.get('io');
    if (io) io.to(task.workspaceId.toString()).emit('task_updated', populatedTask);

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const access = await canAccessWorkspace(task.workspaceId, req.user._id);
    if (!access.allowed) {
      res.status(403);
      throw new Error(access.error);
    }

    const workspaceIdStr = task.workspaceId.toString();
    const taskId = task._id;
    const title = task.title;

    await task.deleteOne();

    await logActivity({
      workspaceId: task.workspaceId,
      userId: req.user._id,
      action: 'deleted',
      entityType: 'task',
      entityId: taskId,
      details: `Deleted task "${title}"`,
    });

    const io = req.app.get('io');
    if (io) io.to(workspaceIdStr).emit('task_deleted', taskId);

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByWorkspace,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
};
