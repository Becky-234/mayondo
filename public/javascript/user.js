//side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    console.log("Sidebar toggled"); // debug check
});


// PDF Export
const pdfBtn = document.getElementById("downloadPdf");
if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("User Report", 14, 20);

        doc.autoTable({
            html: '#usersTable',
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 119, 204] }
        });

        doc.save('User_Report.pdf');
    });
}


// Excel Export
const excelBtn = document.getElementById("downloadExcel");
if (excelBtn) {
    excelBtn.addEventListener("click", () => {
        const table = document.getElementById("usersTable");
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(table);

        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, 'User_Report.xlsx');
    });
}


//Search on the User Table
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchUser');
    const table = document.getElementById('usersTable');
    const tbody = table.tBodies[0];
    const rows = tbody.getElementsByTagName('tr');
    const notFound = document.getElementById('notFound');

    input.addEventListener('keyup', () => {
        const filter = input.value.toUpperCase();
        let hasResult = false;

        for (let i = 0; i < rows.length; i++) { // skip header row
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

        notFound.style.display = hasResult ? 'none' : 'block';
    });
});


document.addEventListener('DOMContentLoaded', function () {
    initializeUserFormValidation();
    setDefaultDate();
});

function initializeUserFormValidation() {
    const form = document.getElementById('usersTable');
    if (!form) return;

    const fields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        tel: document.getElementById('tel'),
        nin: document.getElementById('nin'),
        address: document.getElementById('address'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        date: document.getElementById('date')
    };

    // Validation rules
    const validators = {
        name: (value) => value.trim().length >= 2 && value.trim().length <= 100,
        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        tel: (value) => {
            const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
            return phoneRegex.test(value.replace(/\s/g, ''));
        },
        nin: (value) => value.trim().length >= 5 && value.trim().length <= 20,
        address: (value) => value.trim().length >= 5 && value.trim().length <= 200,
        username: (value) => value.trim().length >= 3 && value.trim().length <= 20,
        password: (value) => value.length >= 6,
        confirmPassword: (value) => {
            const password = document.getElementById('password').value;
            return value === password;
        },
        date: (value) => value && !isNaN(new Date(value).getTime())
    };

    // Error messages
    const errorMessages = {
        name: "Please enter a valid full name (2-100 characters)",
        email: "Please enter a valid email address",
        tel: "Please enter a valid phone number (10-15 digits)",
        nin: "Please enter a valid NIN number (5-20 characters)",
        address: "Please enter a valid address (5-200 characters)",
        username: "Please enter a username (3-20 characters)",
        password: "Password must be at least 6 characters",
        confirmPassword: "Passwords do not match",
        date: "Please select a valid date"
    };

    // Show error message
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

    // Show success (remove error)
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
        return isValid;
    }

    // Real-time validation for password confirmation
    fields.password.addEventListener('input', function () {
        if (fields.confirmPassword.value) {
            validateField('confirmPassword');
        }
    });

    fields.confirmPassword.addEventListener('input', function () {
        validateField('confirmPassword');
    });

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

    // Reset button clears errors
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
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
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.value = today;
    }
};

// MODALS - FIXED VERSION
function closeMessageModal() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        // Use Bootstrap's hide method
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        } else {
            // Fallback for server-rendered modals
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    });

    // Remove backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Enable body scrolling
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Close modal when clicking outside - FIXED
document.addEventListener('click', function (event) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeMessageModal();
        }
    });
});

// Close modal with Escape key - FIXED
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeMessageModal();
    }
});

// Show delete confirmation modal - FIXED
function showDeleteModal(userId, userName) {
    // Update modal text with user name
    const modalText = document.getElementById('deleteModalText');
    if (modalText) {
        modalText.innerHTML = `Are you sure you want to delete user <strong>${userName}</strong>?`;
    }

    // Set the user ID in the form
    document.getElementById('deleteUserId').value = userId;

    // Show the modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    deleteModal.show();
}

// REPLACE ALL CONFIRM DIALOGS WITH MODALS
document.addEventListener('DOMContentLoaded', function () {
    // Replace all delete confirm dialogs with modals
    const deleteButtons = document.querySelectorAll('form[action*="deleteUser"] button[type="submit"]');

    deleteButtons.forEach(button => {
        // Remove the old onclick handler
        button.removeAttribute('onclick');

        // Add new click handler
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Get user info
            const form = this.closest('form');
            const userId = form.action.split('/').pop(); // Get ID from URL
            const userName = this.closest('tr').cells[0].textContent.trim();

            // Show modal instead of confirm
            showDeleteModal(userId, userName);
        });
    });

    // Auto-close server modals after 3 seconds
    autoCloseServerModals();
});

// Auto-close success/error modals after 3 seconds
function autoCloseServerModals() {
    const serverModals = document.querySelectorAll('#successModal, #errorModal');

    serverModals.forEach(modal => {
        if (modal.classList.contains('show')) {
            setTimeout(() => {
                closeMessageModal();
            }, 3000);
        }
    });
}

// Add event listeners to all close buttons
document.addEventListener('DOMContentLoaded', function () {
    // Close buttons in server modals
    document.querySelectorAll('#successModal .btn-close, #successModal .btn, #errorModal .btn-close, #errorModal .btn').forEach(btn => {
        btn.addEventListener('click', closeMessageModal);
    });

    // Close button in delete modal
    document.querySelectorAll('#deleteConfirmationModal .btn-close, #deleteConfirmationModal .btn-secondary').forEach(btn => {
        btn.addEventListener('click', closeMessageModal);
    });
});

// Handle delete form submission
document.addEventListener('DOMContentLoaded', function () {
    const deleteForm = document.getElementById('deleteForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userId = document.getElementById('deleteUserId').value;
            if (userId) {
                // Submit the actual delete form
                const originalForm = document.querySelector(`form[action*="/deleteUser/${userId}"]`);
                if (originalForm) {
                    originalForm.submit();
                }
            }

            // Close the modal
            closeMessageModal();
        });
    }
});