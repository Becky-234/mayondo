
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
