//side menu
const sidebar = document.querySelector(".side-menu-container");
const toggleBtn = document.querySelector(".fa-bars");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  console.log("Sidebar toggled"); // debug check
});

//PDF Export
const pdfBtn = document.getElementById("downloadPdf");
if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Stock Report", 14, 20);

    doc.autoTable({
      html: "#newStock",
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 119, 204] },
    });
    doc.save("Stock_Report.pdf");
  });
}

//Excel Export
const excelBtn = document.getElementById("downloadExcel");
if (excelBtn) {
  excelBtn.addEventListener("click", () => {
    const table = document.getElementById("newStock");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, "stock");
    XLSX.writeFile(wb, "Stock_Report.xlsx");
  });
}
 


//Search on the User Table
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchStock");
  const table = document.getElementById("newStock");
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName("tr");
  const notFound = document.getElementById("notFound");

  input.addEventListener("keyup", () => {
    const filter = input.value.toUpperCase();
    let hasResult = false;

    for (let i = 0; i < rows.length; i++) {
      // skip header row
      const cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
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



// Calculating Cost Price
// const unitField = document.getElementById('pdtprice');
// const qtyField = document.getElementById('pdtquantity');
// const totalField = document.getElementById('cprice');

// function updateTotal() {
//   const pdtprice = parseFloat(unitField.value);
//   const pdtquantity = parseFloat(qtyField.value);
//   if (!isNaN(pdtquantity) && !isNaN(pdtprice)) {
//     totalField.value = (pdtquantity * pdtprice).toFixed(2);
//   } else {
//     totalField.value = "";
//   }
// }

// unitField.addEventListener('input', updateTotal);
// qtyField.addEventListener('input', updateTotal);


//Filter
document.addEventListener('DOMContentLoaded', function () {
  const productFilter = document.getElementById('productFilter');
  const productItems = document.querySelectorAll('.product-item');

  productFilter.addEventListener('change', function () {
    const filterValue = this.value;

    productItems.forEach(item => {
      const productType = item.getAttribute('data-product-type');
      let shouldShow = false;

      switch (filterValue) {
        case 'all':
          shouldShow = true;
          break;
        case 'raw':
          shouldShow = productType === 'raw';
          break;
        case 'furniture':
          shouldShow = productType === 'furniture';
          break;
      }

      // Smooth transition
      if (shouldShow) {
        item.style.opacity = '0';
        item.style.display = 'block'; // or your preferred display value
        setTimeout(() => {
          item.style.opacity = '1';
        }, 50);
      } else {
        item.style.opacity = '0';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});


//ALERTS AFTER RECORDING STOCK
// Auto-hide alerts after 5 seconds
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    const bsAlert = new bootstrap.Alert(alert);
    bsAlert.close();
  });
}, 5000);