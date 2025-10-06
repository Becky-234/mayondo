console.log('addUser.js loaded successfully');

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');

    // SIDEBAR
    const sidebar = document.querySelector('.side-menu-container');
    const toggleBtn = document.querySelector('.fa-bars');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            console.log("Sidebar toggled");
        });
    }

    
    // FORM VALIDATION FUNCTIONALITY
    function initializeFormValidation() {
        const form = document.getElementById('addUser');
        const resetBtn = document.getElementById('resetBtn');

        if (!form) return;

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

        // Validation functions
        const validators = {
            name: (value) => value.trim().length >= 2 && value.trim().length <= 100,
            email: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            tel: (value) => {
                const cleanValue = value.replace(/\D/g, '');
                return /^(0[0-9]{9}|256[0-9]{9}|[0-9]{9})$/.test(cleanValue);
            },
            nin: (value) => /^[a-zA-Z0-9]{8,20}$/.test(value),
            address: (value) => value.trim().length >= 5 && value.trim().length <= 200,
            username: (value) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
            password: (value) => value.length >= 6,
            confirmPassword: (value) => {
                const passwordField = document.getElementById('password');
                return passwordField && value === passwordField.value;
            },
            date: (value) => value && !isNaN(new Date(value).getTime())
        };

        // Error messages
        const errorMessages = {
            name: "Please enter a valid full name (2-100 characters)",
            email: "Please enter a valid email address",
            tel: "Please enter a valid phone number (9-12 digits)",
            nin: "Please enter a valid NIN number (8-20 alphanumeric characters)",
            address: "Please enter a valid address (5-200 characters)",
            username: "Please enter a valid username (3-20 alphanumeric characters)",
            password: "Password must be at least 6 characters",
            confirmPassword: "Passwords do not match",
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

        // Real-time password confirmation validation
        if (fields.password && fields.confirmPassword) {
            fields.password.addEventListener('input', () => {
                if (fields.confirmPassword.value) {
                    validateField('confirmPassword');
                }
            });

            fields.confirmPassword.addEventListener('input', () => {
                if (fields.confirmPassword.value) {
                    validateField('confirmPassword');
                }
            });
        }

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

        console.log("Form validation initialized");
    }

    // Initialize the form validation
    initializeFormValidation();
});