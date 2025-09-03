//side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    console.log("Sidebar toggled"); // debug check
});


document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#addUser tbody");
    const searchInput = document.getElementById("searchInput");
    const userForm = document.getElementById("userForm");

    // Load users from localStorage
    function loadUsers() {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        tableBody.innerHTML = "";

        users.forEach((user, index) => {
            const row = `
              <tr>
                  <td>${index + 1}</td>
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${user.role}</td>
                  <td>${user.date}</td>
              </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // Add new user
    if (userForm) {
        userForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let users = JSON.parse(localStorage.getItem("users")) || [];

            const newUser = {
                username: document.getElementById("username").value.trim(),
                email: document.getElementById("email").value.trim(),
                role: document.getElementById("role").value,
                date: new Date().toLocaleDateString()
            };

            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            userForm.reset();
            loadUsers();
        });
    }

    // Search/Filter users
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            let filter = searchInput.value.toLowerCase();
            let rows = tableBody.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                let text = rows[i].textContent.toLowerCase();
                rows[i].style.display = text.includes(filter) ? "" : "none";
            }
        });
    }

    // PDF Export
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

    // Excel Export
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

    // Initial Load
    loadUsers();
});


