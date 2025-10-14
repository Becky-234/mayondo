console.log("=== LOGIN JS LOADED ===");

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM ready");

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  console.log("Elements found:", {
    email: !!email,
    password: !!password,
    emailError: !!emailError,
    passwordError: !!passwordError
  });

  // Just apply error styling if server returned errors
  if (emailError && emailError.textContent.trim() !== '') {
    email.classList.add("error-border");
  }
  if (passwordError && passwordError.textContent.trim() !== '') {
    password.classList.add("error-border");
  }

  // Remove any form submission prevention
  const form = document.getElementById("loginForm");
  if (form) {
    // Remove any novalidate attribute to let browser handle basic validation
    form.removeAttribute('novalidate');
    
    // Optional: Add real-time error clearing when user starts typing
    email.addEventListener('input', function() {
      if (emailError.textContent.trim() !== '') {
        emailError.textContent = '';
        email.classList.remove('error-border');
      }
    });
    
    password.addEventListener('input', function() {
      if (passwordError.textContent.trim() !== '') {
        passwordError.textContent = '';
        password.classList.remove('error-border');
      }
    });
  }

  console.log("Login setup complete - server handles all validation");
});