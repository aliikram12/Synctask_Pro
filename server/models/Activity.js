const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'commented', 'assigned', 'status_changed', 'joined', 'left'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'workspace', 'comment'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
