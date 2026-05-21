const express = require('express');
const router = express.Router();
const {
  getTasksByWorkspace,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createTaskSchema } = require('../validators/taskValidator');

router.route('/').post(protect, validate(createTaskSchema), createTask);
router.route('/workspace/:workspaceId').get(protect, getTasksByWorkspace);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
