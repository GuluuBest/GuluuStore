const API_BASE_URL = "http://192.168.100.17:3000/api";

let allOrders = [];
let currentFilter = "all";
let currentSort = "newest";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin Order Page Loaded - Backend Integrated");

  if (typeof checkAuth === "function") {
    checkAuth();
  }

  // Load data order dari backend
  loadOrders();

  // Setup semua event listeners
  setupEventListeners();

  // Setup modal listeners
  setupModalListeners();

  // Initialize charts
  initializeCharts();
});

// ===== FUNGSI UTAMA =====

// 1. LOAD DATA ORDER DARI BACKEND
async function loadOrders() {
  try {
    showLoading();

    console.log("Loading orders from:", `${API_BASE_URL}/orders`);

    const response = await fetch(`${API_BASE_URL}/orders`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Orders loaded:", data);

    if (data.success) {
      allOrders = data.orders || [];
      console.log(`Loaded ${allOrders.length} orders`);
      renderOrders(allOrders);
      updateOrderStats(allOrders);
      updateCharts(allOrders);
    } else {
      throw new Error(data.error || "Gagal memuat data order");
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    showError("Gagal memuat data order: " + error.message);
  } finally {
    hideLoading();
  }
}

// 2. RENDER DATA KE TABEL
function renderOrders(orders) {
  const tbody = document.getElementById("ordersTableBody");
  const emptyState = document.getElementById("emptyOrders");

  if (!tbody) {
    console.error("Tabel body tidak ditemukan!");
    return;
  }

  // Clear existing rows
  tbody.innerHTML = "";

  // Filter orders berdasarkan currentFilter
  let filteredOrders = applyFilter(orders, currentFilter);

  // Sort orders berdasarkan currentSort
  filteredOrders = applySort(filteredOrders, currentSort);

  if (!filteredOrders || filteredOrders.length === 0) {
    console.log("Tidak ada order untuk ditampilkan setelah filter");

    if (emptyState) {
      emptyState.style.display = "block";
    }

    // Update pagination info
    updatePaginationInfo(0);
    return;
  }

  // Hide empty state
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Render each order
  filteredOrders.forEach((order) => {
    const row = createOrderRow(order);
    tbody.appendChild(row);
  });

  // Setup event listeners untuk row yang baru
  setupRowEventListeners();

  // Update pagination info
  updatePaginationInfo(filteredOrders.length);
}

function createOrderRow(order) {
  const row = document.createElement("tr");
  row.dataset.orderId = order.id;
  row.dataset.status = order.status;

  // Format data
  const formattedPrice = formatRupiah(order.total_price);
  const productData = parseProductData(order.product_data);
  const statusClass = getStatusClass(order.status);
  const statusText = getStatusText(order.status);
  const orderDate = formatDate(order.created_at);

  const proofUrl = order.payment_proof
    ? order.payment_proof.startsWith("http")
      ? order.payment_proof.replace("https://", "http://")
      : `http://192.168.100.17:3000${order.payment_proof}`
    : null;

  // Generate HTML untuk produk
  const productNames = productData.map((p) => p.name).join(", ");

  // Generate action buttons berdasarkan status
  const actionButtons = generateActionButtons(order.id, order.status);

  row.innerHTML = `
        <td>
            <strong class="order-id">${order.order_code || "N/A"}</strong>
            <div class="order-date" style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 3px;">
                ${orderDate}
            </div>
        </td>
        <td>
            <div class="customer-cell">
                <div class="customer-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="customer-info">
                    <div class="customer-name">${order.customer_name || "N/A"}</div>
                    <div class="customer-email">${order.email || "Tidak ada email"}</div>
                    <div class="whatsapp-badge">
                    <i class="fab fa-whatsapp"></i> 
                    <a href="https://wa.me/${order.whatsapp?.replace(/[^0-9]/g, "") || "62"}" 
                      target="_blank" 
                      style="color: #25d366; text-decoration: none; font-weight: 600;">
                        ${order.whatsapp || "N/A"}
                    </a>
                </div>
                </div>
            </div>
        </td>
        <td>
            <div class="product-cell">
                <div class="product-name">${productNames}</div>
                <div class="product-count">${productData.length} item</div>
            </div>
        </td>
        <td class="price-cell">${formattedPrice}</td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td style="text-align: center;">
            ${
              proofUrl
                ? `
                <a href="${proofUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                    <div style="position: relative; display: inline-block;">
                        <img src="${proofUrl}" 
                            alt="Bukti Pembayaran" 
                            width="80" 
                            height="60" 
                            style="object-fit: cover; 
                                    border-radius: 6px; 
                                    border: 2px solid rgba(0,217,255,0.3);
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                    transition: transform 0.2s ease;"
                            onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='rgba(0,217,255,0.8)'; this.style.boxShadow='0 4px 12px rgba(0,217,255,0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(0,217,255,0.3)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
                        <div style="position: absolute; 
                                    bottom: 5px; 
                                    right: 5px; 
                                    background: rgba(0,0,0,0.6); 
                                    color: white; 
                                    padding: 3px 6px; 
                                    border-radius: 4px; 
                                    font-size: 10px;
                                    backdrop-filter: blur(2px);
                                    display: flex;
                                    align-items: center;
                                    gap: 3px;">
                            <i class="fas fa-external-link-alt" style="font-size: 10px;"></i> Lihat
                        </div>
                    </div>
                </a>
                `
                : `
                <span style="color: rgba(255,255,255,0.5); 
                            font-size: 12px; 
                            font-style: italic;
                            padding: 8px 12px;
                            background: rgba(255,255,255,0.05);
                            border-radius: 6px;
                            border: 1px dashed rgba(255,255,255,0.2);
                            display: inline-block;">
                    <i class="fas fa-image" style="margin-right: 5px;"></i>
                    Tidak ada bukti
                </span>
                `
            }
        </td>
        <td class="notes-cell">
            <div class="notes-content">
                ${order.notes || "-"}
            </div>
        </td>
        <td>
            <div class="status-actions">
                ${actionButtons}
                
                <button class="action-icon view-detail"
                        onclick="viewOrderDetail(${order.id})"
                        title="Lihat Detail"
                        style="cursor: pointer; background: rgba(0,217,255,0.1); border: 1px solid rgba(0,217,255,0.2); color: #00d9ff; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                    <i class="fas fa-eye"></i> Detail
                </button>

                <button class="action-btn delete" data-order-id="${order.id}" 
                        title="Hapus Permanen"
                        style="cursor: pointer; background: rgba(244, 67, 54, 0.1); color: #f44336; border: 1px solid rgba(244, 67, 54, 0.2); margin-top: 5px; padding: 8px 12px; border-radius: 6px; width: 100%; font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-trash-alt"></i> Hapus
                </button>
                </div>
        </td>
    `;

  return row;
}

function updateOrderStats(orders) {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending_payment").length;

  if (document.getElementById("totalOrdersCount"))
    document.getElementById("totalOrdersCount").innerText = total;

  if (document.getElementById("pendingOrdersCount"))
    document.getElementById("pendingOrdersCount").innerText = pending;
}

// 4. GENERATE ACTION BUTTONS BERDASARKAN STATUS
function generateActionButtons(orderId, status) {
  let buttons = "";

  switch (status) {
    case "pending_payment":
      buttons = `
                <button class="action-btn verify" data-order-id="${orderId}" 
                        title="Verifikasi Pembayaran">
                    <i class="fas fa-check-circle"></i> Verifikasi
                </button>
                <button class="action-btn cancel" data-order-id="${orderId}" 
                        title="Batalkan Order">
                    <i class="fas fa-times-circle"></i> Batal
                </button>
            `;
      break;

    case "verified":
      buttons = `
                <button class="action-btn complete" data-order-id="${orderId}" 
                        title="Tandai Selesai">
                    <i class="fas fa-check-double"></i> Selesai
                </button>
                <button class="action-btn cancel" data-order-id="${orderId}" 
                        title="Batalkan Order">
                    <i class="fas fa-times-circle"></i> Batal
                </button>
            `;
      break;

    case "completed":
      buttons = `
                <div style="padding: 6px 10px; background: rgba(76,175,80,0.1); 
                           border-radius: 6px; text-align: center; font-size: 11px; width: 100%;">
                    <i class="fas fa-check" style="color: #4caf50;"></i> Selesai
                </div>
            `;
      break;

    case "cancelled":
      buttons = `
                <div style="padding: 6px 10px; background: rgba(244,67,54,0.1); 
                           border-radius: 6px; text-align: center; font-size: 11px; width: 100%;">
                    <i class="fas fa-ban" style="color: #f44336;"></i> Dibatalkan
                </div>
            `;
      break;

    default:
      buttons = `<span style="font-size: 11px; color: rgba(255,255,255,0.5); width: 100%; text-align: center;">Unknown</span>`;
  }

  return buttons;
}

// 5. UPDATE ORDER STATUS DI BACKEND
async function updateOrderStatus(orderId, newStatus) {
  try {
    // Konfirmasi update
    const statusText = getStatusText(newStatus);
    const confirmMsg = getConfirmationMessage(newStatus);

    if (
      !confirm(`${confirmMsg}\n\nStatus akan diubah menjadi: ${statusText}`)
    ) {
      return;
    }

    console.log(`Updating order ${orderId} to status: ${newStatus}`);

    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();
    console.log("Update response:", data);

    if (data.success) {
      showNotification(
        `✅ Status order berhasil diupdate ke: ${statusText}`,
        "success",
      );

      // Update data lokal
      updateLocalOrderStatus(orderId, newStatus);

      // Refresh data dari server setelah 1 detik
      setTimeout(() => {
        loadOrders();
      }, 1000);
    } else {
      throw new Error(data.error || "Gagal update status");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showNotification(`❌ Gagal update status: ${error.message}`, "error");
  }
}

async function deleteOrderPermanently(orderId) {
  try {
    if (!confirm("Hapus order ini secara permanen?")) {
      return;
    }

    console.log(`Deleting order: ${orderId}`);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      showNotification(`✅ Order berhasil dihapus`, "success");
      loadOrders();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    showNotification(`❌ ${error.message}`, "error");
  }
}

async function viewOrderDetail(orderId) {
  try {
    // ✅ VALIDASI ORDER ID
    if (!orderId || orderId === "undefined" || orderId === "null") {
      console.error("❌ Order ID tidak valid:", orderId);
      showNotification("❌ ID Order tidak ditemukan", "error");
      return;
    }

    console.log(`🔍 Loading detail for order ${orderId}`);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      showOrderDetailModal(data.order);
    } else {
      throw new Error(data.error || "Gagal memuat detail order");
    }
  } catch (error) {
    console.error("❌ Error loading order detail:", error);
    showNotification("❌ Gagal memuat detail order: " + error.message, "error");
  }
}

function showPaymentProof(imageUrl) {
  console.log("Opening payment proof modal with URL:", imageUrl);

  const modal = document.getElementById("paymentProofModal");
  const image = document.getElementById("paymentProofImage");
  const fullSizeLink = document.getElementById("fullSizeLink");

  if (!modal) {
    console.error("Modal tidak ditemukan!");
    showNotification("❌ Modal bukti pembayaran tidak ditemukan", "error");
    return;
  }

  if (!image) {
    console.error("Image element tidak ditemukan!");
    showNotification("❌ Element gambar tidak ditemukan", "error");
    return;
  }

  // Reset zoom
  image.style.transform = "scale(1)";
  image.style.cursor = "zoom-in";
  image.classList.remove("zoomed");

  // SET IMAGE SOURCE - PASTIIN URL BENER!
  console.log("Setting image src to:", imageUrl);
  imageUrl = imageUrl.replace("https://", "http://");
  image.src = imageUrl + "?t=" + Date.now();
  image.alt = "Bukti Pembayaran";

  // Set full size link
  if (fullSizeLink) {
    fullSizeLink.href = imageUrl;
  }

  // ZOOM FUNCTION - SEDERHANA!
  image.onclick = function (e) {
    e.stopPropagation();
    e.preventDefault();

    if (this.style.transform === "scale(1.8)") {
      this.style.transform = "scale(1)";
      this.style.cursor = "zoom-in";
      this.classList.remove("zoomed");
    } else {
      this.style.transform = "scale(1.8)";
      this.style.cursor = "zoom-out";
      this.classList.add("zoomed");
    }
  };

  // TAMPILKAN MODAL!
  modal.style.display = "flex";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";

  console.log("✅ Payment proof modal displayed");
}

function closePaymentProofModal() {
  const modal = document.getElementById("paymentProofModal");
  const image = document.getElementById("paymentProofImage");

  if (modal) {
    // Reset zoom
    if (image) {
      image.style.transform = "scale(1)";
      image.style.cursor = "zoom-in";
      image.style.zIndex = "1";
    }

    modal.style.display = "none";
    modal.classList.remove("active");
    console.log("Payment proof modal closed");
  }
}

// Format Rupiah
function formatRupiah(amount) {
  if (!amount) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Parse Product Data dari JSON string/object
function parseProductData(productData) {
  if (!productData) return [];

  if (typeof productData === "string") {
    try {
      return JSON.parse(productData);
    } catch (e) {
      console.error("Error parsing product data:", e);
      return [{ name: "Data produk tidak valid" }];
    }
  }

  return Array.isArray(productData) ? productData : [];
}

// Get Status Class untuk CSS
function getStatusClass(status) {
  const statusMap = {
    pending_payment: "status-pending_payment",
    verified: "status-verified",
    completed: "status-delivered",
    cancelled: "status-cancelled",
  };
  return statusMap[status] || "status-pending_payment";
}

// Get Status Text untuk display
function getStatusText(status) {
  const statusMap = {
    pending_payment: "Menunggu Bayar",
    verified: "Terverifikasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return statusMap[status] || status;
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
}

// Get Confirmation Message
function getConfirmationMessage(status) {
  const messages = {
    verified: "Apakah Anda yakin ingin memverifikasi pembayaran ini?",
    completed: "Apakah Anda yakin ingin menandai order ini sebagai selesai?",
    cancelled: "Apakah Anda yakin ingin membatalkan order ini?",
  };
  return messages[status] || "Apakah Anda yakin?";
}

// Update Local Order Status di cache
function updateLocalOrderStatus(orderId, newStatus) {
  const orderIndex = allOrders.findIndex((o) => o.id == orderId);
  if (orderIndex !== -1) {
    allOrders[orderIndex].status = newStatus;
  }
}

// Apply Filter
function applyFilter(orders, filter) {
  if (filter === "all") return orders;
  return orders.filter((order) => order.status === filter);
}

// Apply Sort
function applySort(orders, sortBy) {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    if (sortBy === "newest" || sortBy === "oldest") {
      const aDate = new Date(a.created_at || 0);
      const bDate = new Date(b.created_at || 0);
      return sortBy === "newest" ? bDate - aDate : aDate - bDate;
    } else if (sortBy === "highest" || sortBy === "lowest") {
      const aPrice = a.total_price || 0;
      const bPrice = b.total_price || 0;
      return sortBy === "highest" ? bPrice - aPrice : aPrice - bPrice;
    }
    return 0;
  });

  return sorted;
}

// ===== UI FUNCTIONS =====

// Show Loading State
function showLoading() {
  const tbody = document.getElementById("ordersTableBody");
  if (tbody) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 60px 20px;">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Memuat data order...</p>
                    </div>
                </td>
            </tr>
        `;
  }
}

// Hide Loading State
function hideLoading() {
  // Loading state akan diganti saat renderOrders dipanggil
}

// Show Error State
function showError(message) {
  const tbody = document.getElementById("ordersTableBody");
  if (tbody) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 60px 20px;">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Gagal Memuat Data</h3>
                        <p>${message}</p>
                        <button onclick="loadOrders()" class="btn">
                            <i class="fas fa-redo"></i> Coba Lagi
                        </button>
                    </div>
                </td>
            </tr>
        `;
  }
}

function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // POSISI DI BAWAH
  notification.style.position = "fixed";
  notification.style.bottom = "30px";
  notification.style.right = "30px";
  notification.style.padding = "14px 22px";
  notification.style.borderRadius = "10px";
  notification.style.color = "white";
  notification.style.fontWeight = "500";
  notification.style.fontSize = "14px";
  notification.style.zIndex = "999999";
  notification.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.gap = "10px";
  notification.style.maxWidth = "380px";
  notification.style.animation = "slideUp 0.25s ease";

  if (type === "success") {
    notification.style.background = "#00b09b";
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  } else if (type === "error") {
    notification.style.background = "#ff416c";
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  } else {
    notification.style.background = "#00d9ff";
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideDown 0.25s ease";
    setTimeout(() => notification.remove(), 250);
  }, 3500);
}

function showOrderDetailModal(order) {
  console.log("🔍 Menampilkan detail order:", order);

  const modal = document.getElementById("viewOrderModal");
  const content = document.getElementById("orderDetailContent");

  if (!modal || !content) {
    console.error("❌ Modal atau content tidak ditemukan!");
    return;
  }

  const productData = Array.isArray(order.product_data)
    ? order.product_data
    : typeof order.product_data === "string"
      ? JSON.parse(order.product_data)
      : [];

  const formattedPrice = formatRupiah(order.total_price);
  const orderDate = formatDate(order.created_at);

  let productsHtml = "";
  if (productData && productData.length > 0) {
    productData.forEach((product) => {
      productsHtml += `
      <div class="product-item">
        <div class="product-info">
          <div class="product-name">${product.name || "Produk"}</div>
          ${product.variant ? `<div class="product-variant">${product.variant}</div>` : ""}
          <div class="product-quantity">Qty: ${product.quantity || 1}</div>
        </div>
        <div class="product-price">${formatRupiah(product.price || 0)}</div>
      </div>
    `;
    });
  } else {
    productsHtml = '<div class="no-data">Tidak ada produk</div>';
  }

  const proofUrl = order.payment_proof
    ? order.payment_proof.startsWith("http")
      ? order.payment_proof.replace("https://", "http://")
      : `http://192.168.100.17:3000${order.payment_proof}`
    : null;

  const html = `
    <div class="order-detail-container">
      <!-- Header -->
      <div class="detail-header">
        <div>
          <h2 class="order-code">${order.order_code || "N/A"}</h2>
          <p class="order-date">Dibuat: ${orderDate}</p>
        </div>
        <span class="status-badge ${getStatusClass(order.status)}">
          ${getStatusText(order.status)}
        </span>
      </div>
      
      <div class="detail-grid">
        <!-- Informasi Customer -->
        <div class="detail-card">
          <h4><i class="fas fa-user"></i> Informasi Customer</h4>
          <div class="detail-row">
            <span class="detail-label">Nama</span>
            <span class="detail-value">${order.customer_name || "N/A"}</span>
          </div>
            <span class="detail-label">WhatsApp</span>
            <div class="whatsapp-badge">
                <i class="fab fa-whatsapp"></i> 
                <a href="https://wa.me/${order.whatsapp?.replace(/[^0-9]/g, "") || "62"}" 
                  target="_blank" 
                  style="color: #25d366; text-decoration: none; font-weight: 600;">
                    ${order.whatsapp || "N/A"}
                </a>
            </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">${order.email || "-"}</span>
          </div>
        </div>
        
        <!-- Ringkasan Pembayaran -->
        <div class="detail-card">
          <h4><i class="fas fa-money-bill-wave"></i> Ringkasan Pembayaran</h4>
          <div class="detail-row">
            <span class="detail-label">Total Harga</span>
            <span class="detail-value total-price">${formattedPrice}</span>
          </div>
          ${
            proofUrl
              ? `
            <div class="proof-section">
              <span class="detail-label">Bukti Pembayaran</span>
              <a href="${proofUrl}" target="_blank" class="btn-proof">
                <i class="fas fa-image"></i> Lihat Bukti Pembayaran
              </a>
            </div>
          `
              : ""
          }
        </div>
      </div>
      
      <!-- Produk Dipesan -->
      <div class="detail-card products-card">
        <h4><i class="fas fa-box"></i> Produk Dipesan</h4>
        <div class="products-list">
          ${productsHtml}
        </div>
      </div>
      
      ${
        order.notes
          ? `
        <div class="detail-card notes-card">
          <h4><i class="fas fa-sticky-note"></i> Catatan</h4>
          <div class="notes-content">
            ${order.notes}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;

  content.innerHTML = html;
  modal.style.display = "flex";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";
}

function updateOrderStats(orders) {
  const totalCount = document.getElementById("totalOrdersCount");
  const pendingCount = document.getElementById("pendingOrdersCount");
  const verifiedCount = document.getElementById("verifiedOrdersCount");
  const todayRevenue = document.getElementById("todayRevenue");

  if (!orders || !Array.isArray(orders)) {
    console.error("Invalid orders data for stats");
    return;
  }

  // Total orders
  if (totalCount) totalCount.textContent = orders.length;

  // Pending orders (pending_payment)
  if (pendingCount) {
    const pending = orders.filter((o) => o.status === "pending_payment").length;
    pendingCount.textContent = pending;
  }

  // Verified orders
  if (verifiedCount) {
    const verified = orders.filter((o) => o.status === "verified").length;
    verifiedCount.textContent = verified;
  }

  // Today's revenue
  if (todayRevenue) {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((o) => {
      if (!o.created_at) return false;
      const orderDate = o.created_at.split(" ")[0];
      return orderDate === today;
    });

    const revenue = todayOrders.reduce(
      (sum, order) => sum + (order.total_price || 0),
      0,
    );
    todayRevenue.textContent = formatRupiah(revenue);
  }
}

// Update Pagination Info
function updatePaginationInfo(count) {
  const paginationInfo = document.getElementById("paginationInfo");
  if (paginationInfo) {
    paginationInfo.textContent = `Menampilkan ${count} order`;
  }
}

// ===== CHARTS FUNCTIONS =====

function initializeCharts() {
  // Inisialisasi chart kosong
  const ordersChartCtx = document
    .getElementById("ordersChart")
    ?.getContext("2d");
  const statusChartCtx = document
    .getElementById("statusChart")
    ?.getContext("2d");

  if (ordersChartCtx) {
    window.ordersChart = new Chart(ordersChartCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Order",
            data: [],
            borderColor: "#00d9ff",
            backgroundColor: "rgba(0, 217, 255, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "rgba(255, 255, 255, 0.8)",
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        },
      },
    });
  }

  if (statusChartCtx) {
    window.statusChart = new Chart(statusChartCtx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "rgba(255, 193, 7, 0.8)",
              "rgba(0, 217, 255, 0.8)",
              "rgba(76, 175, 80, 0.8)",
              "rgba(244, 67, 54, 0.8)",
            ],
            borderColor: [
              "rgba(255, 193, 7, 1)",
              "rgba(0, 217, 255, 1)",
              "rgba(76, 175, 80, 1)",
              "rgba(244, 67, 54, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "rgba(255, 255, 255, 0.8)",
              padding: 20,
            },
          },
        },
      },
    });
  }
}

function updateCharts(orders) {
  // Update line chart dengan data 7 hari terakhir
  if (window.ordersChart) {
    const last7Days = getLast7Days();
    const ordersByDay = countOrdersByDay(orders, last7Days);

    window.ordersChart.data.labels = last7Days.map((day) =>
      day.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
    );
    window.ordersChart.data.datasets[0].data = last7Days.map(
      (day) => ordersByDay[day.toISOString().split("T")[0]] || 0,
    );
    window.ordersChart.update();
  }

  // Update doughnut chart dengan status distribution
  if (window.statusChart) {
    const statusCounts = {
      pending_payment: orders.filter((o) => o.status === "pending_payment")
        .length,
      verified: orders.filter((o) => o.status === "verified").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    window.statusChart.data.labels = [
      "Menunggu Bayar",
      "Terverifikasi",
      "Selesai",
      "Dibatalkan",
    ];
    window.statusChart.data.datasets[0].data = [
      statusCounts.pending_payment,
      statusCounts.verified,
      statusCounts.completed,
      statusCounts.cancelled,
    ];
    window.statusChart.update();
  }
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

function countOrdersByDay(orders, days) {
  const count = {};
  days.forEach((day) => {
    const dayStr = day.toISOString().split("T")[0];
    count[dayStr] = 0;
  });

  orders.forEach((order) => {
    if (order.created_at) {
      const orderDate = order.created_at.split(" ")[0];
      if (count[orderDate] !== undefined) {
        count[orderDate]++;
      }
    }
  });

  return count;
}

// ===== FIX: SETUP ROW EVENT LISTENERS YANG BENAR =====
function setupRowEventListeners() {
  console.log("Setting up row event listeners...");

  const tbody = document.getElementById("ordersTableBody");
  if (tbody) {
    tbody.addEventListener("click", function (e) {
      const target = e.target;

      console.log("Clicked on:", target);

      // Handle tombol verifikasi
      if (target.closest(".action-btn.verify")) {
        e.stopPropagation();
        const verifyBtn = target.closest(".action-btn.verify");
        const orderId = verifyBtn.dataset.orderId;
        console.log("Verify clicked for order:", orderId);
        updateOrderStatus(orderId, "verified");
        return;
      }

      // Handle tombol selesai
      if (target.closest(".action-btn.complete")) {
        e.stopPropagation();
        const completeBtn = target.closest(".action-btn.complete");
        const orderId = completeBtn.dataset.orderId;
        console.log("Complete clicked for order:", orderId);
        updateOrderStatus(orderId, "completed");
        return;
      }

      // Handle tombol batal
      if (target.closest(".action-btn.cancel")) {
        e.stopPropagation();
        const cancelBtn = target.closest(".action-btn.cancel");
        const orderId = cancelBtn.dataset.orderId;
        console.log("Cancel clicked for order:", orderId);
        updateOrderStatus(orderId, "cancelled");
        return;
      }

      // Handle tombol hapus
      if (target.closest(".action-btn.delete")) {
        e.stopPropagation();
        const deleteBtn = target.closest(".action-btn.delete");
        const orderId = deleteBtn.dataset.orderId;
        console.log("Delete clicked for order:", orderId);
        deleteOrderPermanently(orderId);
        return;
      }

      // Handle payment proof thumbnail
      const proofThumbnail = target.closest(".payment-proof-thumbnail");
      const proofContainer = target.closest(".proof-thumbnail-container");
      const proofHover = target.closest(".proof-hover");

      if (proofThumbnail || proofContainer) {
        e.stopPropagation();
        e.preventDefault();

        let container = proofContainer;
        if (!container && proofThumbnail) {
          container = proofThumbnail.closest(".proof-thumbnail-container");
        }

        if (container) {
          const proofUrl = container.getAttribute("data-proof-url");
          console.log("🔍 Proof URL from thumbnail:", proofUrl);

          if (proofUrl) {
            showPaymentProof(proofUrl);
          } else {
            showNotification(
              "❌ URL bukti pembayaran tidak ditemukan",
              "error",
            );
          }
        }
        return;
      }
    });
  }

  setupDetailModalProofButtons();
}

function setupDetailModalProofButtons() {
  document.addEventListener("click", function (e) {
    if (e.target.closest(".view-proof-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest(".view-proof-btn");
      const proofUrl = button.getAttribute("data-proof-url");
      console.log("View proof button clicked in detail modal, URL:", proofUrl);
      if (proofUrl) {
        showPaymentProof(proofUrl);
      }
    }
  });
}

// Setup Main Event Listeners
function setupEventListeners() {
  console.log("Setting up event listeners...");

  // Search input
  const searchInput = document.getElementById("orderSearch");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterOrders(searchTerm);
      }, 300),
    );
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll(".action-btn[data-filter]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Update active state
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Apply filter
      currentFilter = this.dataset.filter;
      console.log("Filter changed to:", currentFilter);
      filterOrdersByStatus(currentFilter);
    });
  });

  // Sort select
  const sortSelect = document.getElementById("sortOrders");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentSort = this.value;
      console.log("Sort changed to:", currentSort);
      sortOrders(currentSort);
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById("refreshOrdersBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      console.log("Manual refresh triggered");
      loadOrders();
      showNotification("🔄 Memuat ulang data...", "info");
    });
  }

  // Print button
  const printBtn = document.getElementById("printOrdersBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

// Setup Modal Listeners
function setupModalListeners() {
  console.log("Setting up modal listeners...");

  // Close modals when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
        const image = document.getElementById("paymentProofImage");
        if (image) {
          image.style.transform = "scale(1)";
          image.style.cursor = "zoom-in";
        }
      }
    });
  });

  // Close buttons
  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        console.log("Modal closed");
        const image = document.getElementById("paymentProofImage");
        if (image) {
          image.style.transform = "scale(1)";
          image.style.cursor = "zoom-in";
        }
      }
    });
  });

  // Close order detail
  const closeDetailBtn = document.getElementById("closeOrderDetail");
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener("click", function () {
      const modal = document.getElementById("viewOrderModal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  // Close payment proof modal
  const closeProofBtn = document.getElementById("closeProofModal");
  if (closeProofBtn) {
    closeProofBtn.addEventListener("click", function () {
      closePaymentProofModal();
    });
  }

  // Escape key to close modals
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        if (modal.style.display === "flex") {
          modal.style.display = "none";
          const image = document.getElementById("paymentProofImage");
          if (image) {
            image.style.transform = "scale(1)";
            image.style.cursor = "zoom-in";
          }
        }
      });
    }
  });
}

// ===== FILTER & SORT FUNCTIONS =====

// Filter by search term
function filterOrders(searchTerm) {
  console.log("Filtering with search term:", searchTerm);

  const filtered = allOrders.filter((order) => {
    if (!searchTerm) return true;

    const searchableText = `
            ${order.order_code || ""}
            ${order.customer_name || ""}
            ${order.email || ""}
            ${order.whatsapp || ""}
            ${order.notes || ""}
            ${getStatusText(order.status) || ""}
        `.toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  renderOrders(filtered);
}

// Filter by status
function filterOrdersByStatus(status) {
  console.log("Filtering by status:", status);
  currentFilter = status;
  renderOrders(allOrders);
}

// Sort orders
function sortOrders(sortBy) {
  console.log("Sorting by:", sortBy);
  currentSort = sortBy;
  renderOrders(allOrders);
}

// ===== UTILITY FUNCTIONS =====

// Debounce function untuk search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== GLOBAL FUNCTIONS =====
window.showPaymentProof = showPaymentProof;
window.closePaymentProofModal = closePaymentProofModal;
window.loadOrders = loadOrders;
window.deleteOrderPermanently = deleteOrderPermanently;
window.viewOrderDetail = viewOrderDetail;
window.updateOrderStatus = updateOrderStatus;

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + R untuk refresh
  if ((e.ctrlKey || e.metaKey) && e.key === "r") {
    e.preventDefault();
    loadOrders();
    showNotification("🔄 Data direfresh", "info");
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "f") {
    e.preventDefault();
    const searchInput = document.getElementById("orderSearch");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
});
