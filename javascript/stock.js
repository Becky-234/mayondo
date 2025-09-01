
const form = document.getElementById("addStock");
const tableBody = document.querySelector("#newStock tbody");

form.addEventListener("submit", );

function saveSale(event){
event.preventDefault();
const productName = document.getElementById("pdtname").value;
const productType = document.getElementById("pdttype").value;
const costPrice = document.getElementById("cprice").value;
const quantity = document.getElementById("quantity").value;
const productPrice = document.getElementById("pdtprice").value;
const supplierName = document.getElementById("supplier").value;
const date = document.getElementById("date").value;
const quality = document.getElementById("quality").value;
const newRow = document.createElement("tr");
newRow.innerHTML = `
<td>${productName}</td>
<td>${productType}</td>
<td>${costPrice}</td>
<td>${quantity}</td>
<td>${productPrice}</td>
<td>${supplierName}</td>
<td>${date}</td>
<td>${quality}</td>`
tableBody.appendChild(newRow);
form.reset();
};


//for add-stock.html
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("stockForm");
    if (!form) return; // Only run on add-stock.html

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const stockItem = {
            productName: document.getElementById("productName").value,
            productType: document.getElementById("productType").value,
            costPrice: document.getElementById("costPrice").value,
            quantity: document.getElementById("quantity").value,
            productPrice: document.getElementById("productPrice").value,
            supplierName: document.getElementById("supplierName").value,
            date: document.getElementById("date").value,
            quality: document.getElementById("quality").value
        };

        let stock = JSON.parse(localStorage.getItem("stock")) || [];
        stock.push(stockItem);
        localStorage.setItem("stock", JSON.stringify(stock));

        alert("Product added to stock!");
        form.reset();
    });
});


// for stock.html
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#newStock tbody");
    if (!tableBody) return; // Only run on stock.html

    let stock = JSON.parse(localStorage.getItem("stock")) || [];

    tableBody.innerHTML = "";

    stock.forEach(item => {
        const row = `
          <tr>
              <td>${item.productName}</td>
              <td>${item.productType}</td>
              <td>${item.costPrice}</td>
              <td>${item.quantity}</td>
              <td>${item.productPrice}</td>
              <td>${item.supplierName}</td>
              <td>${item.date}</td>
              <td>${item.quality}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
    });
});


let stock = JSON.parse(localStorage.getItem("stock")) || [];

// Count per product type
let categories = {};
stock.forEach(item => {
    categories[item.productType] = (categories[item.productType] || 0) + Number(item.quantity);
});

// Use these in Chart.js
const productsChart = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
        }]
    }
});
