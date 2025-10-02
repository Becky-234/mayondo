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


// Form Validation Functionality
document.addEventListener("DOMContentLoaded", function () {
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
});