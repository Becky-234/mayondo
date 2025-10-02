// side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  console.log("Sidebar toggled");
});


// PDF, Excel, and search functionality

//PDF
const pdfBtn = document.getElementById("downloadPdf");
if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("User Report", 14, 20);

    doc.autoTable({
      html: '#addUser',
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 119, 204] }
    });

    doc.save('User_Report.pdf');
  });
}

//EXCEL
const excelBtn = document.getElementById("downloadExcel");
if (excelBtn) {
  excelBtn.addEventListener("click", () => {
    const table = document.getElementById("addUser");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'User_Report.xlsx');
  });
}

// Search on the User Table
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchUser');
  const table = document.getElementById('addUser');
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName('tr');
  const notFound = document.getElementById('notFound');

  if (input && table) {
    input.addEventListener('keyup', () => {
      const filter = input.value.toUpperCase();
      let hasResult = false;

      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < cells.length; j++) {
          const cellText = cells[j].textContent || cells[j].innerText;
          if (cellText.toUpperCase().includes(filter)) {
            found = true;
            hasResult = true;
            break;
          }
        }
        rows[i].style.display = found ? '' : 'none';
      }

      if (notFound) {
        notFound.style.display = hasResult ? 'none' : 'block';
      }
    });
  }
});

// Keep your existing functions for stock alert and calculations
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

    // Auto-fill product type and unit price
    if (productType) {
      document.getElementById('tproduct').value = productType;
    }
    if (unitPrice) {
      document.getElementById('unitPrice').value = Math.round(unitPrice).toLocaleString();
    }

    // Show stock alert if needed
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

  // Recalculate total price
  calculateTotalPrice();
}

function calculateTotalPrice() {
  const quantity = document.getElementById('quantity').value;
  const unitPrice = document.getElementById('unitPrice').value.replace(/,/g, '');
  const transportCheck = document.getElementById('transportCheck').checked;
  const totalPriceField = document.getElementById('totalPrice');

  if (quantity && unitPrice) {
    let total = parseFloat(quantity) * parseFloat(unitPrice);

    if (transportCheck) {
      total *= 1.05; // Add 5% transport fee
    }

    totalPriceField.value = Math.round(total).toLocaleString();
  } else {
    totalPriceField.value = '';
  }
}

// Event listeners for real-time calculations
document.getElementById('quantity').addEventListener('input', calculateTotalPrice);
document.getElementById('unitPrice').addEventListener('input', calculateTotalPrice);
document.getElementById('transportCheck').addEventListener('change', calculateTotalPrice);

// Set today's date as default
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('date');
  if (dateField) {
    dateField.value = today;
  }
});

// Initialization function for form validation
function initializeFormValidation() {
  const form = document.getElementById('addSale');
  const resetBtn = document.getElementById('resetBtn');

  if (!form) return;

  // Get all form fields
  const fields = {
    name: document.getElementById('name'),
    contact: document.getElementById('contact'),
    nproduct: document.getElementById('nproduct'),
    tproduct: document.getElementById('tproduct'),
    quantity: document.getElementById('quantity'),
    unitPrice: document.getElementById('unitPrice'),
    totalPrice: document.getElementById('totalPrice'),
    payment: document.getElementById('payment'),
    date: document.getElementById('date')
  };

  // Validation functions
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

      // Check if quantity exceeds available stock
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
    totalPrice: (value) => {
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
          return `Quantity exceeds available stock. Only ${availableStock} units available.`;
        }
      }
      return "Please enter a valid quantity (minimum 1)";
    },
    unitPrice: "Please enter a valid unit price",
    totalPrice: "Total price calculation error",
    payment: "Please select a payment method",
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

      // Show alert message
      alert('Please fix the errors in the form before submitting.');
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

      // Hide stock alert
      document.getElementById('stockAlertContainer').style.display = 'none';
    });
  }

  console.log("Form validation initialized");
}

// Your existing functions with validation integration
function updateStockAlert() {
  const productSelect = document.getElementById('nproduct');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const alertContainer = document.getElementById('stockAlertContainer');
  const alertElement = document.getElementById('stockAlert');

  // Validate product selection
  validateField('nproduct');

  if (selectedOption && selectedOption.value) {
    const stockStatus = selectedOption.getAttribute('data-stock-status');
    const alertMessage = selectedOption.getAttribute('data-alert-message');
    const productType = selectedOption.getAttribute('data-product-type');
    const unitPrice = selectedOption.getAttribute('data-unit-price');

    // Auto-fill product type and unit price
    if (productType) {
      document.getElementById('tproduct').value = productType;
      validateField('tproduct');
    }
    if (unitPrice) {
      document.getElementById('unitPrice').value = Math.round(unitPrice).toLocaleString();
      validateField('unitPrice');
    }

    // Show stock alert if needed
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

  // Recalculate total price and validate quantity
  calculateTotalPrice();
  validateField('quantity');
}

function calculateTotalPrice() {
  const quantity = document.getElementById('quantity').value;
  const unitPrice = document.getElementById('unitPrice').value.replace(/,/g, '');
  const transportCheck = document.getElementById('transportCheck').checked;
  const totalPriceField = document.getElementById('totalPrice');

  if (quantity && unitPrice) {
    let total = parseFloat(quantity) * parseFloat(unitPrice);

    if (transportCheck) {
      total *= 1.05; // Add 5% transport fee
    }

    totalPriceField.value = Math.round(total).toLocaleString();
    validateField('totalPrice');
  } else {
    totalPriceField.value = '';
  }
}

// Event listeners for real-time calculations with validation
document.getElementById('quantity').addEventListener('input', function () {
  calculateTotalPrice();
  validateField('quantity');
});

document.getElementById('unitPrice').addEventListener('input', function () {
  calculateTotalPrice();
  validateField('unitPrice');
});

document.getElementById('transportCheck').addEventListener('change', function () {
  calculateTotalPrice();
  validateField('totalPrice');
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;

  // Initialize form validation
  initializeFormValidation();

  // Initialize sidebar functionality
  const sidebar = document.querySelector('.side-menu-container');
  const toggleBtn = document.querySelector('.fa-bars');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      console.log("Sidebar toggled");
    });
  }
});