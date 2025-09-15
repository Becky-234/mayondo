// Side menu toggle
const sidebar = document.querySelector(".side-menu-container");
const toggleBtn = document.querySelector(".fa-bars");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  console.log("Sidebar toggled");
});

// Search on the sales table
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("salesTable");
  if (!table) {
    // We are not on sales.html, so skip the search code
    return;
  }

  const input = document.getElementById("searchSale");
  const tbody = table.tBodies[0];
  const rows = tbody.getElementsByTagName("tr");
  const notFound = document.getElementById("notFound");

  input.addEventListener("keyup", () => {
    const filter = input.value.toUpperCase();
    let hasResult = false;

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
        //Use textContent or innerText, not cellTextContent
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
