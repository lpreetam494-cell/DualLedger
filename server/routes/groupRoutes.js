import express from 'express';
import { protect } from '../middleware/auth.js';
import { createGroup, getGroups } from '../controllers/groupController.js';

const router = express.Router();

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);

export default router;
