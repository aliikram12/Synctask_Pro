const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'comment_added', 'workspace_invite', 'due_reminder', 'mention'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    relatedWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
