// side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  console.log("Sidebar toggled");
});

// Form validation with error messages
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('addSale');

  // STOP BROWSER'S DEFAULT VALIDATION
  form.setAttribute('novalidate', 'novalidate');

  // Remove required attributes to prevent browser validation
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.removeAttribute('required');
  });

  // Form submit event
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous errors
    clearAllErrors();

    let isValid = true;
    let firstErrorField = null;

    // Validate all required fields
    const requiredFields = [
      { id: 'name', name: 'Name of Customer', type: 'text' },
      { id: 'contact', name: 'Customer Contact', type: 'text' },
      { id: 'nproduct', name: 'Name of Product', type: 'select' },
      { id: 'tproduct', name: 'Type of Product', type: 'select' },
      { id: 'quantity', name: 'Quantity', type: 'number' },
      { id: 'unitPrice', name: 'Unit Price', type: 'text' },
      { id: 'totalPrice', name: 'Total Price', type: 'text' },
      { id: 'payment', name: 'Payment Method', type: 'select' },
      { id: 'date', name: 'Date', type: 'date' }
    ];

    requiredFields.forEach(fieldInfo => {
      const field = document.getElementById(fieldInfo.id);
      if (!field) return;

      let value = field.value;
      if (fieldInfo.type === 'text' || fieldInfo.type === 'number') {
        value = value.trim();
      }

      // Check if field is empty
      if (!value) {
        showError(field, `${fieldInfo.name} is required`);
        isValid = false;
        if (!firstErrorField) firstErrorField = field;
        return;
      }

      // Field-specific validations
      switch (fieldInfo.id) {
        case 'contact':
          if (!isValidContact(value)) {
            showError(field, 'Please enter a valid contact number (at least 10 digits)');
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;

        case 'quantity':
          const quantity = parseInt(value);
          if (isNaN(quantity) || quantity <= 0) {
            showError(field, 'Quantity must be greater than 0');
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;

        case 'unitPrice':
          const priceValue = parseFloat(value.replace(/,/g, ''));
          if (isNaN(priceValue) || priceValue <= 0) {
            showError(field, 'Unit price must be greater than 0');
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;

        case 'nproduct':
          if (value === '' || field.options[field.selectedIndex].disabled) {
            showError(field, 'Please select a valid product');
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;

        case 'tproduct':
        case 'payment':
          if (value === '') {
            showError(field, `Please select ${fieldInfo.name.toLowerCase()}`);
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;

        case 'totalPrice':
          const totalValue = parseFloat(value.replace(/,/g, ''));
          if (isNaN(totalValue) || totalValue <= 0) {
            showError(field, 'Total price must be calculated and greater than 0');
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
          }
          break;
      }
    });

    if (isValid) {
      console.log('Form is valid, submitting...');
      // If all validations pass, submit the form
      form.submit();
    } else {
      console.log('Form has errors');
      // Scroll to first error
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
    }
  });

  function showError(field, message) {
    console.log('Showing error for field:', field.id, message);

    // Add error class to field
    field.classList.add('error-field');

    // Add red border directly
    field.style.border = '2px solid #dc3545';
    field.style.boxShadow = '0 0 5px rgba(220, 53, 69, 0.5)';

    // Create or update error message
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.style.fontWeight = '500';
  }

  function clearAllErrors() {
    console.log('Clearing all errors');

    // Remove all error styling
    const errorFields = document.querySelectorAll('.error-field');
    errorFields.forEach(field => {
      field.classList.remove('error-field');
      field.style.border = '';
      field.style.boxShadow = '';
    });

    // Hide all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
      msg.style.display = 'none';
    });
  }

  // Clear error when user starts typing
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      this.classList.remove('error-field');
      this.style.border = '';
      this.style.boxShadow = '';

      const errorElement = this.parentNode.querySelector('.error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });

    // Also clear on change for select elements
    input.addEventListener('change', function () {
      this.classList.remove('error-field');
      this.style.border = '';
      this.style.boxShadow = '';

      const errorElement = this.parentNode.querySelector('.error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });
  });

  function isValidContact(contact) {
    // Remove all non-digit characters and check length
    const digitsOnly = contact.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  }
});

// Your existing PDF, Excel, and search functionality remains the same...
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