const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");
const expenseList = document.getElementById("expenseList");
const totalSpan = document.getElementById("total");
const todaySpan = document.getElementById("today");

const todayDate = new Date().toISOString().split('T')[0];
todaySpan.textContent = todayDate;

// Зареждане от localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || {};

if (!expenses[todayDate]) {
  expenses[todayDate] = [];
}

function renderExpenses() {
  expenseList.innerHTML = "";
  let total = 0;

  expenses[todayDate].forEach((exp, index) => {
    const li = document.createElement("li");
    li.className = "expense-item";
    li.textContent = `${exp.desc} - ${exp.amount} лв`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      expenses[todayDate].splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
    };

    li.appendChild(delBtn);
    expenseList.appendChild(li);
    total += parseFloat(exp.amount);
  });

  totalSpan.textContent = total.toFixed(2);
}

addBtn.addEventListener("click", () => {
  if (!descInput.value || !amountInput.value) {
    alert("Please fill in all fields!");
    return;
  }

  const newExp = {
    desc: descInput.value.trim(),
    amount: amountInput.value
  };

  expenses[todayDate].push(newExp);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  descInput.value = "";
  amountInput.value = "";

  renderExpenses();
});

renderExpenses();
