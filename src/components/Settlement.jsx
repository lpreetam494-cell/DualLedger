function Settlement({ transactions }) {
  return (
    <div>
      <h3>Settlements</h3>
      {transactions.map((t, i) => (
        <div key={i} className="expense-card">
          {t.from} → {t.to} : ₹{t.amount.toFixed(2)}
        </div>
      ))}
    </div>
  );
}
export default Settlement;