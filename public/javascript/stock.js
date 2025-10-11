/// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== STOCK.JS LOADED ===");
  console.log("Checking for date filter elements...");

  // Check if buttons exist
  const applyBtn = document.getElementById('applyDateFilter');
  const clearBtn = document.getElementById('clearDateFilter');

  console.log("Apply button found:", !!applyBtn);
  console.log("Clear button found:", !!clearBtn);

  if (applyBtn && clearBtn) {
    console.log("Both date filter buttons found");
  } else {
    console.log("Date filter buttons not found - check HTML IDs");
  }

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
        styles: { fontSize: 5 },
        headStyles: { fillColor: [0, 119, 204] },
      });
      doc.save("Stock_Report.pdf");
    });
  }
}

// EXCEL EXPORT
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
function initializeSearch() {
  console.log("Initializing search...");

  const table = document.getElementById("newStock");
  if (!table) {
    console.log("Table not found for search");
    return;
  }

  const input = document.getElementById("searchStock");
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName("tr");
  const notFound = document.getElementById("notFound");

  if (!input) {
    console.log("Search input not found");
    return;
  }

  input.addEventListener("keyup", () => {
    const filter = input.value.toUpperCase();
    let hasResult = false;

    for (let i = 0; i < rows.length; i++) {
      // Skip summary rows in search
      if (rows[i].classList.contains('product-summary-row')) {
        rows[i].style.display = 'none';
        continue;
      }

      const cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
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

  console.log("Search functionality initialized");
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

// DATE FILTER
function initializeDateFilter() {
  console.log("Initializing date filter...");

  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  const clearDateFilterBtn = document.getElementById('clearDateFilter');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (!applyDateFilterBtn || !clearDateFilterBtn || !startDateInput || !endDateInput) {
    console.log("Date filter elements not found");
    return;
  }

  console.log("Date filter elements found");

  function parseTableDate(dateString) {
    if (!dateString) return null;

    const trimmedDate = dateString.trim();
    console.log(`Parsing date: "${trimmedDate}"`);

    // Handle DD/MM/YYYY format
    if (trimmedDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = trimmedDate.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    // Handle DD-MM-YYYY format  
    else if (trimmedDate.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      const parts = trimmedDate.split('-');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  function applyDateFilter() {
    console.log("Apply filter clicked");

    const startValue = startDateInput.value;
    const endValue = endDateInput.value;

    const allRows = document.querySelectorAll('#newStock tbody tr');
    let visibleCount = 0;

    // Show all rows first
    allRows.forEach(row => row.style.display = '');

    // If no dates selected, do nothing
    if (!startValue && !endValue) {
      document.getElementById('notFound').style.display = 'none';
      return;
    }

    // Filter rows
    allRows.forEach((row) => {
      // Skip summary rows
      if (row.classList.contains('product-summary-row')) {
        row.style.display = 'none';
        return;
      }

      const dateCell = row.cells[9]; // Column 9 for date
      if (!dateCell) {
        row.style.display = 'none';
        return;
      }

      const rowDateText = dateCell.textContent.trim();
      const rowDate = parseTableDate(rowDateText);

      if (!rowDate) {
        row.style.display = 'none';
        return;
      }

      let shouldShow = true;

      // Compare dates as strings (YYYY-MM-DD format)
      if (startValue && rowDate < startValue) {
        shouldShow = false;
      }

      if (endValue && shouldShow && rowDate > endValue) {
        shouldShow = false;
      }

      if (shouldShow) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // Show/hide not found message
    const notFound = document.getElementById('notFound');
    if (visibleCount === 0) {
      notFound.style.display = 'block';
      notFound.textContent = 'No stock items found for the selected date range';
    } else {
      notFound.style.display = 'none';
    }

    console.log(`Filter applied: ${visibleCount} rows visible`);
  }

  function clearDateFilter() {
    console.log("Clear filter clicked");

    startDateInput.value = '';
    endDateInput.value = '';

    const allRows = document.querySelectorAll('#newStock tbody tr');
    allRows.forEach(row => row.style.display = '');
    document.getElementById('notFound').style.display = 'none';

    console.log("Filter cleared: all rows visible");
  }

  // Add event listeners
  applyDateFilterBtn.addEventListener('click', applyDateFilter);
  clearDateFilterBtn.addEventListener('click', clearDateFilter);

  console.log("Date filter initialized");
}

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

// // FORM VALIDATION FUNCTIONALITY (for addStock page)
// function initializeFormValidation() {
//   const form = document.getElementById('addStock');
//   const resetBtn = document.getElementById('resetBtn');

//   if (!form) return;

//   // Get all form fields
//   const fields = {
//     pdtname: document.getElementById('pdtname'),
//     pdttype: document.getElementById('tproduct'),
//     pdtquantity1: document.getElementById('pdtquantity1'),
//     pdtquantity: document.getElementById('pdtquantity'),
//     cprice: document.getElementById('cprice'),
//     pdtprice: document.getElementById('pdtprice'),
//     supplier: document.getElementById('supplier'),
//     supplierContact: document.getElementById('supplierContact'),
//     quality: document.getElementById('quality'),
//     date: document.getElementById('date')
//   };

//   // Validation functions
//   const validators = {
//     pdtname: (value) => value.trim().length >= 2 && value.trim().length <= 100,
//     pdttype: (value) => value && value !== "",
//     pdtquantity1: (value) => value && parseInt(value) > 0,
//     pdtquantity: (value) => value && parseInt(value) >= 0,
//     cprice: (value) => value && parseFloat(value) >= 0,
//     pdtprice: (value) => value && parseFloat(value) >= 0,
//     supplier: (value) => value.trim().length >= 2 && value.trim().length <= 100,
//     supplierContact: (value) => {
//       const phoneRegex = /^[0-9]{9,12}$/;
//       const cleanValue = value.trim().replace(/\s+/g, '');
//       return phoneRegex.test(cleanValue);
//     },
//     quality: (value) => value && value !== "",
//     date: (value) => value && !isNaN(new Date(value).getTime())
//   };

//   // Error messages
//   const errorMessages = {
//     pdtname: "Please enter a valid product name (2-100 characters)",
//     pdttype: "Please select a product type",
//     pdtquantity1: "Please enter a valid total quantity (minimum 1)",
//     pdtquantity: "Please enter a valid remaining quantity (cannot be negative)",
//     cprice: "Please enter a valid cost price",
//     pdtprice: "Please enter a valid product price",
//     supplier: "Please enter a valid supplier name (2-100 characters)",
//     supplierContact: "Please enter a valid phone number (9-12 digits)",
//     quality: "Please select a quality level",
//     date: "Please select a valid date"
//   };

//   // Show error function
//   function showError(fieldName, message) {
//     const field = fields[fieldName];
//     const errorElement = document.getElementById(`${fieldName}-error`);

//     if (field && errorElement) {
//       field.classList.add('is-invalid');
//       field.classList.remove('is-valid');
//       errorElement.textContent = message;
//       errorElement.style.display = 'block';
//     }
//   }

//   // Show success function
//   function showSuccess(fieldName) {
//     const field = fields[fieldName];
//     const errorElement = document.getElementById(`${fieldName}-error`);

//     if (field && errorElement) {
//       field.classList.remove('is-invalid');
//       field.classList.add('is-valid');
//       errorElement.style.display = 'none';
//     }
//   }

//   // Validate single field
//   function validateField(fieldName) {
//     const field = fields[fieldName];
//     if (!field) return true;

//     const value = field.value;
//     const isValid = validators[fieldName](value);

//     if (!isValid) {
//       showError(fieldName, errorMessages[fieldName]);
//       return false;
//     } else {
//       showSuccess(fieldName);
//       return true;
//     }
//   }

//   // Validate entire form
//   function validateForm() {
//     let isValid = true;

//     Object.keys(fields).forEach(fieldName => {
//       if (!validateField(fieldName)) {
//         isValid = false;
//       }
//     });

//     // Additional validation: Remaining quantity shouldn't exceed total quantity
//     const totalQty = parseInt(fields.pdtquantity1.value);
//     const remainingQty = parseInt(fields.pdtquantity.value);

//     if (totalQty && remainingQty && remainingQty > totalQty) {
//       showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
//       isValid = false;
//     }

//     return isValid;
//   }

//   // Add event listeners to all fields for real-time validation
//   Object.keys(fields).forEach(fieldName => {
//     const field = fields[fieldName];
//     if (field) {
//       field.addEventListener('blur', () => validateField(fieldName));
//       field.addEventListener('input', () => {
//         if (field.classList.contains('is-invalid')) {
//           validateField(fieldName);
//         }
//       });
//     }
//   });

//   // Form submit event
//   form.addEventListener('submit', function (e) {
//     e.preventDefault();

//     if (validateForm()) {
//       console.log('Form is valid, submitting...');
//       this.submit();
//     } else {
//       const firstError = form.querySelector('.is-invalid');
//       if (firstError) {
//         firstError.scrollIntoView({
//           behavior: 'smooth',
//           block: 'center'
//         });
//         firstError.focus();
//       }
//     }
//   });

//   // Reset button functionality
//   if (resetBtn) {
//     resetBtn.addEventListener('click', function () {
//       Object.keys(fields).forEach(fieldName => {
//         const field = fields[fieldName];
//         const errorElement = document.getElementById(`${fieldName}-error`);

//         if (field && errorElement) {
//           field.classList.remove('is-invalid', 'is-valid');
//           errorElement.style.display = 'none';
//         }
//       });
//     });
//   }

//   // Additional validation for quantity comparison
//   if (fields.pdtquantity1 && fields.pdtquantity) {
//     fields.pdtquantity1.addEventListener('change', function () {
//       const totalQty = parseInt(this.value);
//       const remainingQty = parseInt(fields.pdtquantity.value);

//       if (totalQty && remainingQty && remainingQty > totalQty) {
//         showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
//       }
//     });

//     fields.pdtquantity.addEventListener('change', function () {
//       const totalQty = parseInt(fields.pdtquantity1.value);
//       const remainingQty = parseInt(this.value);

//       if (totalQty && remainingQty && remainingQty > totalQty) {
//         showError('pdtquantity', 'Remaining quantity cannot exceed total quantity');
//       }
//     });
//   }

//   console.log("Form validation initialized");
// }
