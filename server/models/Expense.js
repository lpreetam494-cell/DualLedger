import mongoose from 'mongoose';

const splitDetailSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  amountOwed: {
    type: Number,
    required: true
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
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
  notes: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isSplit: {
    type: Boolean,
    default: false
  },
  splitDetails: {
    type: [splitDetailSchema],
    default: []
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
