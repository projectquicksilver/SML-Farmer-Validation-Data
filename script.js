const CSV_URL = "https://raw.githubusercontent.com/USERNAME/REPO/main/data.csv"; 
// 🔴 Replace with your GitHub RAW CSV link

let rawData = [];
let filteredData = [];
let headers = [];

let currentPage = 1;
const rowsPerPage = 10;

// Fetch CSV
fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    parseCSV(text);
    initFilterOptions();
    renderTable();
  });

function parseCSV(text) {
  const rows = text.trim().split("\n").map(row => row.split(","));
  headers = rows.shift();
  rawData = rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  filteredData = [...rawData];
}

function initFilterOptions() {
  const select = document.getElementById("columnFilter");
  headers.forEach(h => {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    select.appendChild(option);
  });
}

function renderTable() {
  const table = document.getElementById("dataTable");
  table.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  pageData.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = row[h] || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${Math.ceil(filteredData.length / rowsPerPage)}`;
}

function applyFilter() {
  const column = document.getElementById("columnFilter").value;
  const value = document.getElementById("filterValue").value.toLowerCase();

  filteredData = rawData.filter(row =>
    row[column]?.toLowerCase().includes(value)
  );

  currentPage = 1;
  renderTable();
}

function resetFilter() {
  filteredData = [...rawData];
  document.getElementById("filterValue").value = "";
  currentPage = 1;
  renderTable();
}

document.getElementById("searchInput").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  filteredData = rawData.filter(row =>
    Object.values(row).some(v => v?.toLowerCase().includes(value))
  );
  currentPage = 1;
  renderTable();
});

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
    currentPage++;
    renderTable();
  }
}

function downloadCSV() {
  let csv = headers.join(",") + "\n";
  filteredData.forEach(row => {
    csv += headers.map(h => `"${row[h] || ""}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "filtered_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}
