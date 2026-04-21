import express from 'express';
import { protect } from '../middleware/auth.js';
import { getRecurringExpenses, addRecurringExpense, deleteRecurringExpense } from '../controllers/recurringController.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecurringExpenses);
router.post('/', addRecurringExpense);
router.delete('/:id', deleteRecurringExpense);

export default router;
