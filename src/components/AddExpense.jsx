import { useState } from "react";

function AddExpense({ onAdd }) {
  const [paidBy, setPaidBy] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paidBy || !amount || !participants) return;

    const expense = {
      paidBy,
      amount: Number(amount),
      participants: participants.split(",").map(p => p.trim())
    };

    onAdd(expense);

    setPaidBy("");
    setAmount("");
    setParticipants("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      
      <input
        placeholder="Paid by"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        placeholder="Participants (A,B,C)"
        value={participants}
        onChange={(e) => setParticipants(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <button>Add Expense</button>
    </form>
  );
}

export default AddExpense;