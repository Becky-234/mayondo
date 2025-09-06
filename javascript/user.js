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


//Search on the User Table
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchUser');
    const table = document.getElementById('addUser');
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
