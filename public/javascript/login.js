console.log("=== LOGIN JS LOADED ===");

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM ready - setting up validation");

  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  console.log("Elements found:", {
    form: !!form,
    email: !!email,
    password: !!password,
    emailError: !!emailError,
    passwordError: !!passwordError
  });

  if (!form) {
    console.error("FORM NOT FOUND!");
    return;
  }

  // STOP BROWSER'S DEFAULT VALIDATION
  form.setAttribute('novalidate', 'novalidate');

  // FORM SUBMIT HANDLER
  form.addEventListener("submit", function (event) {
    console.log("=== FORM SUBMISSION INTERCEPTED ===");
    event.preventDefault(); // STOP THE FORM

    let valid = true;

    // Clear previous errors
    emailError.textContent = "";
    passwordError.textContent = "";
    email.classList.remove("error-border");
    password.classList.remove("error-border");

    console.log("Email value:", email.value);
    console.log("Password value:", password.value);

    // EMAIL VALIDATION
    if (!email.value || email.value.trim() === "") {
      console.log("Email is empty");
      emailError.textContent = "Email is required.";
      email.classList.add("error-border");
      valid = false;
    } else if (!isValidEmail(email.value)) {
      console.log("Email format invalid");
      emailError.textContent = "Please enter a valid email address.";
      email.classList.add("error-border");
      valid = false;
    }

    // PASSWORD VALIDATION
    if (!password.value || password.value === "") {
      console.log("Password is empty");
      passwordError.textContent = "Password is required.";
      password.classList.add("error-border");
      valid = false;
    } else if (password.value.length < 6) {
      console.log("Password too short:", password.value.length);
      passwordError.textContent = "Password must be at least 6 characters.";
      password.classList.add("error-border");
      valid = false;
    }

    console.log("Form validation result:", valid);

    // ONLY SUBMIT IF VALID
    if (valid) {
      console.log(" VALIDATION PASSED - SUBMITTING FORM");
      form.submit();
    } else {
      console.log(" VALIDATION FAILED - SHOWING ERRORS");
    }
  });

  // Real-time validation
  email.addEventListener('input', function () {
    if (email.value.trim() !== '' && isValidEmail(email.value)) {
      emailError.textContent = '';
      email.classList.remove('error-border');
    }
  });

  password.addEventListener('input', function () {
    if (password.value.length >= 6 && password.value !== "") {
      passwordError.textContent = '';
      password.classList.remove('error-border');
    }
  });

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  console.log("Login validation setup complete");
});