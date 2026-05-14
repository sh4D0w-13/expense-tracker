import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  //chart data
  const chartData = expenses.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.category);

    if (existing) {
      existing.value += Number(exp.amount);
    } else {
      acc.push({
        name: exp.category,
        value: Number(exp.amount),
      });
    }

    return acc;
  }, []);

  // form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // fetch expenses
  const fetchExpenses = () => {
    const token = localStorage.getItem("token");

    fetch("https://expense-tracker-api-bis4.onrender.com/api/expenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    fetch("https://expense-tracker-api-bis4.onrender.com/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        amount,
        category,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle("");
        setAmount("");
        setCategory("");

        fetchExpenses(); // refresh list
      })
      .catch((err) => console.log(err));
  };

  //delete button function
  const handleDelete = (id) => {
    const token = localStorage.getItem("token");

    fetch(`https://expense-tracker-api-bis4.onrender.com/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        fetchExpenses(); // refresh UI
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h1 style={{ textAlign: "center" }}>💰 Expense Dashboard</h1>

      <div style={{ textAlign: "right", marginBottom: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout 🚪
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: "1", padding: "10px" }}
        />

        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flex: "1", padding: "10px" }}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: "1", padding: "10px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      <hr />

      {/* 🟣 CARDS + CHARTS BELOW */}
      {/* your expense map + pie chart here */}

      {/* TOP SUMMARY CARD */}
      <div
        style={{
          background: "#111",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <h2>Total Spending</h2>
        <h1>₹{total}</h1>
      </div>

      {/* CHART */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <PieChart width={300} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {expenses.map((exp) => (
          <div
            key={exp.id}
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{exp.title}</h3>
            <p>₹{exp.amount}</p>
            <p style={{ color: "gray" }}>{exp.category}</p>

            <button
              type="button"
              onClick={() => handleDelete(exp.id)}
              style={{
                marginTop: "10px",
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
