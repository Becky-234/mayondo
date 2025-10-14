console.log("=== LOGIN JS LOADED ===");

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM ready");

  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const loginBtn = document.getElementById("login-btn");

  console.log("Elements found:", {
    form: !!form,
    email: !!email,
    password: !!password,
    emailError: !!emailError,
    passwordError: !!passwordError,
    loginBtn: !!loginBtn
  });

  // Apply error styling if server returned errors
  if (emailError && emailError.textContent.trim() !== '') {
    email.classList.add("error-border");
  }
  if (passwordError && passwordError.textContent.trim() !== '') {
    password.classList.add("error-border");
  }

  // Validation functions
  function validateEmail() {
    const emailValue = email.value.trim();

    if (!emailValue) {
      showError(email, emailError, "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      showError(email, emailError, "Please enter a valid email address");
      return false;
    }

    clearError(email, emailError);
    return true;
  }

  function validatePassword() {
    const passwordValue = password.value.trim();

    if (!passwordValue) {
      showError(password, passwordError, "Password is required");
      return false;
    }

    if (passwordValue.length < 3) {
      showError(password, passwordError, "Password must be at least 3 characters");
      return false;
    }

    clearError(password, passwordError);
    return true;
  }

  function showError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.add("error-border");
    input.classList.remove("success-border");
  }

  function clearError(input, errorElement) {
    errorElement.textContent = '';
    input.classList.remove("error-border");
    input.classList.add("success-border");
  }

  function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isEmailValid && isPasswordValid;
  }

  // Real-time validation
  email.addEventListener('blur', validateEmail);
  password.addEventListener('blur', validatePassword);

  // Clear errors on input
  email.addEventListener('input', function () {
    if (emailError.textContent.trim() !== '') {
      clearError(email, emailError);
    }
  });

  password.addEventListener('input', function () {
    if (passwordError.textContent.trim() !== '') {
      clearError(password, passwordError);
    }
  });

  // Form submission validation
  form.addEventListener('submit', function (e) {
    console.log("Form submission intercepted");

    // Validate form before submission
    if (!validateForm()) {
      e.preventDefault();
      console.log("Form validation failed - preventing submission");

      // Focus on first invalid field
      if (!validateEmail()) {
        email.focus();
      } else if (!validatePassword()) {
        password.focus();
      }
    } else {
      console.log("Form validation passed - allowing submission");
      // Optional: Add loading state
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";
    }
  });

  console.log("Login setup complete - client-side validation active");
});