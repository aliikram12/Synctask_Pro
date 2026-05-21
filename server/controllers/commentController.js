const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('userId', 'name avatar email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a task
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { taskId, content } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const comment = await Comment.create({
      taskId,
      userId: req.user._id,
      content,
    });

    const populated = await Comment.findById(comment._id).populate('userId', 'name avatar email');

    // Create notification for task assignees
    const notifyUsers = task.assignees.filter(a => a.toString() !== req.user._id.toString());
    for (const userId of notifyUsers) {
      await Notification.create({
        userId,
        type: 'comment_added',
        message: `${req.user.name} commented on "${task.title}"`,
        relatedTask: task._id,
        relatedWorkspace: task.workspaceId,
      });
    }

    // Log activity
    await Activity.create({
      workspaceId: task.workspaceId,
      userId: req.user._id,
      action: 'commented',
      entityType: 'comment',
      entityId: comment._id,
      details: `Commented on task "${task.title}"`,
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }
    if (comment.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, addComment, deleteComment };
