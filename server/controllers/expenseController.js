import Expense from '../models/Expense.js';

// @desc    Get all expenses for the current user
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  try {
    const { amount, category, paymentMode, notes, description, date, isSplit, splitDetails } = req.body;

    const expense = new Expense({
      userId: req.user._id,
      amount,
      category,
      paymentMode,
      notes,
      description,
      date: date || Date.now(),
      isSplit: isSplit || false,
      splitDetails: isSplit ? splitDetails : []
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      expense.amount = req.body.amount || expense.amount;
      expense.category = req.body.category || expense.category;
      expense.paymentMode = req.body.paymentMode || expense.paymentMode;
      expense.notes = req.body.notes || expense.notes;
      expense.description = req.body.description || expense.description;
      expense.date = req.body.date || expense.date;
      
      if (req.body.isSplit !== undefined) {
        expense.isSplit = req.body.isSplit;
        expense.splitDetails = req.body.isSplit ? req.body.splitDetails : [];
      }

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      await expense.deleteOne();
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get monthly insights
// @route   GET /api/expenses/insights
export const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total spend and Category breakdown
    const categoryStats = await Expense.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Spending Trends (Group by day of week)
    const dayTrends = await Expense.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: { $dayOfWeek: '$date' }, 
          totalSpent: { $sum: '$amount' } 
        } 
      },
      { $sort: { totalSpent: -1 } }
    ]);

    const totalOverall = categoryStats.reduce((acc, curr) => acc + curr.totalSpent, 0);

    // Map Mongo dayOfWeek (1=Sun, 2=Mon, etc.) to String
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let peakDay = "None";
    if (dayTrends.length > 0) {
      peakDay = days[dayTrends[0]._id - 1];
    }

    res.json({
      totalSpent: totalOverall,
      categories: categoryStats,
      peakSpendingDay: peakDay,
      dayTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
