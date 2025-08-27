const form = document.getElementById("addSale");
const tableBody = document.querySelector("#salesTable tbody");

form.addEventListener("submit", saveSale);

function saveSale(event) {
  event.preventDefault();

  const customerName = document.getElementById("fname").value;
  const productType = document.getElementById("tproduct").value;
  const productName = document.getElementById("nproduct").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  // Get the selected payment type radio button
  const paymentRadios = document.getElementsByName("Payment");
  let typeOfPayment = "";
  for (let radio of paymentRadios) {
    if (radio.checked) {
      typeOfPayment = radio.value;
      break;
    }
  }
  const date = document.getElementById("date").value;
  const salesAgentName = document.getElementById("agent").value;

  //creating a new row
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${customerName}</td>
    <td>${productType}</td>
    <td>${productName}</td>
    <td>${quantity}</td>
    <td>${price}</td>
    <td>${typeOfPayment}</td>
    <td>${date}</td>
    <td>${salesAgentName}</td>
  `;

  tableBody.appendChild(newRow);

  form.reset();
}
