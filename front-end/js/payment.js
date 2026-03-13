const API_URL = "https://guluustore.onrender.com/api";

const uploadArea = document.getElementById("uploadArea");
const paymentProof = document.getElementById("paymentProof");
const uploadPreview = document.getElementById("uploadPreview");
const proofPreview = document.getElementById("proofPreview");
const removeProof = document.getElementById("removeProof");
const confirmPaymentBtn = document.getElementById("confirmPayment");
const paymentOrderItems = document.getElementById("paymentOrderItems");
const paymentTotal = document.getElementById("paymentTotal");
const customerInfo = document.getElementById("customerInfo");

// State
let orderSummary = null;
let customerData = null;
let proofImage = null;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  console.log("[PAYMENT] Page loaded");
  // Load order data
  loadOrderData();

  // Setup event listeners
  setupEventListeners();
});

// Load order data from localStorage
function loadOrderData() {
  console.log("[PAYMENT] Loading order data...");
  const savedOrder = localStorage.getItem("guluuOrderSummary");
  const savedCustomer = localStorage.getItem("guluuCustomerData");

  if (!savedOrder || !savedCustomer) {
    console.error("[PAYMENT] No order data found");
    setTimeout(() => {
      alert("Data order tidak ditemukan. Silakan checkout terlebih dahulu.");
      window.location.href = "checkout.html";
    }, 500);
    return;
  }

  try {
    orderSummary = JSON.parse(savedOrder);
    customerData = JSON.parse(savedCustomer);
    console.log("[PAYMENT] Order data loaded:", {
      orderId: customerData.orderId,
      total: orderSummary.total,
    });
    renderOrderSummary();
    renderCustomerInfo();
  } catch (e) {
    console.error("[PAYMENT] Error loading order data:", e);
    alert("Terjadi kesalahan. Silakan ulangi checkout.");
    window.location.href = "checkout.html";
  }
}

// Render order summary
function renderOrderSummary() {
  if (!orderSummary || !orderSummary.items) return;

  let itemsHTML = "";
  orderSummary.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    itemsHTML += `
      <div class="order-item">
        <div class="item-info">
          <h4>${item.name}</h4>
          ${item.variant ? `<div class="item-variant">${item.variant}</div>` : ""}
          <div class="item-quantity">Qty: ${item.quantity}</div>
        </div>
        <div class="item-price">
          Rp ${itemTotal.toLocaleString("id-ID")}
        </div>
      </div>
    `;
  });

  paymentOrderItems.innerHTML = itemsHTML;
  paymentTotal.textContent = `Rp ${orderSummary.total.toLocaleString("id-ID")}`;
  console.log("[PAYMENT] Order summary rendered");
}

// Render customer info
function renderCustomerInfo() {
  if (!customerData) return;

  customerInfo.innerHTML = `
    <div class="customer-info-item">
      <span>Nama</span>
      <span>${customerData.name}</span>
    </div>
    <div class="customer-info-item">
      <span>WhatsApp</span>
      <span>${customerData.whatsapp}</span>
    </div>
    ${
      customerData.email
        ? `
    <div class="customer-info-item">
      <span>Email</span>
      <span>${customerData.email}</span>
    </div>
    `
        : ""
    }
    <div class="customer-info-item">
      <span>ID Pesanan</span>
      <span class="order-id">${customerData.orderId}</span>
    </div>
  `;
}

// Setup event listeners
function setupEventListeners() {
  console.log("[PAYMENT] Setting up event listeners...");

  // Upload area click
  uploadArea.addEventListener("click", function () {
    paymentProof.click();
  });

  // File input change
  paymentProof.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  });

  // Remove proof button
  removeProof.addEventListener("click", function (e) {
    e.stopPropagation();
    removeProofImage();
  });

  // === FIXED: Event Listener untuk Confirm Payment ===
  confirmPaymentBtn.addEventListener("click", async function (e) {
    console.log("[PAYMENT] Confirm button clicked!");
    e.preventDefault();
    e.stopPropagation();

    // Disable button immediately
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    // Panggil confirmPayment
    await confirmPayment();
  });

  // Drag and drop
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = "var(--primary)";
    uploadArea.style.background = "rgba(0, 217, 255, 0.05)";
  });

  uploadArea.addEventListener("dragleave", function () {
    uploadArea.style.borderColor = "rgba(0, 217, 255, 0.3)";
    uploadArea.style.background = "transparent";
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = "rgba(0, 217, 255, 0.3)";
    uploadArea.style.background = "transparent";

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    } else {
      alert("Harap upload file gambar (JPG/PNG)");
    }
  });

  console.log("[PAYMENT] Event listeners setup complete");
}

// Handle file upload
function handleFileUpload(file) {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file terlalu besar. Maksimal 5MB");
    return;
  }

  // Check file type
  if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
    alert("Format file tidak didukung. Harap upload JPG atau PNG");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    proofImage = e.target.result;

    // Show preview
    proofPreview.src = proofImage;
    uploadPreview.style.display = "block";
    uploadArea.querySelector(".upload-placeholder").style.display = "none";

    // Enable confirm button
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.innerHTML =
      '<i class="fas fa-check-circle"></i> Saya Sudah Bayar';
    console.log("[PAYMENT] File uploaded, button enabled");
  };

  reader.readAsDataURL(file);
}

// Remove proof image
function removeProofImage() {
  proofImage = null;
  paymentProof.value = "";
  uploadPreview.style.display = "none";
  uploadArea.querySelector(".upload-placeholder").style.display = "block";
  confirmPaymentBtn.disabled = true;
  confirmPaymentBtn.innerHTML =
    '<i class="fas fa-check-circle"></i> Saya Sudah Bayar';
}

async function confirmPayment() {
  console.log("[PAYMENT] confirmPayment() called");

  if (!proofImage) {
    console.log("[PAYMENT] No proof image");
    alert("Harap upload bukti pembayaran terlebih dahulu");
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.innerHTML =
      '<i class="fas fa-check-circle"></i> Saya Sudah Bayar';
    return;
  }

  const fileInput = document.getElementById("paymentProof");
  const file = fileInput.files[0];

  if (!file) {
    console.log("[PAYMENT] No file selected");
    alert("Harap upload bukti pembayaran terlebih dahulu");
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.innerHTML =
      '<i class="fas fa-check-circle"></i> Saya Sudah Bayar';
    return;
  }

  console.log("[PAYMENT] File:", file.name, "Size:", file.size);

  const formData = new FormData();

  let orderCode = customerData.orderId;
  if (!orderCode || !orderCode.startsWith("GS-")) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 900) + 100;
    orderCode = `GS-${random}${now.getTime().toString().slice(-6)}-${year}`;
  }

  formData.append("order_code", orderCode);
  formData.append("customer_name", customerData.name);
  formData.append("whatsapp", customerData.whatsapp);
  formData.append("email", customerData.email || "");
  formData.append("notes", customerData.note || "");
  formData.append("product_data", JSON.stringify(orderSummary.items));
  formData.append("total_price", orderSummary.total.toString());
  formData.append("payment_proof", file);

  console.log("[PAYMENT] Sending to backend...");
  console.log("[PAYMENT] Order Code:", orderCode);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      body: formData,
    });

    console.log("[PAYMENT] Response status:", response.status);
    const result = await response.json();
    console.log("[PAYMENT] Response data:", result);

    if (!response.ok) {
      throw new Error(
        result.error || `HTTP ${response.status}: Gagal mengirim order`,
      );
    }

    console.log("[PAYMENT] ✅ Order created successfully:", {
      order_id: result.order_id,
      order_code: result.order_code,
    });

    localStorage.setItem("guluuLastOrderId", orderCode);
    localStorage.setItem("guluuBackendOrderId", result.order_id);
    localStorage.setItem("guluuOrderCode", orderCode);

    console.log("[PAYMENT] localStorage updated");
    console.log("[PAYMENT] Redirecting to order-pending-new.html");
    window.location.href = "order-pending-new.html";
  } catch (error) {
    console.error("[PAYMENT] ❌ Error:", error);
    console.error("[PAYMENT] Error stack:", error.stack);

    alert(`❌ Error: ${error.message}`);

    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.innerHTML =
      '<i class="fas fa-check-circle"></i> Saya Sudah Bayar';
  }
}

window.addEventListener("error", function (e) {
  console.error("[GLOBAL ERROR in payment.js]", e.error);
});

window.addEventListener("unhandledrejection", function (e) {
  console.error("[UNHANDLED PROMISE in payment.js]", e.reason);
});
