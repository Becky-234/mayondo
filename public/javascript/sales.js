// Side menu toggle
const sidebar = document.querySelector(".side-menu-container");
const toggleBtn = document.querySelector(".fa-bars");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  console.log("Sidebar toggled");
});


//PDF Export
const pdfBtn = document.getElementById("downloadPdf");
if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Sales Report", 14, 20);

    doc.autoTable({
      html: "#salesTable",
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 119, 204] },
    });
    doc.save("Sales_Report.pdf");
  });
}

//Excel Export
const excelBtn = document.getElementById("downloadExcel");
if (excelBtn) {
  excelBtn.addEventListener("click", () => {
    const table = document.getElementById("salesTable");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, "sales");
    XLSX.writeFile(wb, "Sales_Report.xlsx");
  });
}


// Search on the sales table
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("salesTable");
  if (!table) {
    // We are not on sales.html, so skip the search code
    return;
  }

  const input = document.getElementById("searchSale");
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName("tr");
  const notFound = document.getElementById("notFound");

  input.addEventListener("keyup", () => {
    const filter = input.value.toUpperCase();
    let hasResult = false;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
        //Use textContent or innerText, not cellTextContent
        const cellText = cells[j].textContent || cells[j].innerText;
        if (cellText.toUpperCase().includes(filter)) {
          found = true;
          hasResult = true;
          break;
        }
      }
      rows[i].style.display = found ? "" : "none";
    }
    notFound.style.display = hasResult ? "none" : "block";
  });
});


// Calculating Total
// const unitField = document.getElementById('unitPrice');
// const qtyField = document.getElementById('quantity');
// const totalField = document.getElementById('totalPrice');

// function updateTotal() {
//   const unitPrice = parseFloat(unitField.value);
//   const quantity = parseFloat(qtyField.value);
//   if (!isNaN(quantity) && !isNaN(unitPrice)) {
//     totalField.value = (quantity * unitPrice).toFixed(2);
//   } else {
//     totalField.value = "";
//   }
// }

// unitField.addEventListener('input', updateTotal);
// qtyField.addEventListener('input', updateTotal);


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
  const unitprice = document.getElementById('unitPrice');
  const qty = document.getElementById('quantity');
  const totalprice = document.getElementById('totalPrice');

  // Only run if elements exist
  if (unitprice && qty && totalprice) {
    function updateTotal() {
      const unitPrice = parseFloat(unitprice.value) || 0;
      const quantity = parseFloat(qty.value) || 0;
      if (!isNaN(quantity) && !isNaN(unitPrice)) {
        totalprice.value = (quantity * unitPrice).toFixed(2);
      } else {
        totalprice.value = "";
      }
    }

    unitprice.addEventListener('input', updateTotal);
    qty.addEventListener('input', updateTotal);
  }
});
 


// Table filtering functionality
document.addEventListener('DOMContentLoaded', function () {
  const productFilter = document.getElementById('productFilter');
  const searchInput = document.getElementById('searchSale');
  const notFoundMessage = document.getElementById('notFound');
  const tableRows = document.querySelectorAll('#salesTable tbody tr');

  // Filter table based on dropdown selection
  productFilter.addEventListener('change', function () {
    filterTable();
  });

  // Search functionality
  searchInput.addEventListener('input', function () {
    filterTable();
  });

  function filterTable() {
    const selectedFilter = productFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    let visibleRows = 0;

    tableRows.forEach(row => {
      const productType = row.getAttribute('data-type');
      const rowText = row.textContent.toLowerCase();

      // Check if row matches both filter and search criteria
      const matchesFilter = selectedFilter === 'all' ||
        selectedFilter === productType;

      const matchesSearch = searchTerm === '' || rowText.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        row.style.display = '';
        visibleRows++;
      } else {
        row.style.display = 'none';
      }
    });

    // Show/hide "Not Found" message
    if (notFoundMessage) {
      if (visibleRows === 0) {
        notFoundMessage.style.display = 'block';
        notFoundMessage.textContent = 'No sales found matching your criteria.';
      } else {
        notFoundMessage.style.display = 'none';
      }
    }

    // Update results count
    updateResultsCount(visibleRows);
  }

  function updateResultsCount(count) {
    // Remove existing count if any
    const existingCount = document.querySelector('.results-count');
    if (existingCount) {
      existingCount.remove();
    }

    // Add results count next to filter
    if (count >= 0) {
      const resultsCount = document.createElement('span');
      resultsCount.className = 'results-count';
      resultsCount.innerHTML = ` <span class="badge bg-secondary">${count} results</span>`;
      productFilter.parentNode.appendChild(resultsCount);
    }
  }

  // Initialize table on page load
  filterTable();
});