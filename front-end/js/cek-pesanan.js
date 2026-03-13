document.addEventListener("DOMContentLoaded", function () {
  const orderIdInput = document.getElementById("orderId");
  const emailInput = document.getElementById("email");
  const searchBtn = document.getElementById("searchOrderBtn");
  const loadingState = document.getElementById("loadingState");
  const orderResult = document.getElementById("orderResult");
  const noOrderFound = document.getElementById("noOrderFound");
  const recentOrdersList = document.getElementById("recentOrdersList");
  const contactSupportBtn = document.getElementById("contactSupportBtn");

  const API_URL = "http://192.168.100.17:3000/api";

  function init() {
    attachEventListeners();
    checkUrlParams();
    loadRecentOrdersFromStorage();
  }

  function attachEventListeners() {
    searchBtn.addEventListener("click", handleSearch);

    orderIdInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleSearch();
    });

    emailInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleSearch();
    });

    if (contactSupportBtn) {
      contactSupportBtn.addEventListener("click", function () {
        window.open("https://wa.me/6285793903739", "_blank");
      });
    }
  }

  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("id");
    const email = urlParams.get("email");

    if (orderId) {
      orderIdInput.value = orderId;
      if (email) {
        emailInput.value = decodeURIComponent(email);
      }
      setTimeout(handleSearch, 100);
    }
  }

  async function handleSearch() {
    const orderId = orderIdInput.value.trim();
    const email = emailInput.value.trim();

    if (!validateInput(orderId, email)) {
      return;
    }

    showLoading();

    try {
      if (orderId) {
        await searchByOrderId(orderId);
      } else {
        showNotification("Masukkan ID Pesanan untuk melacak", "info");
        hideLoading();
        showNoOrderFound();
      }
    } catch (error) {
      console.error("Search error:", error);
      hideLoading();
      showNoOrderFound();
    }
  }

  async function searchByOrderId(orderId) {
    try {
      const response = await fetch(`${API_URL}/orders`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const result = await response.json();

      if (result.success && result.orders) {
        const order = result.orders.find(
          (o) =>
            o.order_code.toLowerCase() === orderId.toLowerCase() ||
            o.id.toString() === orderId,
        );

        if (order) {
          hideLoading();
          showOrderResult(order);
          saveToLocalStorage(order);
        } else {
          hideLoading();
          showNoOrderFound();
        }
      } else {
        hideLoading();
        showNoOrderFound();
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  function validateInput(orderId, email) {
    if (!orderId && !email) {
      showNotification("Mohon masukkan ID Pesanan", "error");
      return false;
    }

    if (orderId && orderId.length < 3) {
      showNotification("ID Pesanan tidak valid", "error");
      return false;
    }

    if (email && !isValidEmail(email)) {
      showNotification("Format Email tidak valid", "error");
      return false;
    }

    return true;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showLoading() {
    orderResult.style.display = "none";
    noOrderFound.style.display = "none";
    loadingState.style.display = "block";
  }

  function hideLoading() {
    loadingState.style.display = "none";
  }

  function showOrderResult(order) {
    try {
      const productData =
        typeof order.product_data === "string"
          ? JSON.parse(order.product_data)
          : order.product_data || [];

      const statusClass = getStatusClass(order.status);
      const formattedDate = formatDate(order.created_at);
      const formattedTotal = formatCurrency(order.total_price);

      let itemsHtml = "";

      if (productData.length > 0) {
        productData.forEach((item) => {
          itemsHtml += `
                        <div class="product-item">
                            <div class="product-icon">
                                <i class="fas fa-${getProductIcon(item.category || "Aplikasi Premium")}"></i>
                            </div>
                            <div class="product-info">
                                <h4>${item.name || "Produk"}</h4>
                                <p>${item.category || "Digital Product"} | Qty: ${item.quantity || 1}</p>
                            </div>
                            <div class="product-price">
                                ${formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </div>
                        </div>
                    `;
        });
      } else {
        itemsHtml = `
                    <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                        <i class="fas fa-box-open fa-3x" style="margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>Tidak ada detail produk</p>
                    </div>
                `;
      }

      const html = `
                <div class="order-result-content">
                    <div class="order-header">
                        <div class="order-id">
                            <i class="fas fa-hashtag"></i>
                            ${order.order_code || `ORD-${order.id}`}
                        </div>
                        <div class="order-date">
                            <i class="fas fa-calendar"></i> ${formattedDate}
                        </div>
                    </div>
                    
                    <div class="order-body">
                        <div class="order-status">
                            <span class="status-badge ${statusClass}">
                                ${getStatusText(order.status)}
                            </span>
                            <span class="status-message">
                                ${getStatusMessage(order.status)}
                            </span>
                        </div>
                        
                        ${renderOrderProgress(order.status)}
                        
                        <div class="order-details">
                            <div class="detail-item">
                                <h4><i class="fas fa-user"></i> Nama</h4>
                                <p>${order.customer_name || "Tidak tersedia"}</p>
                            </div>
                            <div class="detail-item">
                                <h4><i class="fas fa-phone"></i> WhatsApp</h4>
                                <p>${order.whatsapp || "Tidak tersedia"}</p>
                            </div>
                            <div class="detail-item">
                                <h4><i class="fas fa-envelope"></i> Email</h4>
                                <p>${order.email || "Tidak tersedia"}</p>
                            </div>
                            <div class="detail-item">
                                <h4><i class="fas fa-tag"></i> Total</h4>
                                <p style="color: var(--primary); font-weight: 700;">${formattedTotal}</p>
                            </div>
                        </div>
                        
                        <div class="order-products">
                            <h3><i class="fas fa-box"></i> Detail Produk</h3>
                            ${itemsHtml}
                        </div>
                        
                        ${renderDigitalAccess(order)}
                        
                        ${
                          order.notes
                            ? `
                            <div style="margin-top: 25px; padding: 20px; background: rgba(0,217,255,0.05); border-radius: 10px;">
                                <h4 style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: var(--text-primary);">
                                    <i class="fas fa-sticky-note" style="color: var(--primary);"></i> Catatan
                                </h4>
                                <p style="color: var(--text-secondary); margin: 0;">${order.notes}</p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="order-actions">
                        <button class="action-btn btn-invoice" onclick="showInvoice('${order.id}')">
                            <i class="fas fa-file-invoice"></i> Lihat Invoice
                        </button>
                        <button class="action-btn btn-support" onclick="contactSupport('${order.order_code || order.id}')">
                            <i class="fas fa-headset"></i> Hubungi Support
                        </button>
                        <button class="action-btn btn-track" onclick="viewPaymentProof('${order.payment_proof}')">
                            <i class="fas fa-image"></i> Bukti Pembayaran
                        </button>
                    </div>
                </div>
            `;

      orderResult.innerHTML = html;
      orderResult.style.display = "block";
      window.scrollTo({
        top: orderResult.offsetTop - 100,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error rendering order:", error);
      showNoOrderFound();
    }
  }

  function renderOrderProgress(status) {
    const statusMap = {
      pending_payment: 1,
      verified: 2,
      completed: 3,
      cancelled: -1,
    };

    const steps = [
      {
        icon: "fa-clipboard-check",
        label: "Pesanan Dibuat",
        status: "created",
      },
      {
        icon: "fa-credit-card",
        label: "Pembayaran",
        status: "pending_payment",
      },
      { icon: "fa-check-circle", label: "Verifikasi", status: "verified" },
      { icon: "fa-cog", label: "Diproses", status: "processing" },
      { icon: "fa-check-double", label: "Selesai", status: "completed" },
    ];

    let currentStepIndex = 0;
    if (status === "pending_payment") currentStepIndex = 1;
    if (status === "verified") currentStepIndex = 2;
    if (status === "completed") currentStepIndex = 4;
    if (status === "cancelled") currentStepIndex = -1;

    let stepsHtml = '<div class="order-status-progress">';

    steps.forEach((step, index) => {
      if (index === 3) return;

      let stepClass = "";

      if (currentStepIndex >= index && status !== "cancelled") {
        stepClass = "completed";
      }
      if (index === currentStepIndex) {
        stepClass = "active";
      }

      stepsHtml += `
                <div class="status-step ${stepClass}">
                    <div class="step-icon">
                        <i class="fas ${step.icon}"></i>
                    </div>
                    <span>${step.label}</span>
                </div>
            `;
    });

    stepsHtml += "</div>";
    return stepsHtml;
  }

  function renderDigitalAccess(order) {
    if (order.status !== "completed") {
      return "";
    }

    return `
            <div class="digital-access">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <i class="fas fa-key" style="font-size: 24px; color: var(--primary);"></i>
                    <h4 style="margin: 0; color: var(--text-primary);">Akses Digital Anda</h4>
                </div>
                <div class="access-credentials" id="credentials-${order.id}">
                    Status: Pesanan telah selesai diproses<br>
                    ID Pesanan: ${order.order_code || `ORD-${order.id}`}<br>
                    Tanggal: ${formatDate(order.created_at)}<br>
                    Total: ${formatCurrency(order.total_price)}
                </div>
                <button class="copy-btn" onclick="copyOrderInfo('${order.id}')">
                    <i class="fas fa-copy"></i> Salin Informasi
                </button>
            </div>
        `;
  }

  function showNoOrderFound() {
    orderResult.style.display = "none";
    noOrderFound.style.display = "block";
  }

  function loadRecentOrdersFromStorage() {
    if (!recentOrdersList) return;

    const recentSearches = JSON.parse(
      localStorage.getItem("recentOrderSearches") || "[]",
    );

    if (recentSearches.length === 0) {
      recentOrdersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Belum Ada Pesanan</h3>
                    <p>Anda belum melakukan pencarian pesanan</p>
                    <a href="kategori.html" style="text-decoration: none;">
                        <button style="background: var(--accent-gradient); border: none; padding: 12px 24px; border-radius: 8px; color: #0a1929; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-shopping-cart"></i> Belanja Sekarang
                        </button>
                    </a>
                </div>
            `;
      return;
    }

    let html = "";
    recentSearches.slice(0, 3).forEach((item) => {
      html += `
                <div class="order-card">
                    <div class="order-card-info">
                        <h4>${item.id}</h4>
                        <p>
                            <span style="color: var(--text-secondary);">
                                ${item.email || "No email"}
                            </span>
                        </p>
                        <p style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                            ${formatRelativeTime(item.timestamp)}
                        </p>
                    </div>
                    <div class="order-card-actions">
                        <button class="card-action-btn btn-view" onclick="quickViewOrder('${item.id}')">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                    </div>
                </div>
            `;
    });

    recentOrdersList.innerHTML = html;
  }

  function saveToLocalStorage(order) {
    const recentSearches = JSON.parse(
      localStorage.getItem("recentOrderSearches") || "[]",
    );
    const orderId = order.order_code || `ORD-${order.id}`;

    if (!recentSearches.some((o) => o.id === orderId)) {
      recentSearches.unshift({
        id: orderId,
        email: order.email || "",
        timestamp: new Date().toISOString(),
      });

      if (recentSearches.length > 5) {
        recentSearches.pop();
      }

      localStorage.setItem(
        "recentOrderSearches",
        JSON.stringify(recentSearches),
      );
      loadRecentOrdersFromStorage();
    }
  }

  function getStatusClass(status) {
    const classes = {
      pending_payment: "status-pending",
      verified: "status-processing",
      completed: "status-completed",
      cancelled: "status-cancelled",
      processing: "status-processing",
    };
    return classes[status] || "status-pending";
  }

  function getStatusText(status) {
    const texts = {
      pending_payment: "Menunggu Pembayaran",
      verified: "Terverifikasi",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      processing: "Diproses",
    };
    return texts[status] || status;
  }

  function getStatusMessage(status) {
    const messages = {
      pending_payment: "Menunggu konfirmasi pembayaran dari admin",
      verified: "Pembayaran telah diverifikasi, pesanan sedang diproses",
      completed: "Pesanan telah selesai dan dapat diakses",
      cancelled: "Pesanan dibatalkan, hubungi support untuk info lebih lanjut",
      processing: "Pesanan sedang diproses",
    };
    return messages[status] || "Status pesanan sedang diperbarui";
  }

  function getProductIcon(category) {
    const icons = {
      "Aplikasi Premium": "crown",
      Discord: "discord",
      Jasa: "briefcase",
      Template: "file-alt",
      "Digital Product": "download",
    };
    return icons[category] || "box";
  }

  function formatDate(dateString) {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const options = { day: "numeric", month: "long", year: "numeric" };
      return new Date(dateString).toLocaleDateString("id-ID", options);
    } catch {
      return dateString;
    }
  }

  function formatRelativeTime(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit yang lalu`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} hari yang lalu`;

      return formatDate(timestamp);
    } catch {
      return "Waktu tidak diketahui";
    }
  }

  function formatCurrency(amount) {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function showNotification(message, type = "success") {
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
            <p>${message}</p>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

    document.body.appendChild(notification);

    notification
      .querySelector(".notification-close")
      .addEventListener("click", function () {
        notification.remove();
      });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  window.showInvoice = function (orderId) {
    showNotification("Fitur invoice akan segera hadir", "info");
  };

  window.contactSupport = function (orderCode) {
    const message = `Halo, saya ingin menanyakan pesanan dengan ID: ${orderCode}`;
    window.open(
      `https://wa.me/6285793903739?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  window.viewPaymentProof = function (proofPath) {
    if (!proofPath) {
      showNotification("Bukti pembayaran tidak tersedia", "error");
      return;
    }

    const baseUrl = "http://192.168.100.17:3000";
    const imageUrl = proofPath.startsWith("http")
      ? proofPath
      : `${baseUrl}${proofPath}`;
    window.open(imageUrl, "_blank");
  };

  window.quickViewOrder = function (orderId) {
    document.getElementById("orderId").value = orderId;
    handleSearch();
  };

  window.copyOrderInfo = function (orderId) {
    const credentialsElement = document.getElementById(
      `credentials-${orderId}`,
    );
    if (credentialsElement) {
      const text = credentialsElement.innerText;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showNotification("Informasi pesanan berhasil disalin!", "success");
        })
        .catch(() => {
          showNotification("Gagal menyalin informasi", "error");
        });
    }
  };

  init();
});
