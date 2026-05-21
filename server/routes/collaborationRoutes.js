const express = require('express');
const router = express.Router();
const { inviteToWorkspace, removeFromWorkspace, getMembers, getActivity } = require('../controllers/collaborationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/invite').post(protect, inviteToWorkspace);
router.route('/remove').delete(protect, removeFromWorkspace);
router.route('/members/:workspaceId').get(protect, getMembers);
router.route('/activity/:workspaceId').get(protect, getActivity);

module.exports = router;
