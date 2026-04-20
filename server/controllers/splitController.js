import Expense from '../models/Expense.js';

// @desc    Get simplified debts for the group
// @route   GET /api/splits/balances
export const getSplitBalances = async (req, res) => {
  try {
    // Find all split expenses
    const expenses = await Expense.find({ isSplit: true });

    // 1. Calculate net balance for each user
    const balances = {}; // { userId: netAmount } (Positive means they are owed, negative means they owe)

    expenses.forEach(exp => {
      const payer = exp.userId;
      const amountPaid = exp.amount;

      // Payer is owed the full amount initially (from the group)
      balances[payer] = (balances[payer] || 0) + amountPaid;

      // Subtract the amount each person owes from their balance
      exp.splitDetails.forEach(split => {
        const borrower = split.userId;
        const amountOwed = split.amountOwed;

        balances[borrower] = (balances[borrower] || 0) - amountOwed;
      });
    });

    // 2. Separate debtors and creditors
    const debtors = [];
    const creditors = [];

    for (const [user, balance] of Object.entries(balances)) {
      if (balance > 0.01) { // Floating point tolerance
        creditors.push({ user, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ user, amount: Math.abs(balance) });
      }
    }

    // Sort descending by amount to optimize settlements
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // 3. Match debtors to creditors
    const settlements = [];
    let d = 0; // debtor index
    let c = 0; // creditor index

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];

      const settleAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: Number(settleAmount.toFixed(2))
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    res.json({
      netBalances: balances,
      settlements
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
