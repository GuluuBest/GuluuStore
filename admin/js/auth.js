// auth.js - Authentication System for Guluu Store Admin Panel

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  checkAuthStatus();

  // Initialize auth event listeners
  initializeAuthEvents();
});

// ===== AUTHENTICATION FUNCTIONS =====

// Check authentication status
function checkAuthStatus() {
  const isLoggedIn = localStorage.getItem("guluu_admin_logged_in");
  const adminName = localStorage.getItem("guluu_admin_name");
  const adminEmail = localStorage.getItem("guluu_admin_email");

  // If we're on login page and user is already logged in, redirect to dashboard
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    if (isLoggedIn === "true") {
      window.location.href = "dashboard.html";
    }
    return;
  }

  // If we're on any admin page and user is not logged in, redirect to login
  if (!isLoggedIn || isLoggedIn !== "true") {
    // Check if we're already on login page
    if (
      !window.location.pathname.includes("index.html") &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "index.html";
    }
    return;
  }

  // Update admin name in navbar if available
  if (adminName) {
    const adminNameElements = document.querySelectorAll(
      "#adminName, .admin-name",
    );
    adminNameElements.forEach((element) => {
      element.textContent = adminName;
    });
  }

  // Set admin email if available
  if (adminEmail) {
    const adminEmailElements = document.querySelectorAll(
      "#adminEmail, .admin-email",
    );
    adminEmailElements.forEach((element) => {
      element.textContent = adminEmail;
    });
  }
}

// Initialize auth event listeners
function initializeAuthEvents() {
  // Login form submission
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleLogin();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Show/hide password toggle
  const togglePasswordBtn = document.getElementById("togglePassword");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", togglePasswordVisibility);
  }

  // Enter key for login
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        if (loginForm) {
          loginForm.dispatchEvent(new Event("submit"));
        }
      }
    });
  }

  // Remember me checkbox
  const rememberMeCheckbox = document.getElementById("rememberMe");
  if (rememberMeCheckbox) {
    // Check if remember me was previously checked
    const remembered = localStorage.getItem("guluu_remember_me");
    if (remembered === "true") {
      rememberMeCheckbox.checked = true;

      // Fill in remembered username if available
      const rememberedUsername = localStorage.getItem(
        "guluu_remembered_username",
      );
      const usernameInput = document.getElementById("username");
      if (usernameInput && rememberedUsername) {
        usernameInput.value = rememberedUsername;
      }
    }
  }
}

// Handle login (Sudah diperbaiki untuk hit API backend)
function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe")?.checked || false;

  if (!username || !password) {
    showAuthError("Harap isi username dan password");
    return;
  }

  showAuthLoading(true);

  // Lakukan request ke Backend Render
  fetch("https://guluustore.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Simpan token dari backend untuk akses endpoint admin
        localStorage.setItem("adminToken", data.token);
        loginSuccess(
          data.user.username,
          data.user.name,
          data.user.role,
          rememberMe,
        );
      } else {
        loginFailed(data.error || "Username atau password salah");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      loginFailed("Gagal terhubung ke server backend.");
    });
}

// Update fungsi loginSuccess
function loginSuccess(username, name, role, rememberMe) {
  localStorage.setItem("guluu_admin_logged_in", "true");
  localStorage.setItem("guluu_admin_username", username);
  localStorage.setItem("guluu_admin_name", name);
  localStorage.setItem("guluu_admin_role", role);
  localStorage.setItem("guluu_login_time", new Date().toISOString());

  if (rememberMe) {
    localStorage.setItem("guluu_remember_me", "true");
    localStorage.setItem("guluu_remembered_username", username);
  } else {
    localStorage.removeItem("guluu_remember_me");
    localStorage.removeItem("guluu_remembered_username");
  }

  showAuthLoading(false);
  showAuthSuccess("Login berhasil! Mengalihkan...");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);
}

// Update fungsi loginFailed untuk menerima pesan error
function loginFailed(errorMessage = "Email atau password salah") {
  showAuthLoading(false);
  showAuthError(errorMessage);

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.classList.add("shake");
    setTimeout(() => {
      loginForm.classList.remove("shake");
    }, 500);
  }
}

// Handle logout
function handleLogout() {
  // Show confirmation modal
  if (confirm("Apakah Anda yakin ingin logout?")) {
    // Clear auth data
    localStorage.removeItem("guluu_admin_logged_in");
    localStorage.removeItem("guluu_admin_email");
    localStorage.removeItem("guluu_admin_name");
    localStorage.removeItem("guluu_admin_role");
    localStorage.removeItem("guluu_login_time");

    // Keep remember me if set
    const rememberMe = localStorage.getItem("guluu_remember_me");
    if (rememberMe !== "true") {
      localStorage.removeItem("guluu_remembered_email");
    }

    // Redirect to login page
    window.location.href = "index.html";
  }
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePassword");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.innerHTML = '<i class="fas fa-eye-slash"></i>';
    toggleIcon.setAttribute("title", "Sembunyikan password");
  } else {
    passwordInput.type = "password";
    toggleIcon.innerHTML = '<i class="fas fa-eye"></i>';
    toggleIcon.setAttribute("title", "Tampilkan password");
  }
}

// ===== UI HELPER FUNCTIONS =====

// Show auth error
function showAuthError(message) {
  // Remove existing error messages
  const existingError = document.querySelector(".auth-error");
  if (existingError) {
    existingError.remove();
  }

  // Create error element
  const errorElement = document.createElement("div");
  errorElement.className = "auth-error";
  errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;

  // Insert after form or before submit button
  const loginForm = document.getElementById("loginForm");
  const submitButton = loginForm?.querySelector('button[type="submit"]');

  if (submitButton && loginForm) {
    loginForm.insertBefore(errorElement, submitButton);
  }

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.remove();
    }
  }, 5000);
}

// Show auth success
function showAuthSuccess(message) {
  // Remove existing messages
  const existingMessage = document.querySelector(".auth-success");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create success element
  const successElement = document.createElement("div");
  successElement.className = "auth-success";
  successElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

  // Insert after form or before submit button
  const loginForm = document.getElementById("loginForm");
  const submitButton = loginForm?.querySelector('button[type="submit"]');

  if (submitButton && loginForm) {
    loginForm.insertBefore(successElement, submitButton);
  }
}

// Show/hide auth loading
function showAuthLoading(show) {
  const submitButton = document.querySelector(
    '#loginForm button[type="submit"]',
  );
  const loadingSpinner = document.querySelector(".auth-loading");

  if (show) {
    // Create loading spinner if not exists
    if (!loadingSpinner) {
      const spinner = document.createElement("div");
      spinner.className = "auth-loading";
      spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      if (submitButton) {
        submitButton.parentNode.insertBefore(spinner, submitButton);
      }
    }

    // Disable form inputs
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const togglePasswordBtn = document.getElementById("togglePassword");

    if (emailInput) emailInput.disabled = true;
    if (passwordInput) passwordInput.disabled = true;
    if (rememberMeCheckbox) rememberMeCheckbox.disabled = true;
    if (togglePasswordBtn) togglePasswordBtn.disabled = true;

    // Update button text
    if (submitButton) {
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      submitButton.disabled = true;
    }
  } else {
    // Remove loading spinner
    if (loadingSpinner) {
      loadingSpinner.remove();
    }

    // Enable form inputs
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const togglePasswordBtn = document.getElementById("togglePassword");

    if (emailInput) emailInput.disabled = false;
    if (passwordInput) passwordInput.disabled = false;
    if (rememberMeCheckbox) rememberMeCheckbox.disabled = false;
    if (togglePasswordBtn) togglePasswordBtn.disabled = false;

    // Restore button text
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      submitButton.disabled = false;
    }
  }
}

// ===== SESSION MANAGEMENT =====

// Auto logout after inactivity (optional)
function initializeSessionTimeout() {
  let timeout;
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes

  function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(logoutDueToInactivity, timeoutDuration);
  }

  function logoutDueToInactivity() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("guluu_admin_logged_in");

    if (isLoggedIn === "true") {
      // Clear auth data
      localStorage.removeItem("guluu_admin_logged_in");
      localStorage.removeItem("guluu_admin_email");
      localStorage.removeItem("guluu_admin_name");
      localStorage.removeItem("guluu_admin_role");
      localStorage.removeItem("guluu_login_time");

      // Show message
      alert(
        "Session telah berakhir karena tidak ada aktivitas. Silakan login kembali.",
      );

      // Redirect to login
      window.location.href = "index.html";
    }
  }

  // Reset timer on user activity
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
}

// Check session expiry on page load
function checkSessionExpiry() {
  const loginTime = localStorage.getItem("guluu_login_time");

  if (loginTime) {
    const loginDate = new Date(loginTime);
    const currentDate = new Date();
    const hoursDiff = Math.abs(currentDate - loginDate) / 36e5; // hours

    // If session is older than 8 hours, force logout
    if (hoursDiff > 8) {
      localStorage.removeItem("guluu_admin_logged_in");
      localStorage.removeItem("guluu_admin_email");
      localStorage.removeItem("guluu_admin_name");
      localStorage.removeItem("guluu_admin_role");
      localStorage.removeItem("guluu_login_time");

      // Don't redirect if already on login page
      if (
        !window.location.pathname.includes("index.html") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "index.html";
      }
    }
  }
}

// ===== INITIALIZATION =====

// Initialize session timeout (optional - uncomment if needed)
// initializeSessionTimeout();

// Check session expiry on load
checkSessionExpiry();

// Add CSS for auth elements
const authStyles = document.createElement("style");
authStyles.textContent = `
    .auth-error {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        border-radius: 8px;
        padding: 12px 15px;
        margin: 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #f44336;
        font-size: 14px;
        animation: slideDown 0.3s ease;
    }
    
    .auth-error i {
        font-size: 16px;
    }
    
    .auth-success {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid rgba(76, 175, 80, 0.3);
        border-radius: 8px;
        padding: 12px 15px;
        margin: 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #4caf50;
        font-size: 14px;
        animation: slideDown 0.3s ease;
    }
    
    .auth-success i {
        font-size: 16px;
    }
    
    .auth-loading {
        text-align: center;
        margin: 15px 0;
        color: #00d9ff;
        font-size: 24px;
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    /* Password toggle button */
    .password-toggle {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        padding: 5px;
        font-size: 16px;
        transition: color 0.3s ease;
    }
    
    .password-toggle:hover {
        color: rgba(255, 255, 255, 0.8);
    }
    
    /* Login form specific */
    .login-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 40px 20px;
    }
    
    .login-card {
        background: rgba(25, 30, 45, 0.7);
        border-radius: 16px;
        padding: 40px;
        border: 1px solid rgba(0, 217, 255, 0.1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .login-header {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .login-header h1 {
        font-size: 32px;
        color: #fff;
        margin-bottom: 10px;
        background: linear-gradient(90deg, #00d9ff, #00ff88);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .login-header p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
    }
    
    .form-group {
        margin-bottom: 20px;
        position: relative;
    }
    
    .form-group label {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
    }
    
    .form-group label i {
        color: #00d9ff;
        font-size: 16px;
    }
    
    .form-group input {
        width: 100%;
        padding: 12px 15px;
        background: rgba(0, 217, 255, 0.1);
        border: 1px solid rgba(0, 217, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus {
        border-color: #00d9ff;
        box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
    }
    
    .form-group input::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
    
    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }
    
    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .checkbox-group input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #00d9ff;
    }
    
    .checkbox-group label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        cursor: pointer;
    }
    
    .forgot-password {
        color: #00d9ff;
        font-size: 13px;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .forgot-password:hover {
        color: #00ff88;
        text-decoration: underline;
    }
    
    .login-button {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #00d9ff, #00ff88);
        border: none;
        border-radius: 8px;
        color: #0a1929;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;
    }
    
    .login-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 217, 255, 0.3);
    }
    
    .login-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
    
    .login-footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        font-size: 13px;
    }
    
    /* Responsive login */
    @media (max-width: 480px) {
        .login-card {
            padding: 30px 20px;
        }
        
        .login-header h1 {
            font-size: 28px;
        }
        
        .form-options {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(authStyles);
