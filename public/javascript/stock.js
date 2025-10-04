/// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== STOCK.JS LOADED ===");

  // Initialize all functionalities
  initializeSideMenu();
  initializePDFExport();
  initializeExcelExport();
  initializeSearch();
  initializeProductFilter();
  initializeDateFilter();
  initializeAlerts();
  initializeModals();
});

// MODAL INITIALIZATION FUNCTION
function initializeModals() {
  console.log("Initializing modals...");
  window.closeMessageModal = closeMessageModal;
  window.showDeleteModal = showDeleteModal;
}

// MODAL FUNCTIONS
function closeMessageModal() {
  const modals = document.querySelectorAll('.modal.show.d-block');
  modals.forEach(modal => {
    modal.classList.remove('show', 'd-block');
    modal.classList.add('fade');
  });
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Close modal when clicking outside
document.addEventListener('click', function (event) {
  const modals = document.querySelectorAll('.modal.show.d-block');
  modals.forEach(modal => {
    if (event.target === modal) {
      closeMessageModal();
    }
  });
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeMessageModal();
  }
});

// Show delete confirmation modal
function showDeleteModal(stockId) {
  document.getElementById('deleteStockId').value = stockId;
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  deleteModal.show();
}

// Side menu functionality
function initializeSideMenu() {
  const sidebar = document.querySelector(".side-menu-container");
  const toggleBtn = document.querySelector(".fa-bars");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
}

// PDF Export
function initializePDFExport() {
  const pdfBtn = document.getElementById("downloadPdf");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text("Stock Report", 14, 20);
      doc.autoTable({
        html: "#newStock",
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 119, 204] },
      });
      doc.save("Stock_Report.pdf");
    });
  }
}

// Excel Export
function initializeExcelExport() {
  const excelBtn = document.getElementById("downloadExcel");
  if (excelBtn) {
    excelBtn.addEventListener("click", () => {
      const table = document.getElementById("newStock");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.table_to_sheet(table);
      XLSX.utils.book_append_sheet(wb, ws, "stock");
      XLSX.writeFile(wb, "Stock_Report.xlsx");
    });
  }
}

// Search Functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchStock");
  const table = document.getElementById("newStock");
  if (!searchInput || !table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const allRows = Array.from(tbody.getElementsByTagName("tr"));
  const notFound = document.getElementById("notFound");

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    let foundCount = 0;

    allRows.forEach(row => {
      row.style.display = '';
    });

    if (searchTerm) {
      allRows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        let matchesSearch = false;
        for (let cell of cells) {
          if (cell.textContent.toLowerCase().includes(searchTerm)) {
            matchesSearch = true;
            break;
          }
        }
        if (matchesSearch) {
          foundCount++;
        } else {
          row.style.display = 'none';
        }
      });
    }

    if (notFound) {
      notFound.style.display = (searchTerm && foundCount === 0) ? 'block' : 'none';
    }
  });
}

// PRODUCT TYPE FILTER
function initializeProductFilter() {
  const productFilter = document.getElementById('productFilter');
  const table = document.getElementById('newStock');
  if (!productFilter || !table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const notFoundMessage = document.getElementById('notFound');

  productFilter.addEventListener('change', function () {
    const filterValue = this.value.toLowerCase();
    let visibleRows = 0;
    let groupVisible = false;

    rows.forEach(row => {
      row.style.display = '';
    });

    rows.forEach(row => {
      if (row.classList.contains('product-summary-row')) {
        if (groupVisible) {
          row.style.display = '';
          visibleRows++;
        } else {
          row.style.display = 'none';
        }
        groupVisible = false;
        return;
      }

      const productType = row.cells[1].textContent.toLowerCase();
      let shouldShowRow = false;

      if (filterValue === 'all') {
        shouldShowRow = true;
      } else if (filterValue === 'raw' && productType.includes('raw')) {
        shouldShowRow = true;
      } else if (filterValue === 'furniture' && productType.includes('furniture')) {
        shouldShowRow = true;
      }

      if (shouldShowRow) {
        row.style.display = '';
        visibleRows++;
        groupVisible = true;
      } else {
        row.style.display = 'none';
      }
    });

    if (visibleRows === 0 && filterValue !== 'all') {
      notFoundMessage.style.display = 'block';
      notFoundMessage.textContent = 'No stock items found for the selected product type';
    } else {
      notFoundMessage.style.display = 'none';
    }
  });
}

// DATE FILTER - HANDLES DD/MM/YYYY FORMAT
function initializeDateFilter() {
  console.log("🔄 Initializing date filter...");

  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  const clearDateFilterBtn = document.getElementById('clearDateFilter');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (!applyDateFilterBtn || !clearDateFilterBtn || !startDateInput || !endDateInput) {
    console.log("Date filter elements not found");
    return;
  }

  console.log("Date filter elements found");

  // CONVERT DD/MM/YYYY to Date object
  function parseTableDate(dateString) {
    if (!dateString) return null;

    console.log(`Parsing table date: "${dateString}"`);

    // Handle DD/MM/YYYY format (from your table)
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = dateString.split('/');
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Months are 0-based
      const year = parseInt(parts[2]);
      const date = new Date(year, month, day);

      if (!isNaN(date.getTime())) {
        console.log(`Success: ${date}`);
        return date;
      }
    }

    console.log(`Failed to parse: "${dateString}"`);
    return null;
  }

  // CONVERT YYYY-MM-DD to Date object (from HTML input)
  function parseInputDate(dateString) {
    if (!dateString) return null;

    console.log(`Parsing input date: "${dateString}"`);

    // Handle YYYY-MM-DD format (from HTML date input)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        console.log(`Success: ${date}`);
        return date;
      }
    }

    console.log(`Failed to parse: "${dateString}"`);
    return null;
  }

  function applyDateFilter() {
    const startValue = startDateInput.value; // This will be YYYY-MM-DD
    const endValue = endDateInput.value;     // This will be YYYY-MM-DD

    console.log("Raw input values:", startValue, "to", endValue);

    const startDate = parseInputDate(startValue);
    const endDate = parseInputDate(endValue);

    console.log("Parsed filter dates:", startDate, endDate);

    const allRows = document.querySelectorAll('#newStock tbody tr');
    let visibleCount = 0;

    // Show all rows first
    allRows.forEach(row => row.style.display = '');

    // If no dates selected, do nothing
    if (!startValue && !endValue) {
      console.log("No dates selected - showing all rows");
      document.getElementById('notFound').style.display = 'none';
      return;
    }

    // Filter rows
    allRows.forEach((row, index) => {
      // Skip summary rows
      if (row.classList.contains('product-summary-row')) {
        row.style.display = 'none';
        return;
      }

      // Get date from column 9 (Date column)
      const dateCell = row.cells[9];
      if (!dateCell) {
        row.style.display = 'none';
        return;
      }

      const rowDateText = dateCell.textContent.trim();
      const rowDate = parseTableDate(rowDateText); // This is DD/MM/YYYY format

      console.log(`Row ${index}: Table date "${rowDateText}" -> Parsed: ${rowDate}`);

      if (!rowDate) {
        row.style.display = 'none';
        return;
      }

      let shouldShow = true;

      // Check start date (rowDate should be >= startDate)
      if (startDate && rowDate < startDate) {
        shouldShow = false;
        console.log(`Row ${index}: Before start date`);
      }

      // Check end date (rowDate should be <= endDate)  
      if (endDate && shouldShow) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (rowDate > endOfDay) {
          shouldShow = false;
          console.log(`Row ${index}: After end date`);
        }
      }

      if (shouldShow) {
        row.style.display = '';
        visibleCount++;
        console.log(`Row ${index}: SHOW - Date is within range`);
      } else {
        row.style.display = 'none';
      }
    });

    console.log(`Result: ${visibleCount} rows visible`);

    // Show/hide not found message
    const notFound = document.getElementById('notFound');
    if (visibleCount === 0) {
      notFound.style.display = 'block';
      notFound.textContent = 'No stock items found for the selected date range';
      console.log("Showing 'not found' message");
    } else {
      notFound.style.display = 'none';
      console.log("Hiding 'not found' message");
    }
  }

  function clearDateFilter() {
    console.log("Clearing filter");

    startDateInput.value = '';
    endDateInput.value = '';

    // Show all rows including summary rows
    const allRows = document.querySelectorAll('#newStock tbody tr');
    allRows.forEach(row => row.style.display = '');

    // Hide not found message
    document.getElementById('notFound').style.display = 'none';

    console.log("All rows visible");
  }

  // Add event listeners
  applyDateFilterBtn.addEventListener('click', applyDateFilter);
  clearDateFilterBtn.addEventListener('click', clearDateFilter);

  // Auto-apply when dates change
  startDateInput.addEventListener('change', applyDateFilter);
  endDateInput.addEventListener('change', applyDateFilter);

  console.log("Date filter ready! Use: From 2025-08-30 to 2025-10-02");
}

// TEST FUNCTION - Run this in console
window.testDateFilter = function () {

  // Set test dates that should show your data
  document.getElementById('startDate').value = '2025-09-01';
  document.getElementById('endDate').value = '2025-10-03';

  console.log("Set test range: 2025-09-01 to 2025-10-03");
  console.log("This should show dates: 01/10/2025, 02/10/2025, 03/10/2025");

  // Apply filter
  const event = new Event('change');
  document.getElementById('startDate').dispatchEvent(event);
};


// ALERTS FUNCTIONALITY
function initializeAlerts() {
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      } else {
        alert.style.display = 'none';
      }
    });
  }, 5000);
}