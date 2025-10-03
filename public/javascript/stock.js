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
  initializeModals(); // ADD THIS LINE - MODALS INITIALIZATION
  initializeFormValidation(); // Only if you're on the addStock page
});

// MODAL INITIALIZATION FUNCTION
function initializeModals() {
  console.log("Initializing modals...");

  // Make modal functions globally available
  window.closeMessageModal = closeMessageModal;
  window.showDeleteModal = showDeleteModal;
}

// MODAL FUNCTIONS - KEEP THESE AS THEY ARE
function closeMessageModal() {
  // Remove the modal from DOM
  const modals = document.querySelectorAll('.modal.show.d-block');
  modals.forEach(modal => {
    modal.classList.remove('show', 'd-block');
    modal.classList.add('fade');
  });

  // Remove backdrop
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());

  // Enable body scrolling
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
      console.log("Sidebar toggled");
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

  if (!searchInput || !table) {
    console.error("Search elements not found");
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const allRows = Array.from(tbody.getElementsByTagName("tr"));
  const notFound = document.getElementById("notFound");

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
    }
  });

  console.log("Search functionality initialized");
}

// Product Type Filter
function initializeProductFilter() {
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
  const notFoundMessage = document.getElementById('notFound');

  productFilter.addEventListener('change', function () {
    const filterValue = this.value.toLowerCase();

    let visibleRows = 0;
    let groupVisible = false;

    // Reset all rows first
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

  console.log("Product filter functionality initialized");
}

 
// DATE FILTER - FIXED VERSION
function initializeDateFilter() {
  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  const clearDateFilterBtn = document.getElementById('clearDateFilter');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (!applyDateFilterBtn || !clearDateFilterBtn || !startDateInput || !endDateInput) {
    console.log("Date filter elements not found - skipping date filter initialization");
    return;
  }

  console.log("Date filter initialized");

  // Function to check if date filter is active
  function isDateFilterActive() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    return startDate || endDate;
  }

  // Function to toggle columns based on date filter state
  function toggleColumnsBasedOnDateFilter() {
    const isDateActive = isDateFilterActive();
    const optionalColumns = document.querySelectorAll('.col-optional');
    const essentialColumns = document.querySelectorAll('.col-essential');

    if (isDateActive) {
      // Hide optional columns when date filtering
      optionalColumns.forEach(col => {
        col.style.display = 'none';
      });
      // Ensure essential columns are visible
      essentialColumns.forEach(col => {
        col.style.display = '';
      });
    } else {
      // Show all columns when no date filter
      optionalColumns.forEach(col => {
        col.style.display = '';
      });
    }
  }

  // SIMPLE DATE PARSING FUNCTION
  function parseDate(dateString) {
    if (!dateString) return null;

    const clean = dateString.trim();
    console.log(`Parsing date: "${clean}"`);

    // Try MM/DD/YYYY format
    if (clean.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = clean.split('/');
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const date = new Date(year, month, day);

      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  // FIXED FILTER APPLICATION FUNCTION
  function applyDateFilter() {
    console.log("=== APPLYING DATE FILTER ===");

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;

    console.log("Input dates - Start:", startDateValue, "End:", endDateValue);

    // Parse filter dates
    const startDate = startDateValue ? parseDate(startDateValue) : null;
    const endDate = endDateValue ? parseDate(endDateValue) : null;

    console.log("Parsed filter dates - Start:", startDate, "End:", endDate);

    const allRows = document.querySelectorAll('#newStock tbody tr');
    const notFoundMessage = document.getElementById('notFound');

    let visibleRows = 0;

    console.log("Total rows to process:", allRows.length);

    // Reset all rows first
    allRows.forEach(row => {
      row.style.display = '';
    });

    // If no date filters are set, show everything including summary rows
    if (!startDate && !endDate) {
      console.log("No date filter applied - showing all rows including summaries");
      toggleColumnsBasedOnDateFilter();
      if (notFoundMessage) notFoundMessage.style.display = 'none';
      return;
    }

    // Process each row - HIDE SUMMARY ROWS WHEN DATE FILTERING
    allRows.forEach((row, index) => {
      // Hide all summary rows when date filtering is active
      if (row.classList.contains('product-summary-row')) {
        row.style.display = 'none';
        console.log(`Row ${index}: HIDDEN (summary row during date filter)`);
        return;
      }

      // Regular data row - look for date in column 9 (based on your table structure)
      const dateCell = row.cells[9]; // Date is in column 9 (0-based index)
      if (!dateCell) {
        console.log(`Row ${index}: No date cell found - hiding`);
        row.style.display = 'none';
        return;
      }

      const rowDateText = dateCell.textContent.trim();
      const rowDate = parseDate(rowDateText);

      console.log(`Row ${index}: Date text = "${rowDateText}", Parsed date =`, rowDate);

      if (!rowDate) {
        console.log(`Row ${index}: Invalid date - hiding`);
        row.style.display = 'none';
        return;
      }

      // Check if row date is within filter range
      let shouldShow = true;

      // Clone dates for comparison
      const rowDateCopy = new Date(rowDate);
      const startDateCopy = startDate ? new Date(startDate) : null;
      const endDateCopy = endDate ? new Date(endDate) : null;

      // Reset times for date-only comparison
      rowDateCopy.setHours(0, 0, 0, 0);
      if (startDateCopy) startDateCopy.setHours(0, 0, 0, 0);
      if (endDateCopy) endDateCopy.setHours(23, 59, 59, 999);

      if (startDateCopy && endDateCopy) {
        shouldShow = rowDateCopy >= startDateCopy && rowDateCopy <= endDateCopy;
      } else if (startDateCopy) {
        shouldShow = rowDateCopy >= startDateCopy;
      } else if (endDateCopy) {
        shouldShow = rowDateCopy <= endDateCopy;
      }

      if (shouldShow) {
        row.style.display = '';
        visibleRows++;
        console.log(`Row ${index}: VISIBLE (date in range)`);
      } else {
        row.style.display = 'none';
        console.log(`Row ${index}: HIDDEN (date out of range)`);
      }
    });

    console.log("Final visible data rows:", visibleRows);

    // Update not found message
    if (notFoundMessage) {
      if (visibleRows === 0) {
        notFoundMessage.style.display = 'block';
        notFoundMessage.textContent = 'No stock items found for the selected date range';
        console.log("No items found - showing not found message");
      } else {
        notFoundMessage.style.display = 'none';
        console.log("Items found - hiding not found message");
      }
    }

    // Update columns visibility - this will hide the empty columns
    toggleColumnsBasedOnDateFilter();
  }

  // Clear date filter function
  function clearDateFilter() {
    console.log('Clearing date filter');

    // Clear date inputs
    startDateInput.value = '';
    endDateInput.value = '';

    // Show all rows including summary rows
    const allRows = document.querySelectorAll('#newStock tbody tr');
    allRows.forEach(row => {
      row.style.display = '';
    });

    // Hide not found message
    const notFoundMessage = document.getElementById('notFound');
    if (notFoundMessage) {
      notFoundMessage.style.display = 'none';
    }

    // Reset columns to show all
    toggleColumnsBasedOnDateFilter();

    console.log('Date filter cleared - showing all rows and columns');
  }

  // Add event listeners
  applyDateFilterBtn.addEventListener('click', applyDateFilter);
  clearDateFilterBtn.addEventListener('click', clearDateFilter);

  // Auto-apply when dates change
  startDateInput.addEventListener('change', applyDateFilter);
  endDateInput.addEventListener('change', applyDateFilter);

  // Initialize column state
  toggleColumnsBasedOnDateFilter();

  console.log("Date filter functionality initialized successfully");
}

// ALERTS FUNCTIONALITY
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
      const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
      return phoneRegex.test(value.trim());
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
    supplierContact: "Please enter a valid supplier contact (phone number)",
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


 