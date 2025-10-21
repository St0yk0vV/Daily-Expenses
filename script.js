const dateInput   = document.getElementById("date");
const descInput   = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addBtn      = document.getElementById("addBtn");
const clearBtn    = document.getElementById("clearBtn");
const exportCsvBtn  = document.getElementById("exportCsvBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importJsonInput = document.getElementById("importJsonInput");

const expenseList = document.getElementById("expenseList");
const totalSpan   = document.getElementById("total");
const todaySpan   = document.getElementById("today");

// --- Дата по подразбиране (днес)
const todayISO = new Date().toISOString().split("T")[0];
dateInput.value = todayISO;
todaySpan.textContent = todayISO;

// --- Зареди цялата база (всички дни) от localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || {};
if (!expenses[todayISO]) expenses[todayISO] = [];

// Унифицирано запазване
function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Рендер на избрания ден
function render(day = dateInput.value) {
  if (!expenses[day]) expenses[day] = [];
  expenseList.innerHTML = "";
  let total = 0;

  expenses[day].forEach((exp, index) => {
    const li = document.createElement("li");
    li.className = "expense-item";
    li.textContent = `${exp.desc} - ${Number(exp.amount).toFixed(2)} лв`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      expenses[day].splice(index, 1);
      save();
      render(day);
    };

    li.appendChild(delBtn);
    expenseList.appendChild(li);
    total += Number(exp.amount);
  });

  totalSpan.textContent = total.toFixed(2);
  todaySpan.textContent = day;
}

// Добавяне
addBtn.addEventListener("click", () => {
  const day = dateInput.value;
  const desc = (descInput.value || "").trim();
  const amount = Number(amountInput.value);

  if (!desc || !amount || amount <= 0) {
    alert("Please enter a valid description and a positive amount.");
    return;
  }

  if (!expenses[day]) expenses[day] = [];
  expenses[day].push({ desc, amount });
  save();

  descInput.value = "";
  amountInput.value = "";
  render(day);
});

// Смяна на деня от календара
dateInput.addEventListener("change", () => render(dateInput.value));

// Clear текущия ден
clearBtn.addEventListener("click", () => {
  const day = dateInput.value;
  if (!expenses[day] || expenses[day].length === 0) return;
  if (confirm(`Clear all expenses for ${day}?`)) {
    expenses[day] = [];
    save();
    render(day);
  }
});

// ----- Export CSV (всички дни)
exportCsvBtn.addEventListener("click", () => {
  const rows = [["date", "description", "amount"]];
  Object.entries(expenses).forEach(([day, list]) => {
    list.forEach(e => rows.push([day, e.desc, Number(e.amount).toFixed(2)]));
  });

  const csv = rows.map(r =>
    r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// ----- Backup JSON
exportJsonBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(expenses, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

// ----- Restore JSON
importJsonInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (typeof data !== "object" || Array.isArray(data)) throw new Error("Bad format");
    expenses = data;
    save();
    render(dateInput.value);
    alert("Backup restored successfully.");
  } catch (err) {
    alert("Invalid JSON backup file.");
  } finally {
    importJsonInput.value = "";
  }
});

// Първоначален рендер
render(todayISO);
