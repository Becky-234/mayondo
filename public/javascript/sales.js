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


// PRODUCT FILTERING FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function () {
  const productFilter = document.getElementById('productFilter');
  const tableBody = document.querySelector('#salesTable tbody.row-others');

  if (!productFilter || !tableBody) {
    console.error('Required elements not found');
    return;
  }

  const rows = tableBody.querySelectorAll('tr');

  // Debug: Check what's in each product type cell
  console.log('=== DEBUG: Product Type Values ===');
  rows.forEach((row, index) => {
    if (row.cells.length > 3) {
      const productTypeCell = row.cells[3];
      console.log(`Row ${index}: "${productTypeCell.textContent}"`);
    }
  });

  productFilter.addEventListener('change', function () {
    const filterValue = this.value;
    console.log(`Filter changed to: ${filterValue}`);

    let visibleCount = 0;

    rows.forEach(row => {
      // Check if this is the "No sales records found" row
      if (row.cells.length <= 1) {
        return; // Skip this row
      }

      // Get the product type from the FOURTH table cell (index 3) - Product Type column
      const productTypeCell = row.cells[3]; // Fourth column (Product Type)
      const productType = productTypeCell.textContent.toLowerCase().trim();

      console.log(`Checking row with product type: "${productType}"`);

      let shouldShow = false;

      switch (filterValue) {
        case 'all':
          shouldShow = true;
          break;
        case 'raw':
          // Show rows where product type contains "raw"
          shouldShow = productType.includes('raw');
          console.log(`  - Raw filter: ${shouldShow} (contains 'raw': ${productType.includes('raw')})`);
          break;
        case 'furniture':
          // Show rows where product type contains "furniture"
          shouldShow = productType.includes('furniture');
          console.log(`  - Furniture filter: ${shouldShow} (contains 'furniture': ${productType.includes('furniture')})`);
          break;
        default:
          shouldShow = true;
      }

      row.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    console.log(`Total visible rows: ${visibleCount}`);
  });
});


//STOCK ALEART
function updateStockAlert() {
  const productSelect = document.getElementById('nproduct');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const alertContainer = document.getElementById('stockAlertContainer');
  const alertDiv = document.getElementById('stockAlert');
  const quantityInput = document.getElementById('quantity');
  const quantityAlert = document.getElementById('quantityAlert');

  if (selectedOption && selectedOption.dataset.stockStatus) {
    const status = selectedOption.dataset.stockStatus;
    const message = selectedOption.dataset.alertMessage;
    const availableStock = parseInt(selectedOption.dataset.stockQuantity);

    // Set max quantity to available stock
    quantityInput.max = availableStock;

    if (status !== 'normal') {
      alertDiv.className = 'stock-alert ' + status;
      alertDiv.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <strong>${message}</strong>
          ${status === 'out-of-stock' ? ' - Cannot be sold' : ''}
        `;
      alertContainer.style.display = 'block';

      // Disable quantity input if out of stock
      if (status === 'out-of-stock') {
        quantityInput.disabled = true;
        quantityInput.value = '';
      } else {
        quantityInput.disabled = false;
      }
    } else {
      alertContainer.style.display = 'none';
      quantityInput.disabled = false;
    }
  } else {
    alertContainer.style.display = 'none';
    quantityInput.disabled = false;
  }

  validateQuantity();
}

function validateQuantity() {
  const productSelect = document.getElementById('nproduct');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const quantityInput = document.getElementById('quantity');
  const quantityAlert = document.getElementById('quantityAlert');
  const availableStock = parseInt(selectedOption.dataset.stockQuantity);
  const requestedQuantity = parseInt(quantityInput.value) || 0;

  if (selectedOption && !selectedOption.disabled) {
    if (requestedQuantity > availableStock) {
      quantityAlert.textContent = `Cannot exceed available stock (${availableStock} units)`;
      quantityAlert.style.display = 'block';
      quantityInput.setCustomValidity('Quantity exceeds available stock');
    } else if (availableStock - requestedQuantity <= 5 && requestedQuantity > 0) {
      quantityAlert.textContent = `Warning: This sale will leave only ${availableStock - requestedQuantity} units in stock`;
      quantityAlert.style.display = 'block';
      quantityInput.setCustomValidity('');
    } else {
      quantityAlert.style.display = 'none';
      quantityInput.setCustomValidity('');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  updateStockAlert();
});


setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    const bsAlert = new bootstrap.Alert(alert);
    bsAlert.close();
  });
}, 5000);

// sales.js - Form Validation Only

document.addEventListener("DOMContentLoaded", function () {
  console.log("Form validation initialized");
  initializeFormValidation();
});

function initializeFormValidation() {
  const form = document.getElementById('addSale');
  if (!form) return;

  const fields = {
    name: document.getElementById('name'),
    contact: document.getElementById('contact'),
    nproduct: document.getElementById('nproduct'),
    tproduct: document.getElementById('tproduct'),
    quantity: document.getElementById('quantity'),
    unitPrice: document.getElementById('unitPrice'),
    payment: document.getElementById('payment'),
    date: document.getElementById('date')
  };

  // Validation rules
  const validators = {
    name: (value) => value.trim().length >= 2 && value.trim().length <= 100,
    contact: (value) => {
      const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
      return phoneRegex.test(value.trim());
    },
    nproduct: (value) => value && value !== "",
    tproduct: (value) => value && value !== "",
    quantity: (value) => {
      if (!value || parseInt(value) < 1) return false;
      const productSelect = document.getElementById('nproduct');
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      if (selectedOption && selectedOption.value) {
        const availableStock = parseInt(selectedOption.getAttribute('data-stock-quantity'));
        return parseInt(value) <= availableStock;
      }
      return true;
    },
    unitPrice: (value) => {
      const price = parseFloat(value.replace(/,/g, ''));
      return !isNaN(price) && price >= 0;
    },
    payment: (value) => value && value !== "",
    date: (value) => value && !isNaN(new Date(value).getTime())
  };

  // Error messages
  const errorMessages = {
    name: "Please enter a valid customer name (2-100 characters)",
    contact: "Please enter a valid phone number (at least 10 digits)",
    nproduct: "Please select a product",
    tproduct: "Please select a product type",
    quantity: (value) => {
      const productSelect = document.getElementById('nproduct');
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      if (selectedOption && selectedOption.value) {
        const availableStock = parseInt(selectedOption.getAttribute('data-stock-quantity'));
        if (value && parseInt(value) > availableStock) {
          return `Only ${availableStock} units available`;
        }
      }
      return "Please enter a valid quantity (minimum 1)";
    },
    unitPrice: "Please enter a valid unit price",
    payment: "Please select a payment method",
    date: "Please select a valid date"
  };

  // Show error message
  function showError(fieldName, message) {
    const field = fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (field && errorElement) {
      field.classList.add('is-invalid');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  // Show success (remove error)
  function showSuccess(fieldName) {
    const field = fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (field && errorElement) {
      field.classList.remove('is-invalid');
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
      const message = typeof errorMessages[fieldName] === 'function'
        ? errorMessages[fieldName](value)
        : errorMessages[fieldName];
      showError(fieldName, message);
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
    return isValid;
  }

  // Add real-time validation on blur
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

  // Form submit validation
  form.addEventListener('submit', function (e) {
    if (!validateForm()) {
      e.preventDefault();
      alert('Please fix the errors in the form before submitting.');
    }
  });

  // Reset button clears errors
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      Object.keys(fields).forEach(fieldName => {
        showSuccess(fieldName);
      });
    });
  }
}

// Keep existing functions for the form
function updateStockAlert() {
  const productSelect = document.getElementById('nproduct');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const alertContainer = document.getElementById('stockAlertContainer');
  const alertElement = document.getElementById('stockAlert');

  if (selectedOption && selectedOption.value) {
    const stockStatus = selectedOption.getAttribute('data-stock-status');
    const alertMessage = selectedOption.getAttribute('data-alert-message');
    const productType = selectedOption.getAttribute('data-product-type');
    const unitPrice = selectedOption.getAttribute('data-unit-price');

    if (productType) document.getElementById('tproduct').value = productType;
    if (unitPrice) document.getElementById('unitPrice').value = Math.round(unitPrice).toLocaleString();

    if (stockStatus && stockStatus !== 'normal') {
      let alertClass = '';
      let icon = '';

      switch (stockStatus) {
        case 'low-stock':
          alertClass = 'alert-warning';
          icon = 'fa-exclamation-triangle';
          break;
        case 'out-of-stock':
          alertClass = 'alert-danger';
          icon = 'fa-times-circle';
          break;
        case 'medium-stock':
          alertClass = 'alert-info';
          icon = 'fa-info-circle';
          break;
      }

      alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
      alertElement.innerHTML = `
                <i class="fas ${icon} me-2"></i>
                <strong>Stock Alert:</strong> ${alertMessage}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
      alertContainer.style.display = 'block';
    } else {
      alertContainer.style.display = 'none';
    }
  } else {
    alertContainer.style.display = 'none';
  }
  calculateTotalPrice();
}

function calculateTotalPrice() {
  const quantity = document.getElementById('quantity').value;
  const unitPrice = document.getElementById('unitPrice').value.replace(/,/g, '');
  const transportCheck = document.getElementById('transportCheck').checked;
  const totalPriceField = document.getElementById('totalPrice');

  if (quantity && unitPrice) {
    let total = parseFloat(quantity) * parseFloat(unitPrice);
    if (transportCheck) total *= 1.05;
    totalPriceField.value = Math.round(total).toLocaleString();
  } else {
    totalPriceField.value = '';
  }
}


//MODALS FUNCTIONALITY
function closeMessageModal() {
  // Remove the query parameters from URL
  const url = new URL(window.location);
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  window.history.replaceState({}, '', url);

  // Hide the modal
  const modals = document.querySelectorAll('.modal.show');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// Function to show delete confirmation modal
function showDeleteConfirmation(saleId) {
  // Set the sale ID in the hidden input
  document.getElementById('deleteSaleId').value = saleId;

  // Show the modal
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  deleteModal.show();
}

// Auto-close success/error modals after 5 seconds
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.modal.show')) {
    setTimeout(() => {
      closeMessageModal();
    }, 5000);
  }
});


// Date Filter Functionality
document.addEventListener('DOMContentLoaded', function () {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  const clearDateFilterBtn = document.getElementById('clearDateFilter');
  const salesTable = document.getElementById('salesTable');
  const tableRows = salesTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
  const notFoundMessage = document.getElementById('notFound');

  // Function to parse table date to JavaScript Date object
  function parseTableDate(dateString) {
    // Handle different date formats that might appear in the table
    if (dateString.includes('/')) {
      // Format: DD/MM/YYYY or MM/DD/YYYY
      const parts = dateString.split('/');
      // Assuming format is DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    } else if (dateString.includes('-')) {
      // Format: YYYY-MM-DD
      return new Date(dateString);
    } else {
      // Try direct parsing
      return new Date(dateString);
    }
  }

  // Function to compare dates (ignoring time)
  function isDateInRange(rowDate, startDate, endDate) {
    const rowDateObj = new Date(rowDate);
    rowDateObj.setHours(0, 0, 0, 0); // Reset time part

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
    if (endDateObj) endDateObj.setHours(23, 59, 59, 999); // End of day

    let inRange = true;

    if (startDateObj && rowDateObj < startDateObj) {
      inRange = false;
    }

    if (endDateObj && rowDateObj > endDateObj) {
      inRange = false;
    }

    return inRange;
  }

  // Apply Date Filter
  applyDateFilterBtn.addEventListener('click', function () {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    let foundRecords = false;

    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];

      // Skip if row is already hidden for other reasons
      if (row.style.display === 'none' && !row.classList.contains('data-row')) {
        continue;
      }

      const dateCell = row.cells[9]; // Date is in the 10th column (index 9)
      const dateText = dateCell.textContent.trim();

      if (!dateText) {
        row.style.display = 'none';
        continue;
      }

      try {
        const rowDate = parseTableDate(dateText);

        if (isDateInRange(rowDate, startDate, endDate)) {
          row.style.display = '';
          foundRecords = true;
        } else {
          row.style.display = 'none';
        }
      } catch (error) {
        console.error('Error parsing date:', dateText, error);
        row.style.display = 'none';
      }
    }

    // Show/hide "Not Found" message
    notFoundMessage.style.display = foundRecords ? 'none' : 'block';
  });

  // Clear Date Filter
  clearDateFilterBtn.addEventListener('click', function () {
    startDateInput.value = '';
    endDateInput.value = '';

    // Show all rows
    for (let i = 0; i < tableRows.length; i++) {
      tableRows[i].style.display = '';
    }

    // Hide "Not Found" message
    notFoundMessage.style.display = 'none';
  });

  // Validate date range
  startDateInput.addEventListener('change', function () {
    if (startDateInput.value && endDateInput.value) {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);

      if (endDate < startDate) {
        alert('End date cannot be before start date');
        endDateInput.value = '';
      }
    }
  });

  endDateInput.addEventListener('change', function () {
    if (startDateInput.value && endDateInput.value) {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);

      if (endDate < startDate) {
        alert('End date cannot be before start date');
        endDateInput.value = '';
      }
    }
  });

  // Debug function to see what dates are in the table
  function debugTableDates() {
    console.log('=== TABLE DATES DEBUG ===');
    for (let i = 0; i < tableRows.length; i++) {
      const dateCell = tableRows[i].cells[9];
      if (dateCell) {
        console.log(`Row ${i}: "${dateCell.textContent.trim()}"`);
      }
    }
    console.log('=== END DEBUG ===');
  }

  // Uncomment the line below to see what dates are detected in your table
  // debugTableDates();
});