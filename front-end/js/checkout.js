const customerForm = document.getElementById("customerForm");
const proceedBtn = document.getElementById("proceedToPayment");
const orderItems = document.getElementById("orderItems");
const subtotalEl = document.getElementById("subtotal");
const grandTotalEl = document.getElementById("grandTotal");

// Error Elements
const nameError = document.getElementById("nameError");
const waError = document.getElementById("waError");

// State
let cartItems = [];
let customerData = null;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Load cart from localStorage
  loadCartItems();

  // Load theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  // Setup theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.checked = savedTheme === "light";
    themeToggle.addEventListener("change", function () {
      const theme = this.checked ? "light" : "dark";
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    });
  }

  // Setup cart link
  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    const cartCount = getCartCount();
    if (cartCount > 0) {
      cartLink.innerHTML = `<i class="fas fa-shopping-cart"></i> Keranjang (${cartCount})`;
    }
  }
});

// Load cart items from localStorage
function loadCartItems() {
  const savedCart = localStorage.getItem("guluuCart");
  if (savedCart) {
    try {
      cartItems = JSON.parse(savedCart);
      if (cartItems.length > 0) {
        renderOrderSummary();
        return;
      }
    } catch (e) {
      console.error("Error loading cart:", e);
      cartItems = [];
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));
  const variantId = urlParams.get("variant");
  if (productId) {
    // Ambil data produk dari window.GULUU_PRODUCTS atau dari data.js
    let products = window.GULUU_PRODUCTS;
    if (!products && typeof getProducts === "function") {
      products = getProducts();
    }
    if (products) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        let item = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          productId: product.id,
          variant: null,
        };
        if (product.hasVariants && variantId) {
          const variant = product.variants.find((v) => v.id === variantId);
          if (variant) {
            item = {
              id: variant.id,
              name: variant.name,
              price: variant.price,
              quantity: 1,
              productId: product.id,
              variant: `${variant.type} - ${variant.duration}${variant.quality ? " - " + variant.quality : ""}`,
            };
          }
        }
        cartItems = [item];
        renderOrderSummary();
        return;
      }
    }
  }
  // Jika tetap tidak ada produk, redirect ke home
  setTimeout(() => {
    alert("Keranjang kosong. Silakan pilih produk terlebih dahulu.");
    window.location.href = "index.html";
  }, 500);
}

// Get total items in cart
function getCartCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// Render order summary
function renderOrderSummary() {
  if (cartItems.length === 0) {
    orderItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Keranjang kosong</p>
            </div>
        `;
    subtotalEl.textContent = "Rp 0";
    grandTotalEl.textContent = "Rp 0";
    return;
  }

  let itemsHTML = "";
  let subtotal = 0;

  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    itemsHTML += `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    ${item.variant ? `<div class="item-variant">${item.variant}</div>` : ""}
                    ${item.note ? `<div class="item-note">${item.note}</div>` : ""}
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">
                    Rp ${itemTotal.toLocaleString("id-ID")}
                </div>
            </div>
        `;
  });

  orderItems.innerHTML = itemsHTML;
  subtotalEl.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
  grandTotalEl.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
}

// Validate form
function validateForm() {
  let isValid = true;

  const name = document.getElementById("customerName").value.trim();
  const whatsapp = document.getElementById("customerWhatsApp").value.trim();

  // Validate name
  if (!name) {
    nameError.textContent = "Nama wajib diisi";
    nameError.classList.add("show");
    isValid = false;
  } else if (name.length < 3) {
    nameError.textContent = "Nama minimal 3 karakter";
    nameError.classList.add("show");
    isValid = false;
  } else {
    nameError.classList.remove("show");
  }

  // Validate WhatsApp
  if (!whatsapp) {
    waError.textContent = "Nomor WhatsApp wajib diisi";
    waError.classList.add("show");
    isValid = false;
  } else if (!/^[0-9]{9,13}$/.test(whatsapp)) {
    waError.textContent = "Format nomor tidak valid";
    waError.classList.add("show");
    isValid = false;
  } else {
    waError.classList.remove("show");
  }

  return isValid;
}

// Save customer data to localStorage
function saveCustomerData() {
  customerData = {
    name: document.getElementById("customerName").value.trim(),
    whatsapp: "+62" + document.getElementById("customerWhatsApp").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    note: document.getElementById("customerNote").value.trim(),
    timestamp: new Date().toISOString(),
    orderId: generateOrderId(),
  };

  localStorage.setItem("guluuCustomerData", JSON.stringify(customerData));
}

function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900) + 100;
  
  return `GS-${random}${now.getTime().toString().slice(-6)}-${year}`;
}

customerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  if (cartItems.length === 0) {
    alert("Keranjang kosong. Silakan pilih produk terlebih dahulu.");
    return;
  }

  // Save customer data
  saveCustomerData();

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Save order summary to localStorage for payment page
  const orderSummary = {
    items: cartItems,
    total: total,
    customer: customerData,
    orderId: customerData.orderId,
  };

  localStorage.setItem("guluuOrderSummary", JSON.stringify(orderSummary));

  // Redirect to payment page
  window.location.href = "payment.html";
});

// Add this function for adding to cart from product page
function addToCart(product, variant = null, quantity = 1) {
  const cartItem = {
    id: variant ? variant.id : product.id,
    name: variant ? variant.name : product.name,
    price: variant ? variant.price : product.price,
    quantity: quantity,
    productId: product.id,
    variant: variant ? `${variant.type} - ${variant.duration}` : null,
  };

  // Check if item already in cart
  const existingIndex = cartItems.findIndex((item) => item.id === cartItem.id);

  if (existingIndex > -1) {
    // Update quantity
    cartItems[existingIndex].quantity += quantity;
  } else {
    // Add new item
    cartItems.push(cartItem);
  }

  // Save to localStorage
  localStorage.setItem("guluuCart", JSON.stringify(cartItems));

  // Show notification
  showToast(`${cartItem.name} ditambahkan ke keranjang`);

  // Update cart count
  updateCartCount();
}

// Show toast notification
function showToast(message) {
  // Create toast element
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Update cart count in header
function updateCartCount() {
  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    const count = getCartCount();
    cartLink.innerHTML =
      count > 0
        ? `<i class="fas fa-shopping-cart"></i> Keranjang (${count})`
        : `<i class="fas fa-shopping-cart"></i> Keranjang`;
  }
}
