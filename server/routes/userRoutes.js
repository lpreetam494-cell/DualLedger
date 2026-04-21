import express from 'express';
import { protect } from '../middleware/auth.js';
import { searchUsers, getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/friends', getFriends);
router.post('/friend-request', sendFriendRequest);
router.post('/friend-request/accept', acceptFriendRequest);
router.post('/friend-request/reject', rejectFriendRequest);

export default router;
