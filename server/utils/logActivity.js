const Activity = require('../models/Activity');

const logActivity = async ({ workspaceId, userId, action, entityType, entityId, details }) => {
  try {
    await Activity.create({ workspaceId, userId, action, entityType, entityId, details });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = logActivity;
