document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const successMessage = document.getElementById("successMessage");

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const tel = document.getElementById("tel");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const role = document.getElementById("role");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const telError = document.getElementById("telError");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const roleError = document.getElementById("roleError");

    // Debugging: Check if all elements are found
    console.log("Form elements check:");
    console.log("Form:", form);
    console.log("Name field:", name);
    console.log("Name error span:", nameError);
    console.log("Username error span:", usernameError);

    form.addEventListener("submit", function (event) {
        // Clear previous errors and styles
        [nameError, emailError, telError, usernameError, passwordError, roleError].forEach(e => {
            if (e) e.textContent = "";
        });

        [name, email, tel, username, password, role].forEach(i => {
            if (i) i.classList.remove("invalid");
        });

        // Hide success message
        if (successMessage) successMessage.style.display = "none";

        let valid = true;

        // Validate full name
        if (!name || name.value.trim() === "") {
            if (nameError) nameError.textContent = "Full name is required.";
            if (name) name.classList.add("invalid");
            valid = false;
        }

        // Validate email
        if (!email || email.value.trim() === "") {
            if (emailError) emailError.textContent = "Email is required.";
            if (email) email.classList.add("invalid");
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            if (emailError) emailError.textContent = "Please enter a valid email address.";
            if (email) email.classList.add("invalid");
            valid = false;
        }

        // Validate telephone (digits only)
        if (!tel || tel.value.trim() === "") {
            if (telError) telError.textContent = "Phone number is required.";
            if (tel) tel.classList.add("invalid");
            valid = false;
        } else if (!/^\d+$/.test(tel.value.trim())) {
            if (telError) telError.textContent = "Phone number must contain only digits.";
            if (tel) tel.classList.add("invalid");
            valid = false;
        }

        // Validate username
        if (!username || username.value.trim() === "") {
            if (usernameError) usernameError.textContent = "Username is required.";
            if (username) username.classList.add("invalid");
            valid = false;
        }

        // Validate password length
        if (!password || password.value === "") {
            if (passwordError) passwordError.textContent = "Password is required.";
            if (password) password.classList.add("invalid");
            valid = false;
        } else if (password.value.length < 6) {
            if (passwordError) passwordError.textContent = "Password must be at least 6 characters.";
            if (password) password.classList.add("invalid");
            valid = false;
        }

        // Validate role selection
        if (!role || !role.value || role.value === "") {
            if (roleError) roleError.textContent = "Please select a role.";
            if (role) role.classList.add("invalid");
            valid = false;
        }

        // If invalid, focus first invalid input and halt submission
        if (!valid) {
            event.preventDefault();
            const firstInvalid = document.querySelector(".invalid");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // If valid, let the form submit to the server normally
        // The server will handle redirection after successful registration
    });

    // Real-time validation for better UX
    if (tel) {
        tel.addEventListener("input", function () {
            if (!/^\d*$/.test(tel.value)) {
                if (telError) telError.textContent = "Only digits allowed.";
                if (tel) tel.classList.add("invalid");
            } else {
                if (telError) telError.textContent = "";
                if (tel) tel.classList.remove("invalid");
            }
        });
    }

    if (password) {
        password.addEventListener("input", function () {
            if (password.value.length > 0 && password.value.length < 6) {
                if (passwordError) passwordError.textContent = "Password must be at least 6 characters.";
                if (password) password.classList.add("invalid");
            } else if (password.value.length >= 6) {
                if (passwordError) passwordError.textContent = "";
                if (password) password.classList.remove("invalid");
            }
        });
    }
});