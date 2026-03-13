// Authentication Check for Admin Panel
(function () {
  "use strict";

  // Check authentication status
  function checkAuthentication() {
    console.log("🔐 Checking authentication...");

    // Get login data from localStorage
    const loginData = localStorage.getItem("guluuStoreAdmin");

    // If no login data, redirect to login
    if (!loginData) {
      console.warn("⚠️ No login data found, redirecting to login...");
      redirectToLogin();
      return null;
    }

    try {
      // Parse login data
      const parsedData = JSON.parse(loginData);

      // Validate login data structure
      if (!parsedData.loggedIn || typeof parsedData.username !== "string") {
        console.warn(
          "⚠️ Invalid login data structure, clearing and redirecting...",
        );
        clearLoginData();
        redirectToLogin();
        return null;
      }

      // Check if login is expired (24 hours)
      const loginTime = parsedData.timestamp
        ? new Date(parsedData.timestamp)
        : new Date();
      const now = new Date();
      const hoursSinceLogin = Math.abs(now - loginTime) / 36e5; // hours

      if (hoursSinceLogin > 24 && !parsedData.remember) {
        console.warn("⚠️ Login expired, redirecting...");
        clearLoginData();
        redirectToLogin();
        return null;
      }

      console.log("✅ User authenticated:", parsedData.username);
      return parsedData;
    } catch (error) {
      console.error("❌ Error parsing login data:", error);
      clearLoginData();
      redirectToLogin();
      return null;
    }
  }

  // Redirect to login page
  function redirectToLogin() {
    // Add small delay for better UX
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
  }

  // Clear login data
  function clearLoginData() {
    localStorage.removeItem("guluuStoreAdmin");
    console.log("🗑️ Login data cleared");
  }

  // Update UI with user data
  function updateUserUI(userData) {
    console.log("👤 Updating UI with user data...");

    // Update admin name in navbar
    const adminNameElements = [
      document.getElementById("adminName"),
      document.getElementById("loggedInUser"),
    ];

    adminNameElements.forEach((element) => {
      if (element && userData.username) {
        element.textContent = userData.username;
      }
    });

    // Update last login time
    updateLastLoginTime(userData.timestamp);

    // Update greeting
    updateGreeting(userData.username);
  }

  // Update last login time display
  function updateLastLoginTime(timestamp) {
    const lastLoginElement = document.getElementById("lastLogin");
    if (!lastLoginElement) return;

    const loginTime = timestamp ? new Date(timestamp) : new Date();
    const now = new Date();
    const diffMs = now - loginTime;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeText = "";
    if (days > 0) {
      timeText = `${days} hari yang lalu`;
    } else if (hours > 0) {
      timeText = `${hours} jam yang lalu`;
    } else if (minutes > 0) {
      timeText = `${minutes} menit yang lalu`;
    } else {
      timeText = "Baru saja";
    }

    lastLoginElement.textContent = timeText;
  }

  // Update greeting based on time of day
  function updateGreeting(username) {
    const greetingElement = document.getElementById("greetingTime");
    if (!greetingElement) return;

    const now = new Date();
    const hour = now.getHours();
    let greeting = "";

    if (hour < 12) {
      greeting = "Selamat Pagi";
    } else if (hour < 15) {
      greeting = "Selamat Siang";
    } else if (hour < 19) {
      greeting = "Selamat Sore";
    } else {
      greeting = "Selamat Malam";
    }

    // Format date
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = now.toLocaleDateString("id-ID", options);

    greetingElement.innerHTML = `
            <span style="color: #00ff88">${greeting}</span>, ${username}!<br>
            <small style="color: rgba(255,255,255,0.7)">${dateString}</small>
        `;
  }

  // Initialize auth system
  function initAuth() {
    console.log("🚀 Initializing authentication system...");

    // Check if user is authenticated
    const userData = checkAuthentication();

    if (userData) {
      // Update UI with user data
      updateUserUI(userData);

      // Log successful authentication
      console.log("🎉 Authentication successful!");

      // Add heartbeat to keep session alive
      startSessionHeartbeat();
    } else {
      console.log("🔒 Not authenticated, waiting for redirect...");
    }
  }

  // Session heartbeat to keep track of activity
  function startSessionHeartbeat() {
    // Update timestamp every 5 minutes
    setInterval(
      () => {
        const loginData = localStorage.getItem("guluuStoreAdmin");
        if (loginData) {
          try {
            const parsedData = JSON.parse(loginData);
            parsedData.lastActivity = new Date().getTime();
            localStorage.setItem("guluuStoreAdmin", JSON.stringify(parsedData));
          } catch (error) {
            console.error("Error updating session heartbeat:", error);
          }
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }

  // Listen for storage changes (for multiple tabs)
  window.addEventListener("storage", function (event) {
    if (event.key === "guluuStoreAdmin" && !event.newValue) {
      // If login data was cleared in another tab, redirect
      console.log("🔄 Login data changed in another tab, redirecting...");
      redirectToLogin();
    }
  });

  // Prevent access via browser back button after logout
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      // Page was loaded from cache, recheck auth
      initAuth();
    }
  });

  // Initialize when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuth);
  } else {
    initAuth();
  }

  // Export functions for use in layout.js (if needed)
  window.auth = {
    checkAuthentication,
    redirectToLogin,
    clearLoginData,
    updateUserUI,
  };
})();
