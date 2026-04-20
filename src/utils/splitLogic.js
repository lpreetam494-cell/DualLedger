export function calculateBalances(expenses) {
  const balance = {};

  expenses.forEach(exp => {
    const { paidBy, amount, participants } = exp;
    const splitAmount = amount / participants.length;

    participants.forEach(person => {
      if (!balance[person]) balance[person] = 0;
      if (!balance[paidBy]) balance[paidBy] = 0;

      if (person === paidBy) {
        balance[person] += amount - splitAmount;
      } else {
        balance[person] -= splitAmount;
      }
    });
  });

  return balance;
}

export function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];
  const transactions = [];

  for (let person in balances) {
    if (balances[person] > 0) {
      creditors.push({ person, amount: balances[person] });
    } else if (balances[person] < 0) {
      debtors.push({ person, amount: -balances[person] });
    }
  }

  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const min = Math.min(debtors[i].amount, creditors[j].amount);

    transactions.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: min
    });

    debtors[i].amount -= min;
    creditors[j].amount -= min;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return transactions;
}