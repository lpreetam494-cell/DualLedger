import RecurringExpense from '../models/RecurringExpense.js';

export const getRecurringExpenses = async (req, res) => {
  try {
    const recurring = await RecurringExpense.find({ userId: req.user._id }).sort({ nextRunDate: 1 });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addRecurringExpense = async (req, res) => {
  try {
    const { amount, description, category, paymentMode, frequency, nextRunDate } = req.body;
    const recurring = await RecurringExpense.create({
      userId: req.user._id,
      amount,
      description,
      category,
      paymentMode,
      frequency,
      nextRunDate: new Date(nextRunDate)
    });
    res.status(201).json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

export const deleteRecurringExpense = async (req, res) => {
  try {
    const recurring = await RecurringExpense.findById(req.params.id);
    if (recurring && recurring.userId.toString() === req.user._id.toString()) {
      await recurring.deleteOne();
      res.json({ message: 'Recurring expense removed' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
