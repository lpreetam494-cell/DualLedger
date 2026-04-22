import Expense from '../models/Expense.js';

// @desc    Get all expenses for the current user
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  try {
    const { type, amount, category, paymentMode, notes, description, date, isSplit, splitDetails } = req.body;

    const expense = new Expense({
      userId: req.user._id,
      type: type || 'expense',
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

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Security: only the owner can delete their expense
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get monthly insights
// @route   GET /api/expenses/insights
export const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
       dateFilter.date = {};
       if (startDate) dateFilter.date.$gte = new Date(startDate);
       if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         dateFilter.date.$lte = end;
       }
    } else {
       // Default to current month
       const now = new Date();
       dateFilter.date = { 
           $gte: new Date(now.getFullYear(), now.getMonth(), 1),
           $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
       };
    }

    const matchExpenses = { userId, type: 'expense', ...dateFilter };
    const matchIncome = { userId, type: 'income', ...dateFilter };

    // Total spend and Category breakdown (only for 'expense' type)
    const categoryStats = await Expense.aggregate([
      { $match: matchExpenses },
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Spending Trends (Group by day of week, only expenses)
    const dayTrends = await Expense.aggregate([
      { $match: matchExpenses },
      { 
        $group: { 
          _id: { $dayOfWeek: '$date' }, 
          totalSpent: { $sum: '$amount' } 
        } 
      },
      { $sort: { totalSpent: -1 } }
    ]);

    const totalOverall = categoryStats.reduce((acc, curr) => acc + curr.totalSpent, 0);

    // Calculate Total Income
    const incomeStats = await Expense.aggregate([
      { $match: matchIncome },
      { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
    ]);
    const totalIncome = incomeStats.length > 0 ? incomeStats[0].totalIncome : 0;
    
    // Calculate Current Balance
    const currentBalance = totalIncome - totalOverall;

    // Map Mongo dayOfWeek (1=Sun, 2=Mon, etc.) to String
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let peakDay = "None";
    if (dayTrends.length > 0) {
      peakDay = days[dayTrends[0]._id - 1];
    }

    res.json({
      totalSpent: totalOverall,
      totalIncome: totalIncome,
      currentBalance: currentBalance,
      categories: categoryStats,
      peakSpendingDay: peakDay,
      dayTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
