const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWorkspaces).post(protect, createWorkspace);
router.route('/:id').get(protect, getWorkspaceById);

module.exports = router;
