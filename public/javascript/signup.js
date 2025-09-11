const form = document.getElementById("signupForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");         // <— add this
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop default submission first
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

    // Stop here if invalid
    if (!valid) return;

    // Redirect based on role
    switch (role.value) {
        case "manager":
            window.location.href = "/html/dashboard.html";
            break;
        case "sales_agent":
            window.location.href = "/html/sales.html";
            break;
        default:
            alert("Please select a role.");
            break;
    }
});
