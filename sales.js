const form = document.getElementById("addCustomer");
const tableBody = document.querySelector("#salesTable tbody");

form.addEventListener("submit", saveSale);

function saveSale(event){
event.preventDefault();
const customerName = document.getElementById("name").value;
const productType = document.getElementById("tproduct").value;
const productName = document.getElementById("nproduct").value;
const quantity = document.getElementById("quantity").value;
const price = document.getElementById("price").value;
const typeOfPayment = document.getElementById("payment").value;
const date = document.getElementById("date").value;
const salesAgentName = document.getElementById("agent").value;
const newRow = document.createElement("tr");
newRow.innerHTML = `
<td>${customerName}</td>
<td>${productType}</td>
<td>${productName}</td>
<td>${quantity}</td>
<td>${price}</td>
<td>${typeOfPayment}</td>
<td>${date}</td>
<td>${salesAgentName}</td>`
tableBody.appendChild(newRow);
form.reset();
};
