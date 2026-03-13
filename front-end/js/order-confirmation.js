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
  // Load order data
  loadOrderData();

  // Load theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);
  // order-confirmation.js

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
    // order-confirmation.js
  };
}
