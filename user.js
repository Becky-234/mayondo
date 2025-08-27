const searchInput = document.getElementById('userSearch');
const userItems = document.querySelectorAll('.table-content');

searchInput.addEventListener('input', ()=>{
    const query = searchInput.value.toLowerCase();
    userItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none'; 
    });
});


// Download PDF
document.getElementById('downloadPdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("User Report", 14, 20); // Title at top

    doc.autoTable({
        html: '#addUser',   
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 119, 204] },
    });

    doc.save('User_Report.pdf');
});


//Download excel
document.getElementById('downloadExcel').addEventListener('click', () => {
    const table = document.getElementById('addUser');

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    XLSX.writeFile(wb, 'User_Report.xlsx'); //trigger download
});


 

