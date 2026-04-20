import express from 'express';
import { 
  addExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense,
  getInsights
} from '../controllers/expenseController.js';
import { getSplitBalances } from '../controllers/splitController.js';

const router = express.Router();

// Insights route must be above /:id to avoid matching :id as "insights"
router.get('/insights', getInsights);

router.route('/')
  .get(getExpenses)
  .post(addExpense);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

// Split routes
router.get('/splits/balances', getSplitBalances);

export default router;
