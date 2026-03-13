const API_URL = "https://guluustore.onrender.com/api";

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();
  setupFilterButtons();
});

async function loadOrders(filter = "all") {
  const ordersList = document.getElementById("ordersList");
  const emptyState = document.getElementById("emptyState");

  // Show loading
  ordersList.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Memuat riwayat order...</p>
        </div>
    `;
  emptyState.style.display = "none";

  try {
    // Get all orders from backend
    const response = await fetch(`${API_URL}/orders`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Filter orders
      let filteredOrders = result.orders;
      if (filter !== "all") {
        filteredOrders = result.orders.filter(
          (order) => order.status === filter,
        );
      }

      // Sort by date (newest first)
      filteredOrders.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      if (filteredOrders.length === 0) {
        ordersList.style.display = "none";
        emptyState.style.display = "block";
        return;
      }

      // Render orders
      renderOrders(filteredOrders);
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Gagal memuat riwayat</h3>
                <p>${error.message}</p>
                <button onclick="loadOrders()" class="btn-primary">
                    <i class="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        `;
  }
}

function renderOrders(orders) {
  const ordersList = document.getElementById("ordersList");

  let html = "";

  orders.forEach((order) => {
    const statusClass = getStatusClass(order.status);
    const statusText = getStatusText(order.status);
    const date = new Date(order.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Parse product data
    let productData;
    try {
      productData =
        typeof order.product_data === "string"
          ? JSON.parse(order.product_data)
          : order.product_data;
    } catch (e) {
      productData = [];
    }

    // Calculate total items
    const totalItems = productData.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );

    html += `
            <div class="order-card ${statusClass}">
                <div class="order-header">
                    <div class="order-meta">
                        <span class="order-code">${order.order_code}</span>
                        <span class="order-date">${date}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge">${statusText}</span>
                    </div>
                </div>
                
                <div class="order-body">
                    <div class="customer-info">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span>${order.customer_name}</span>
                        </div>
                        <div class="info-item">
                            <i class="fab fa-whatsapp"></i>
                            <span>${order.whatsapp}</span>
                        </div>
                    </div>
                    
                    <div class="order-items">
                        <h4><i class="fas fa-box"></i> Items (${totalItems})</h4>
                        ${productData
                          .map(
                            (item) => `
                            <div class="order-item">
                                <div class="item-name">${item.name}</div>
                                <div class="item-meta">
                                    ${item.variant ? `<span class="item-variant">${item.variant}</span>` : ""}
                                    <span class="item-quantity">Qty: ${item.quantity || 1}</span>
                                    <span class="item-price">Rp ${(item.price * (item.quantity || 1)).toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    
                    <div class="order-total">
                        <span>Total Pembayaran:</span>
                        <strong>Rp ${order.total_price.toLocaleString("id-ID")}</strong>
                    </div>
                </div>
                
                <div class="order-footer">
                    <a href="http://localhost:3000${order.payment_proof}" target="_blank" class="btn-secondary">
                        <i class="fas fa-receipt"></i> Lihat Bukti Bayar
                    </a>
                    <button onclick="contactAboutOrder('${order.order_code}')" class="btn-whatsapp">
                        <i class="fab fa-whatsapp"></i> Tanya Order Ini
                    </button>
                </div>
            </div>
        `;
  });

  ordersList.innerHTML = html;
  ordersList.style.display = "block";
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Load orders with filter
      const filter = this.getAttribute("data-filter");
      loadOrders(filter);
    });
  });
}

function getStatusClass(status) {
  const statusClasses = {
    pending_payment: "status-pending",
    verified: "status-verified",
    completed: "status-completed",
    cancelled: "status-cancelled",
  };
  return statusClasses[status] || "status-pending";
}

function getStatusText(status) {
  const statusTexts = {
    pending_payment: "Menunggu Verifikasi",
    verified: "Terverifikasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return statusTexts[status] || "Menunggu";
}

function contactAboutOrder(orderCode) {
  const message = `Halo admin, saya ingin menanyakan tentang order saya:\nKode Order: ${orderCode}`;
  const whatsappUrl = `https://wa.me/6285793903739?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

// Add styles for orders list
const style = document.createElement("style");
style.textContent = `
    .orders-list {
        display: grid;
        gap: 20px;
    }
    
    .order-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 20px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }
    
    .order-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .order-meta {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .order-code {
        font-weight: bold;
        font-family: monospace;
        color: var(--primary);
        font-size: 16px;
    }
    
    .order-date {
        font-size: 14px;
        color: var(--text-muted);
    }
    
    .status-badge {
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .order-card.status-pending .status-badge {
        background: #fff3cd;
        color: #856404;
    }
    
    .order-card.status-verified .status-badge {
        background: #d1ecf1;
        color: #0c5460;
    }
    
    .order-card.status-completed .status-badge {
        background: #d4edda;
        color: #155724;
    }
    
    .order-card.status-cancelled .status-badge {
        background: #f8d7da;
        color: #721c24;
    }
    
    .order-footer {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .orders-filter {
        display: flex;
        gap: 10px;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }
    
    .filter-btn {
        padding: 8px 16px;
        border-radius: 20px;
        border: 2px solid var(--border-color);
        background: transparent;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .filter-btn.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
    }
`;
document.head.appendChild(style);
