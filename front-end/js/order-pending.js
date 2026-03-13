const API_URL = "https://guluustore.onrender.com/api";

document.addEventListener("DOMContentLoaded", function () {
  // Load order info from localStorage
  const orderCode = localStorage.getItem("guluuLastOrderId");
  const backendOrderId = localStorage.getItem("guluuBackendOrderId");

  if (orderCode) {
    document.getElementById("orderCode").textContent = orderCode;
  }

  // Set current time
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  document.getElementById("orderTime").textContent = now.toLocaleDateString(
    "id-ID",
    options,
  );

  // Auto-check status every 30 seconds
  setTimeout(checkOrderStatus, 30000);

  // Initial check
  checkOrderStatus();
});

async function checkOrderStatus() {
  const backendOrderId = localStorage.getItem("guluuBackendOrderId");

  if (!backendOrderId) {
    console.log("No backend order ID found");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${backendOrderId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      updateStatusUI(result.order.status);

      // If order is completed, show success message
      if (result.order.status === "completed") {
        showSuccessMessage();
      }

      // Update timeline based on status
      updateTimeline(result.order.status);
    }
  } catch (error) {
    console.error("Error checking status:", error);
    // Don't show alert to user, just log
  }
}

function updateStatusUI(status) {
  const statusMap = {
    pending_payment: {
      icon: "fas fa-clock",
      text: "Menunggu Verifikasi",
      color: "#ffc107",
    },
    verified: {
      icon: "fas fa-check-circle",
      text: "Pembayaran Diverifikasi",
      color: "#17a2b8",
    },
    completed: {
      icon: "fas fa-flag-checkered",
      text: "Order Selesai",
      color: "#28a745",
    },
    cancelled: {
      icon: "fas fa-times-circle",
      text: "Order Dibatalkan",
      color: "#dc3545",
    },
  };

  const statusInfo = statusMap[status] || statusMap.pending_payment;
  const header = document.querySelector(".status-header h1");
  const icon = document.querySelector(".status-icon i");
  const statusIcon = document.querySelector(".status-icon");

  if (header) header.textContent = `Status: ${statusInfo.text}`;
  if (icon) icon.className = statusInfo.icon;
  if (statusIcon) {
    statusIcon.className = `status-icon ${status}`;
    statusIcon.style.background = statusInfo.color;
  }
}

function updateTimeline(status) {
  const steps = document.querySelectorAll(".timeline-step");
  if (!steps.length) return;

  // Reset all steps
  steps.forEach((step) => step.classList.remove("active"));

  // Activate steps based on status
  if (status === "pending_payment") {
    steps[0].classList.add("active");
  } else if (status === "verified") {
    steps[0].classList.add("active");
    steps[1].classList.add("active");
  } else if (status === "completed") {
    steps.forEach((step) => step.classList.add("active"));
  }
}

function showSuccessMessage() {
  // Show success message
  const statusHeader = document.querySelector(".status-header h1");
  if (statusHeader) {
    statusHeader.innerHTML = "🎉 Order Anda Telah Selesai!";
  }

  // Update icon
  const icon = document.querySelector(".status-icon i");
  if (icon) icon.className = "fas fa-flag-checkered";

  // Show alert
  setTimeout(() => {
    alert("🎉 Order Anda telah selesai! File sudah dikirim ke WhatsApp Anda.");
  }, 1000);
}

function goToHome() {
  window.location.href = "index.html";
}

function contactAdmin() {
  const orderCode = localStorage.getItem("guluuLastOrderId");
  const message = `Halo admin, saya ingin menanyakan status order saya:\nKode Order: ${orderCode}`;
  const whatsappUrl = `https://wa.me/6285793903739?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

// Make functions available globally
window.checkOrderStatus = checkOrderStatus;
window.goToHome = goToHome;
window.contactAdmin = contactAdmin;
