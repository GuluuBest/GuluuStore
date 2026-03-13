// Authentication Management System
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔐 Auth System Initializing...");

  // Check if user is already logged in
  checkAuthStatus();

  // Initialize login form if exists
  initLoginForm();
});

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("adminToken");
  const currentPage = window.location.pathname.split("/").pop();

  // If on login page and already logged in, redirect to dashboard
  if (
    currentPage === "login.html" ||
    currentPage === "" ||
    currentPage === "index.html"
  ) {
    if (token) {
      window.location.href = "dashboard.html";
    }
    return;
  }

  // If not on login page and not logged in, redirect to login
  if (!token && currentPage !== "login.html" && currentPage !== "index.html") {
    window.location.href = "login.html";
    return;
  }

  // Verify token with server (optional, but recommended)
  if (token) {
    verifyTokenWithServer();
  }
}

// Verify token with server
async function verifyTokenWithServer() {
  try {
    // You can implement a token verification endpoint
    // For now, just check if token exists and is valid format
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");

    if (!token || !userData) {
      throw new Error("Invalid session");
    }

    // Parse user data to ensure it's valid
    JSON.parse(userData);

    console.log("✅ Session verified");
  } catch (error) {
    console.error("❌ Invalid session:", error);
    logout();
  }
}

// Initialize login form
function initLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    try {
      const response = await fetch(
        "http://192.168.100.17:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Save auth data
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        showNotification("Login berhasil!", "success");

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showNotification(data.error || "Login gagal", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("Gagal terhubung ke server", "error");
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Logout function
function logout() {
  // Clear local storage
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  showNotification("Anda telah logout", "info");

  // Redirect to login
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// Get current user
function getCurrentUser() {
  try {
    const userData = localStorage.getItem("adminUser");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Check if user has specific role
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// Update UI with user info
function updateUserUI() {
  const user = getCurrentUser();
  if (!user) return;

  // Update admin name in navbar
  const adminNameElements = document.querySelectorAll(
    "#adminName, .admin-name",
  );
  adminNameElements.forEach((el) => {
    if (el) el.textContent = user.name || user.username;
  });

  // Update role if needed
  const adminRoleElements = document.querySelectorAll(".admin-role");
  adminRoleElements.forEach((el) => {
    if (el) {
      const roleText = user.role === "superadmin" ? "Super Admin" : "Admin";
      el.textContent = roleText;
    }
  });
}

// Initialize logout button
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Update user info in UI
  updateUserUI();
});

// Export functions
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.hasRole = hasRole;
