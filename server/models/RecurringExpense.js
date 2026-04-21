import mongoose from 'mongoose';

const recurringExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  paymentMode: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    default: 'monthly'
  },
  nextRunDate: {
    type: Date,
    required: true
  },
  lastRunDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);

export default RecurringExpense;
