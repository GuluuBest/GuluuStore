// DOM Elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const rememberMe = document.getElementById("rememberMe");
const notification = document.getElementById("notification");

// Demo credentials (dummy validation)
const DEMO_CREDENTIALS = {
  username: "admin",
  password: "guluustore123",
};

// Toggle password visibility
togglePasswordBtn.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle eye icon
  const icon = this.querySelector("i");
  icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";

  // Add subtle animation
  this.style.transform = "translateY(-50%) scale(1.1)";
  setTimeout(() => {
    this.style.transform = "translateY(-50%) scale(1)";
  }, 200);
});

// Input focus effects
usernameInput.addEventListener("focus", function () {
  this.parentElement.style.transform = "scale(1.02)";
});

usernameInput.addEventListener("blur", function () {
  this.parentElement.style.transform = "scale(1)";
  validateUsername();
});

passwordInput.addEventListener("focus", function () {
  this.parentElement.style.transform = "scale(1.02)";
});

passwordInput.addEventListener("blur", function () {
  this.parentElement.style.transform = "scale(1)";
  validatePassword();
});

// Input validation functions
function validateUsername() {
  const username = usernameInput.value.trim();
  usernameError.style.opacity = "0";

  if (!username) {
    showError(usernameError, "Username atau email wajib diisi");
    return false;
  }

  // Simple email validation
  if (username.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      showError(usernameError, "Format email tidak valid");
      return false;
    }
  }

  return true;
}

function validatePassword() {
  const password = passwordInput.value;
  passwordError.style.opacity = "0";

  if (!password) {
    showError(passwordError, "Password wajib diisi");
    return false;
  }

  if (password.length < 6) {
    showError(passwordError, "Password minimal 6 karakter");
    return false;
  }

  return true;
}

function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.opacity = "1";

  // Add shake animation to input
  errorElement.parentElement.querySelector("input").style.animation =
    "shake 0.5s ease";
  setTimeout(() => {
    errorElement.parentElement.querySelector("input").style.animation = "";
  }, 500);
}

// Add shake animation to CSS
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Validate inputs
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();

  if (!isUsernameValid || !isPasswordValid) {
    // Add error animation to login button
    loginBtn.style.animation = "shake 0.5s ease";
    setTimeout(() => {
      loginBtn.style.animation = "";
    }, 500);
    return;
  }

  // Get input values
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Dummy validation - check against demo credentials
  if (
    (username === DEMO_CREDENTIALS.username ||
      username === "admin@guluustore.com") &&
    password === DEMO_CREDENTIALS.password
  ) {
    // Disable button and show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Save login status to localStorage
    const loginData = {
      loggedIn: true,
      username: username,
      timestamp: new Date().getTime(),
      remember: rememberMe.checked,
    };

    localStorage.setItem("guluuStoreAdmin", JSON.stringify(loginData));

    // Show success notification
    setTimeout(() => {
      notification.classList.add("show");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    }, 1000);
  } else {
    // Show error for invalid credentials
    showError(usernameError, "Username atau password salah");
    showError(passwordError, "Gunakan: admin / guluustore123");

    // Shake the entire card
    document.querySelector(".login-card").style.animation = "shake 0.8s ease";
    setTimeout(() => {
      document.querySelector(".login-card").style.animation = "";
    }, 800);
  }
});

// Check if user is already logged in (for demo purposes)
window.addEventListener("DOMContentLoaded", function () {
  const savedLogin = localStorage.getItem("guluuStoreAdmin");

  if (savedLogin) {
    const loginData = JSON.parse(savedLogin);

    // Auto-fill if remember me was checked
    if (loginData.remember) {
      usernameInput.value = loginData.username;
      rememberMe.checked = true;
    }

    // If still logged in, show a welcome back message
    if (loginData.loggedIn) {
      console.log("Welcome back, " + loginData.username + "!");
    }
  }

  // Add initial animations
  setTimeout(() => {
    document.querySelector(".login-card").style.opacity = "1";
  }, 300);
});
