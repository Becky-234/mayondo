//side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  console.log("Sidebar toggled"); // debug check
});


//Search on the sales table
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchSale');
  const table = document.getElementById('salesTable');
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName('tr');
  const notFound = document.getElementById('notFound');

  input.addEventListener('keyup', () => {
    const filter = input.value.toUpperCase();
    let hasResult = false;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      let found = false;

      for (let j = 0; j < cells.length; j++) {
        const cellText = cells[j].cellTextContent || cells[j].innerText;
        if (cellText.toUpperCase().includes(filter)) {
          found = true;
          hasResult = true;
          break;
        }
      }
      rows[i].style.display = found ? '' : 'none';
    }
    notFound.style.display = hasResult ? 'none' : 'block'
  });
});


// const form = document.getElementById("addSale");
// const tableBody = document.querySelector("#salesTable tbody");

// form.addEventListener("submit", saveSale);

// function saveSale(event) {
//   event.preventDefault();

//   const customerName = document.getElementById("fname").value;
//   const productType = document.getElementById("tproduct").value;
//   const productName = document.getElementById("nproduct").value;
//   const quantity = document.getElementById("quantity").value;
//   const price = document.getElementById("price").value;
//   // Get the selected payment type radio button
//   const paymentRadios = document.getElementsByName("Payment");
//   let typeOfPayment = "";
//   for (let radio of paymentRadios) {
//     if (radio.checked) {
//       typeOfPayment = radio.value;
//       break;
//     }
//   }
//   const date = document.getElementById("date").value;
//   const salesAgentName = document.getElementById("agent").value;

//   //creating a new row
//   const newRow = document.createElement("tr");
//   newRow.innerHTML = `
//     <td>${customerName}</td>
//     <td>${productType}</td>
//     <td>${productName}</td>
//     <td>${quantity}</td>
//     <td>${price}</td>
//     <td>${typeOfPayment}</td>
//     <td>${date}</td>
//     <td>${salesAgentName}</td>
//   `;

//   tableBody.appendChild(newRow);

//   form.reset();
// }


// // for add-sale.html
// document.getElementById("saleForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   // Collect values
//   const sale = {
//     customerName: document.getElementById("customerName").value,
//     productType: document.getElementById("productType").value,
//     productName: document.getElementById("productName").value,
//     quantity: document.getElementById("quantity").value,
//     price: document.getElementById("price").value,
//     paymentType: document.getElementById("paymentType").value,
//     date: document.getElementById("date").value,
//     salesAgent: document.getElementById("salesAgent").value
//   };

//   // Get existing sales or empty array
//   let sales = JSON.parse(localStorage.getItem("sales")) || [];

//   // Add new sale
//   sales.push(sale);

//   // Save back to localStorage
//   localStorage.setItem("sales", JSON.stringify(sales));

//   alert("Sale added successfully!");
//   this.reset();
// });



// // for sales.html
// window.addEventListener("DOMContentLoaded", () => {
//   let sales = JSON.parse(localStorage.getItem("sales")) || [];
//   const tableBody = document.querySelector("#salesTable tbody");

//   tableBody.innerHTML = ""; // clear first

//   sales.forEach(sale => {
//     const row = `
//             <tr>
//                 <td>${sale.customerName}</td>
//                 <td>${sale.productType}</td>
//                 <td>${sale.productName}</td>
//                 <td>${sale.quantity}</td>
//                 <td>${sale.price}</td>
//                 <td>${sale.paymentType}</td>
//                 <td>${sale.date}</td>
//                 <td>${sale.salesAgent}</td>
//             </tr>
//         `;
//     tableBody.innerHTML += row;
//   });
// });


// let sales = JSON.parse(localStorage.getItem("sales")) || [];

// // Example: total sales per week (you can calculate by date)
// let totalSales = sales.reduce((sum, s) => sum + Number(s.price), 0);

// console.log("Total Sales:", totalSales);
