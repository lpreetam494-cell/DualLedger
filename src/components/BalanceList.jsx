function BalanceList({ balances }) {
  return (
    <div>
      <h3>Balances</h3>
      {Object.entries(balances).map(([person, amount]) => (
        <div key={person} className="expense-card">
          {person}: 
          <span className={amount > 0 ? "positive" : "negative"}>
            ₹{amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
export default BalanceList;