// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Side menu functionality
  const sidebar = document.querySelector(".side-menu-container");
  const toggleBtn = document.querySelector(".fa-bars");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      console.log("Sidebar toggled");
    });
  }

  // PDF Export
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

  // Excel Export
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

  // Search Functionality - STANDALONE
  function initializeSearch() {
    const searchInput = document.getElementById("searchStock");
    const table = document.getElementById("newStock");

    if (!searchInput || !table) {
      console.error("Search elements not found");
      return;
    }

    // Store original rows for reset
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const allRows = Array.from(tbody.getElementsByTagName("tr"));
    const notFound = document.getElementById("notFound");

    // If notFound element doesn't exist, create it
    if (!notFound) {
      console.warn("notFound element not found in HTML");
      return; // Or create it dynamically if you prefer
    }

    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim();
      let foundCount = 0;

      // Reset all rows first
      allRows.forEach(row => {
        row.style.display = '';
      });

      // If search term exists, filter rows
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

      // Show not found message
      if (notFound) {
        notFound.style.display = (searchTerm && foundCount === 0) ? 'block' : 'none';
        console.log('Not found display:', notFound.style.display); // Debug log
      }
    });

    console.log("Search functionality initialized");
  }

  // Filter Functionality
  function initializeFilter() {
    const productFilter = document.getElementById('productFilter');
    const table = document.getElementById('newStock');

    if (!productFilter || !table) {
      console.error("Filter elements not found");
      return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
      console.error('Table body not found');
      return;
    }

    const rows = tbody.querySelectorAll('tr');

    productFilter.addEventListener('change', function () {
      const filterValue = this.value.toLowerCase();

      rows.forEach(row => {
        if (filterValue === 'all') {
          // Show all rows when "All" is selected
          row.style.display = '';
          return;
        }

        const cells = row.getElementsByTagName('td');
        let shouldShowRow = false;

        // Check if any cell matches the filter criteria
        for (let i = 0; i < cells.length; i++) {
          const cellText = cells[i].textContent.toLowerCase().trim();
          if (cellText === filterValue) {
            shouldShowRow = true;
            break;
          }
        }

        row.style.display = shouldShowRow ? '' : 'none';
      });
    });

    console.log("Filter functionality initialized");
  }


  // Alerts Functionality
  function initializeAlerts() {
    // Auto-hide alerts after 5 seconds
    setTimeout(() => {
      const alerts = document.querySelectorAll('.alert');
      alerts.forEach(alert => {
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
          const bsAlert = new bootstrap.Alert(alert);
          bsAlert.close();
        } else {
          // Fallback: hide manually
          alert.style.display = 'none';
        }
      });
    }, 5000);
  }

  // Initialize all functionalities
  initializeSearch();
  initializeFilter();
  initializeAlerts();
});