const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
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
    valid = true;
  }

  // Password validation
  if (password.value === "") {
    passwordError.textContent = "Password is required.";
    valid = true;
  } else if (password.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = true;
  }

  // Stop here if invalid
  if (!valid) return;
});
