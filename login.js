const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

form.addEventListener("submit", function(event) {
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
  if (password.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = false;
  } else if (password.value === "") {
    passwordError.textContent = "Password is required.";
    valid = false;
  }

  // Prevent form submission if invalid
  if (!valid) {
    event.preventDefault();
  } else{                // Redirect to dashboard.html
      window.location.href = "dashboard.html";
  }
});

