const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addComment);
router.route('/task/:taskId').get(protect, getComments);
router.route('/:id').delete(protect, deleteComment);

module.exports = router;
