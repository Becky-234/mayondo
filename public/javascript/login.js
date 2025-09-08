const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let valid = true;

  // Clear previous errors
  emailError.textContent = "";
  passwordError.textContent = "";

  // Email validation
  if (!email.validity.valid) {
    if (email.validity.valueMissing) {
      emailError.textContent = "Email is required.";
    } else if (email.validity.typeMismatch) {
      emailError.textContent = "Please enter a valid email address.";
    }
    valid = false;
  }

  // Password validation
  if (password.value === "") {
    passwordError.textContent = "Password is required.";
    valid = false;
  } else if (password.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  if (!valid) return;
  // Prevent form submission if invalid

  // Redirect based on role
  switch (role.value) {
    case "manager":
      window.location.href = "/html/dashboard.html";
      break;
    case "sales_agent":
      window.location.href = "sales.html";
      break;
    case "stock_attendant":
      window.location.href = "stock.html";
      break;
    default:
      alert("Please select a role.");
      // Prevent submission if no role selected
      event.preventDefault();
  }
}
);

