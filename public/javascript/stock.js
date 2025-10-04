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

// SIDEBAR FUNCTIONALITY
function initializeSideMenu() {
  const sidebar = document.querySelector(".side-menu-container");
  const toggleBtn = document.querySelector(".fa-bars");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
}

// PDF EXPORT
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


// Excel EXPORT
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


// SEARCH FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("newStock");
  if (!table) {
    return;
  }

  const input = document.getElementById("searchStock");
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


// FORM VALIDATION FUNCTIONALITY (Only for addStock page)
function initializeFormValidation() {
  const form = document.getElementById('addStock');
  const resetBtn = document.getElementById('resetBtn');

  if (!form) return;

  // Get all form fields
  const fields = {
    pdtname: document.getElementById('pdtname'),
    pdttype: document.getElementById('tproduct'),
    pdtquantity1: document.getElementById('pdtquantity1'),
    pdtquantity: document.getElementById('pdtquantity'),
    cprice: document.getElementById('cprice'),
    pdtprice: document.getElementById('pdtprice'),
    supplier: document.getElementById('supplier'),
    supplierContact: document.getElementById('supplierContact'),
    quality: document.getElementById('quality'),
    date: document.getElementById('date')
  };

  // Validation functions
  const validators = {
    pdtname: (value) => value.trim().length >= 2 && value.trim().length <= 100,
    pdttype: (value) => value && value !== "",
    pdtquantity1: (value) => value && parseInt(value) > 0,
    pdtquantity: (value) => value && parseInt(value) >= 0,
    cprice: (value) => value && parseFloat(value) >= 0,
    pdtprice: (value) => value && parseFloat(value) >= 0,
    supplier: (value) => value.trim().length >= 2 && value.trim().length <= 100,
    supplierContact: (value) => {
      const phoneRegex = /^[0-9]{9,12}$/; // Accepts 9-12 digit numbers
      const cleanValue = value.trim().replace(/\s+/g, ''); // Remove spaces
      return phoneRegex.test(cleanValue);
    },
    quality: (value) => value && value !== "",
    date: (value) => value && !isNaN(new Date(value).getTime())
  };

  // Error messages
  const errorMessages = {
    pdtname: "Please enter a valid product name (2-100 characters)",
    pdttype: "Please select a product type",
    pdtquantity1: "Please enter a valid total quantity (minimum 1)",
    pdtquantity: "Please enter a valid remaining quantity (cannot be negative)",
    cprice: "Please enter a valid cost price",
    pdtprice: "Please enter a valid product price",
    supplier: "Please enter a valid supplier name (2-100 characters)",
    supplierContact: "Please enter a valid phone number (9-12 digits)",
    quality: "Please select a quality level",
    date: "Please select a valid date"
  };

  // Show error function
  function showError(fieldName, message) {
    const field = fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (field && errorElement) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  // Show success function
  function showSuccess(fieldName) {
    const field = fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (field && errorElement) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      errorElement.style.display = 'none';
    }
  }

  // Validate single field
  function validateField(fieldName) {
    const field = fields[fieldName];
    if (!field) return true;

    const value = field.value;
    const isValid = validators[fieldName](value);

    if (!isValid) {
      showError(fieldName, errorMessages[fieldName]);
      return false;
    } else {
      showSuccess(fieldName);
      return true;
    }
  }

  // Validate entire form
  function validateForm() {
    let isValid = true;

    Object.keys(fields).forEach(fieldName => {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });

    // Additional validation: Remaining quantity shouldn't exceed total quantity
    const totalQty = parseInt(fields.pdtquantity1.value);
    const remainingQty = parseInt(fields.pdtquantity.value);

    if (totalQty && remainingQty && remainingQty > totalQty) {
      showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
      isValid = false;
    }

    return isValid;
  }

  // Add event listeners to all fields for real-time validation
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    if (field) {
      field.addEventListener('blur', () => validateField(fieldName));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validateField(fieldName);
        }
      });
    }
  });

  // Form submit event
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (validateForm()) {
      // Form is valid, you can submit it
      console.log('Form is valid, submitting...');
      this.submit();
    } else {
      // Scroll to first error
      const firstError = form.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        firstError.focus();
      }
    }
  });

  // Reset button functionality
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      // Clear all validation states
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (field && errorElement) {
          field.classList.remove('is-invalid', 'is-valid');
          errorElement.style.display = 'none';
        }
      });
    });
  }

  // Additional validation for quantity comparison
  if (fields.pdtquantity1 && fields.pdtquantity) {
    fields.pdtquantity1.addEventListener('change', function () {
      const totalQty = parseInt(this.value);
      const remainingQty = parseInt(fields.pdtquantity.value);

      if (totalQty && remainingQty && remainingQty > totalQty) {
        showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
      }
    });

    fields.pdtquantity.addEventListener('change', function () {
      const totalQty = parseInt(fields.pdtquantity1.value);
      const remainingQty = parseInt(this.value);

      if (totalQty && remainingQty && remainingQty > totalQty) {
        showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
      }
    });
  }

  console.log("Form validation initialized");
}

// Initialize form validation when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeFormValidation();
});
