import { useState } from "react";

function PersonalExpense() {
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    amount: "",
    category: "",
    paymentMode: "",
    note: "",
    description: "",
    split: false
  });

  const categories = ["Food", "Travel", "Shopping", "Bills"];
  const paymentModes = ["Cash", "UPI", "Card"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addExpense = () => {
    if (!form.amount) return;

    setExpenses([...expenses, form]);

    setForm({
      amount: "",
      category: "",
      paymentMode: "",
      note: "",
      description: "",
      split: false
    });
  };

  return (
    <div className="card">
      <h2>Personal Expenses</h2>

      <input
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
      />

      {/* Category */}
      <select name="category" value={form.category} onChange={handleChange}>
        <option value="">Select Category</option>
        {categories.map((c, i) => (
          <option key={i}>{c}</option>
        ))}
        <option value="custom">+ Add Custom</option>
      </select>

      {form.category === "custom" && (
        <input
          name="category"
          placeholder="Enter custom category"
          onChange={handleChange}
        />
      )}

      {/* Payment Mode */}
      <select name="paymentMode" value={form.paymentMode} onChange={handleChange}>
        <option value="">Payment Mode</option>
        {paymentModes.map((p, i) => (
          <option key={i}>{p}</option>
        ))}
        <option value="custom">+ Add Custom</option>
      </select>

      {form.paymentMode === "custom" && (
        <input
          name="paymentMode"
          placeholder="Enter custom mode"
          onChange={handleChange}
        />
      )}

      <input
        name="note"
        placeholder="Short note"
        value={form.note}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      {/* Split Toggle */}
      <label>
        <input
          type="checkbox"
          name="split"
          checked={form.split}
          onChange={handleChange}
        />
        Split this expense
      </label>

      <button onClick={addExpense}>Add Expense</button>

      <hr />

      {/* List */}
      {expenses.map((e, i) => (
  <div key={i} className="expense-card">
    <strong>₹{e.amount}</strong> - {e.category}
    <br />
    <small>{e.paymentMode} • {e.note}</small>
    <br />
    {e.split && <span>🔄 Split</span>}
  </div>
))}
    </div>
  );
}

export default PersonalExpense;