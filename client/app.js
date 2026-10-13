let expenses = [
  { id: 1, amount: 250, category: "Food", date: "2026-10-12", note: "Lunch" },
  {
    id: 2,
    amount: 1200,
    category: "Travel",
    date: "2026-10-10",
    note: "Train",
  },
];

const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");

function render() {
  list.innerHTML = "";
  let total = 0;

  expenses.forEach((expense) => {
    total += expense.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${expense.date} | ${expense.category} | ${expense.note} | ₹${expense.amount}</span>
      <button onclick="deleteExpense(${expense.id})">Delete</button>
    `;
    list.appendChild(li);
  });

  totalEl.textContent = total;
}

function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading

  expenses.push({
    id: Date.now(),
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    note: document.getElementById("note").value,
  });

  form.reset();
  render();
});

render();
