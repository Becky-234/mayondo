// user.js - CORRECTED VERSION WITH WORKING MODALS

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded - initializing user.js");

    // Initialize all functionalities
    initializeSidebar();
    initializeExports();
    initializeSearch();
    initializeModals();
    initializeDeleteFunctionality();
});

// Side menu toggle
function initializeSidebar() {
    const sidebar = document.querySelector('.side-menu-container');
    const toggleBtn = document.querySelector('.fa-bars');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            console.log("Sidebar toggled");
        });
    }
}

// PDF and Excel Exports
function initializeExports() {
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
}

// Search functionality
function initializeSearch() {
    const input = document.getElementById('searchUser');
    const table = document.getElementById('usersTable');
    const notFound = document.getElementById('notFound');

    if (input && table && notFound) {
        const tbody = table.tBodies[0];
        const rows = tbody.getElementsByTagName('tr');

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

            notFound.style.display = hasResult ? 'none' : 'block';
        });
    }
}

// Modal functionality
function initializeModals() {
    // Auto-close success/error modals after 3 seconds
    autoCloseServerModals();

    // Add event listeners to all close buttons
    document.querySelectorAll('.modal .btn-close, .modal .btn-secondary, .modal .btn-success, .modal .btn-danger').forEach(btn => {
        btn.addEventListener('click', closeMessageModal);
    });

    // Close modal when clicking outside
    document.addEventListener('click', function (event) {
        const modals = document.querySelectorAll('.modal.show');
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
}

// DELETE FUNCTIONALITY - CORRECTED
function initializeDeleteFunctionality() {
    console.log("Initializing delete functionality");

    const deleteButtons = document.querySelectorAll('form[action*="deleteUser"] button[type="submit"]');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    console.log("Found delete buttons:", deleteButtons.length);
    console.log("Found confirm button:", confirmDeleteBtn);

    let currentUserId = null;

    // Replace all delete confirm dialogs with modals
    deleteButtons.forEach(button => {
        // Remove any existing onclick handlers
        button.removeAttribute('onclick');

        // Add new click handler
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            console.log("Delete button clicked");

            // Get user info
            const form = this.closest('form');
            const userId = form.action.split('/').pop();
            const userName = this.closest('tr').cells[0].textContent.trim();

            console.log("User to delete:", userName, "ID:", userId);

            currentUserId = userId;

            // Show modal instead of confirm
            showDeleteModal(userId, userName);
        });
    });

    // Handle confirm delete button
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            console.log("Confirm delete clicked for user:", currentUserId);

            if (currentUserId) {
                // Find and submit the form
                const deleteForm = document.querySelector(`form[action*="/deleteUser/${currentUserId}"]`);
                if (deleteForm) {
                    console.log("Submitting form for user:", currentUserId);
                    deleteForm.submit();
                } else {
                    console.error("Delete form not found for user:", currentUserId);
                }

                // Close the modal
                closeMessageModal();
            }
        });
    }
}

// Show delete confirmation modal
function showDeleteModal(userId, userName) {
    console.log("Showing delete modal for:", userName);

    // Update modal text with user name
    const modalText = document.getElementById('deleteModalText');
    if (modalText) {
        modalText.innerHTML = `Are you sure you want to delete user <strong>${userName}</strong>?`;
    }

    // Show the modal using Bootstrap
    const deleteModalElement = document.getElementById('deleteConfirmationModal');
    if (deleteModalElement) {
        const deleteModal = new bootstrap.Modal(deleteModalElement);
        deleteModal.show();

        // Store the user ID for the confirm button
        deleteModalElement.setAttribute('data-current-user-id', userId);
    }
}

// Auto-close success/error modals after 3 seconds
function autoCloseServerModals() {
    const serverModals = document.querySelectorAll('.modal.show');

    serverModals.forEach(modal => {
        if (modal.classList.contains('show')) {
            console.log("Auto-closing modal in 3 seconds");
            setTimeout(() => {
                closeMessageModal();
            }, 3000);
        }
    });
}

// Close modal function
function closeMessageModal() {
    console.log("Closing modals");

    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        // Use Bootstrap's hide method if available
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
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });

    // Enable body scrolling
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}


function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.value = today;
    }
}