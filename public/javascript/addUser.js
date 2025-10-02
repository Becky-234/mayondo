//side menu
console.log('addUser.js loaded successfully');

// Side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        console.log("Sidebar toggled");
    });
}

// FORM VALIDATION
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing form validation');

    const form = document.getElementById('addUser');

    if (!form) {
        console.error('Form with ID "addUser" not found');
        return;
    }

    console.log('Add User form found, setting up validation');

    // Get all form fields
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

    // Set default date
    if (fields.date && !fields.date.value) {
        const today = new Date().toISOString().split('T')[0];
        fields.date.value = today;
    }

    // Add event listeners for real-time validation
    Object.values(fields).forEach(field => {
        if (field) {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', function () {
                clearFieldError(field);
            });
        }
    });

    // Form submission validation
    form.addEventListener('submit', function (e) {
        console.log('Form submit event triggered');

        let isValid = true;

        // Validate all fields
        Object.values(fields).forEach(field => {
            if (field && !validateField({ target: field })) {
                isValid = false;
            }
        });

        // Special validation for password confirmation
        if (fields.password && fields.confirmPassword) {
            if (fields.password.value !== fields.confirmPassword.value) {
                showFieldError(fields.confirmPassword, 'Passwords do not match');
                isValid = false;
            }
        }

        console.log('Form validation result:', isValid);

        if (!isValid) {
            e.preventDefault();
            console.log('Form has validation errors, preventing submission');

            // Show alert for first error
            const firstErrorField = document.querySelector('.is-invalid');
            if (firstErrorField) {
                const errorElement = document.getElementById(`${firstErrorField.id}-error`);
                if (errorElement) {
                    alert(`Please fix the following error:\n${errorElement.textContent}`);
                    firstErrorField.focus();
                }
            }
        } else {
            console.log('Form is valid, allowing submission');
        }
    });

    // Reset button functionality
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            console.log('Reset button clicked');
            // Clear all error messages
            Object.values(fields).forEach(field => {
                if (field) clearFieldError(field);
            });
        });
    }
});

// Validate a single field
function validateField(e) {
    const field = e.target;
    const fieldId = field.id;
    const value = field.value.trim();

    // Clear any previous error
    clearFieldError(field);

    // Check if field is empty
    if (value === '') {
        showFieldError(field, 'This field is required');
        return false;
    }

    let isValid = true;
    let errorMessage = '';

    switch (fieldId) {
        case 'name':
            isValid = value.length >= 2 && value.length <= 100;
            errorMessage = 'Please enter a valid full name (2-100 characters)';
            break;
        case 'email':
            isValid = validateEmail(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'tel':
            isValid = validatePhone(value);
            errorMessage = 'Please enter a valid phone number (10-15 digits)';
            break;
        case 'nin':
            isValid = validateNIN(value);
            errorMessage = 'Please enter a valid NIN number (8-20 characters)';
            break;
        case 'address':
            isValid = value.length >= 5 && value.length <= 200;
            errorMessage = 'Please enter a valid address (5-200 characters)';
            break;
        case 'username':
            isValid = value.length >= 3 && value.length <= 20;
            errorMessage = 'Please enter a username (3-20 characters)';
            break;
        case 'password':
            isValid = value.length >= 6;
            errorMessage = 'Password must be at least 6 characters';
            break;
        case 'confirmPassword':
            // This will be handled in the main validation
            isValid = true;
            break;
        case 'date':
            isValid = validateDate(value);
            errorMessage = 'Please select a valid date';
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show error message for a field
function showFieldError(field, message) {
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (errorElement) {
        errorElement.style.display = 'block';
        errorElement.textContent = message;
    }

    // Add error styling
    field.classList.add('is-invalid');
}

// Clear error message for a field
function clearFieldError(field) {
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (errorElement) {
        errorElement.style.display = 'none';
    }

    // Remove error styling
    field.classList.remove('is-invalid');
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

function validateNIN(nin) {
    return nin.length >= 8 && nin.length <= 20;
}

function validateDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}