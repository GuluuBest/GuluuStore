// customers.js - JavaScript untuk halaman Pelanggan

document.addEventListener("DOMContentLoaded", function () {
  // Initialize charts
  initializeCharts();

  // Initialize event listeners
  initializeEventListeners();

  // Initialize customer table interactions
  initializeCustomerTable();

  // Initialize modal interactions
  initializeModals();
});

// Initialize Charts
function initializeCharts() {
  // Customers Growth Chart
  const customersCtx = document.getElementById("customersChart");
  if (customersCtx) {
    const customersChart = new Chart(customersCtx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
        datasets: [
          {
            label: "Pelanggan Baru",
            data: [12, 19, 15, 25, 22, 30],
            backgroundColor: "rgba(157, 78, 221, 0.6)",
            borderColor: "#9d4edd",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#fff",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#fff",
              callback: function (value) {
                return value;
              },
            },
          },
        },
      },
    });
  }
}

// Initialize Event Listeners
function initializeEventListeners() {
  // Search functionality
  const searchInput = document.getElementById("customerSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      filterCustomers(searchTerm);
    });
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll(".action-btn[data-filter]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const filter = this.dataset.filter;
      filterCustomersByStatus(filter);
    });
  });

  // Sort select
  const sortSelect = document.getElementById("sortCustomers");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortCustomers(this.value);
    });
  }

  // Analytics period select
  const growthPeriod = document.getElementById("growthPeriod");
  if (growthPeriod) {
    growthPeriod.addEventListener("change", function () {
      updateGrowthChart(this.value);
    });
  }

  // Select All Customers checkbox
  const selectAllCheckbox = document.getElementById("selectAllCustomers");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const checkboxes = document.querySelectorAll(".customer-checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = this.checked;
      });
      updateBulkActions();
    });
  }

  // Export Customers button
  const exportBtn = document.getElementById("exportCustomersBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportCustomers();
    });
  }

  // Filter button
  const filterBtn = document.getElementById("filterCustomersBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      showAdvancedFilter();
    });
  }
}

// Initialize Customer Table
function initializeCustomerTable() {
  // Customer checkbox change
  const customerCheckboxes = document.querySelectorAll(".customer-checkbox");
  customerCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateBulkActions);
  });

  // Action buttons
  const viewButtons = document.querySelectorAll(".action-icon.view");
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const customerId = this.dataset.id;
      viewCustomerDetail(customerId);
    });
  });

  const editButtons = document.querySelectorAll(".action-icon.edit");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const customerId = this.dataset.id;
      editCustomer(customerId);
    });
  });

  const messageButtons = document.querySelectorAll(".action-icon.message");
  messageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const customerId = this.dataset.id;
      sendMessageToCustomer(customerId);
    });
  });
}

// Initialize Modals
function initializeModals() {
  // Modal close buttons
  const modalCloseButtons = document.querySelectorAll(".modal-close");
  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
    });
  });

  // Close modal when clicking outside
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  });
}

// ===== MAIN FUNCTIONS =====

// Filter customers by search term
function filterCustomers(searchTerm) {
  const rows = document.querySelectorAll("#customersTableBody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // Show/hide empty state
  const emptyState = document.getElementById("emptyCustomers");
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }
}

// Filter customers by status
function filterCustomersByStatus(status) {
  const rows = document.querySelectorAll("#customersTableBody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    const statusBadge = row.querySelector(".customer-badge");
    if (
      status === "all" ||
      (statusBadge && statusBadge.classList.contains(`badge-${status}`))
    ) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // Show/hide empty state
  const emptyState = document.getElementById("emptyCustomers");
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  // Update count display
  const totalCustomersCount = document.getElementById("totalCustomersCount");
  if (totalCustomersCount) {
    totalCustomersCount.textContent = visibleCount;
  }
}

// Sort customers
function sortCustomers(sortBy) {
  const tbody = document.getElementById("customersTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    if (sortBy === "newest" || sortBy === "oldest") {
      // Sort by customer ID (assume newer = higher number)
      const aId = a.querySelector(".customer-id").textContent;
      const bId = b.querySelector(".customer-id").textContent;
      const aNum = parseInt(aId.replace(/[^0-9]/g, "")) || 0;
      const bNum = parseInt(bId.replace(/[^0-9]/g, "")) || 0;

      return sortBy === "newest" ? bNum - aNum : aNum - bNum;
    } else if (sortBy === "name" || sortBy === "name-desc") {
      // Sort by customer name
      const aName = a.querySelector(".customer-name").textContent.toLowerCase();
      const bName = b.querySelector(".customer-name").textContent.toLowerCase();

      return sortBy === "name"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    } else if (sortBy === "orders") {
      // Sort by total orders
      const aOrders =
        parseInt(a.querySelector(".orders-count").textContent) || 0;
      const bOrders =
        parseInt(b.querySelector(".orders-count").textContent) || 0;

      return bOrders - aOrders;
    } else if (sortBy === "spent") {
      // Sort by total spent
      const aSpent = a.querySelector(".spent-amount").textContent;
      const bSpent = b.querySelector(".spent-amount").textContent;
      const aNum = parseInt(aSpent.replace(/[^0-9]/g, "")) || 0;
      const bNum = parseInt(bSpent.replace(/[^0-9]/g, "")) || 0;

      return bNum - aNum;
    }
    return 0;
  });

  // Reorder rows
  rows.forEach((row) => tbody.appendChild(row));
}

// Update growth chart
function updateGrowthChart(period) {
  console.log("Update growth chart for period:", period);
  // In real app, fetch new data from API
}

// Update bulk actions panel
function updateBulkActions() {
  const checkboxes = document.querySelectorAll(".customer-checkbox");
  const selectedCount = Array.from(checkboxes).filter(
    (cb) => cb.checked,
  ).length;
  const bulkActions = document.getElementById("bulkActions");
  const selectedCountElement = document.getElementById("selectedCount");

  if (selectedCountElement) {
    selectedCountElement.textContent = selectedCount;
  }

  if (bulkActions) {
    bulkActions.style.display = selectedCount > 0 ? "flex" : "none";
  }

  // Update select all checkbox
  const selectAllCheckbox = document.getElementById("selectAllCustomers");
  if (selectAllCheckbox) {
    const allChecked = selectedCount === checkboxes.length;
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate =
      selectedCount > 0 && selectedCount < checkboxes.length;
  }
}

// Export customers
function exportCustomers() {
  const selected = document.querySelectorAll(".customer-checkbox:checked");
  const exportAll = selected.length === 0;

  if (exportAll) {
    console.log("Exporting all customers...");
    alert("Mengekspor semua data pelanggan...");
  } else {
    console.log(`Exporting ${selected.length} customers...`);
    alert(`Mengekspor ${selected.length} pelanggan...`);
  }
  // In real app, generate and download CSV/Excel file
}

// Show advanced filter
function showAdvancedFilter() {
  console.log("Show advanced filter options");
  // In real app, show filter panel
  alert("Fitur filter lanjutan akan ditampilkan di sini");
}

// ===== CUSTOMER CRUD OPERATIONS =====

// View customer detail
function viewCustomerDetail(customerId) {
  const modal = document.getElementById("viewCustomerModal");
  const content = document.getElementById("customerDetailContent");

  if (modal && content) {
    // Find the customer row
    const customerRow = document
      .querySelector(`tr [data-id="${customerId}"]`)
      .closest("tr");

    // Extract customer data
    const customerName =
      customerRow.querySelector(".customer-name").textContent;
    const customerIdText =
      customerRow.querySelector(".customer-id").textContent;
    const email = customerRow.querySelector(".email-content").textContent;
    const phone = customerRow.querySelector(".phone-content").textContent;
    const ordersCount = customerRow.querySelector(".orders-count").textContent;
    const spentAmount = customerRow.querySelector(".spent-amount").textContent;
    const lastOrderDate =
      customerRow.querySelector(".last-order-date").textContent;
    const lastOrderAmount =
      customerRow.querySelector(".last-order-amount").textContent;
    const statusBadge = customerRow.querySelector(".customer-badge");
    const status = statusBadge ? statusBadge.textContent : "";

    // Generate customer detail HTML
    content.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="detail-info">
                    <h2>${customerName}</h2>
                    <p>${customerIdText} • ${status}</p>
                </div>
            </div>
            
            <div class="detail-sections">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informasi Kontak</h4>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${email}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Telepon</div>
                        <div class="detail-value">${phone}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">${status}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-chart-bar"></i> Statistik Belanja</h4>
                    <div class="detail-stats">
                        <div class="stat-card">
                            <h5>${ordersCount}</h5>
                            <p>Total Order</p>
                        </div>
                        <div class="stat-card">
                            <h5>${spentAmount}</h5>
                            <p>Total Belanja</p>
                        </div>
                        <div class="stat-card">
                            <h5>${lastOrderDate}</h5>
                            <p>Terakhir Order</p>
                        </div>
                        <div class="stat-card">
                            <h5>${lastOrderAmount}</h5>
                            <p>Order Terakhir</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section detail-orders">
                    <h4><i class="fas fa-shopping-cart"></i> Riwayat Order Terbaru</h4>
                    <div class="orders-list">
                        <div class="order-item">
                            <div class="order-info">
                                <h5>#GS-2025-015</h5>
                                <p>${lastOrderDate} • Keyboard Mechanical X1</p>
                            </div>
                            <div class="order-amount">${lastOrderAmount}</div>
                        </div>
                        <div class="order-item">
                            <div class="order-info">
                                <h5>#GS-2025-010</h5>
                                <p>7 hari lalu • Mouse Wireless Pro</p>
                            </div>
                            <div class="order-amount">Rp 320.000</div>
                        </div>
                        <div class="order-item">
                            <div class="order-info">
                                <h5>#GS-2025-005</h5>
                                <p>14 hari lalu • USB-C Hub 7in1</p>
                            </div>
                            <div class="order-amount">Rp 280.000</div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-history"></i> Aktivitas Terbaru</h4>
                    <div class="detail-timeline">
                        <div class="timeline-item">
                            <div class="timeline-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="timeline-content">
                                <h5>Order Baru</h5>
                                <p>Membuat order #GS-2025-015</p>
                                <div class="timeline-time">${lastOrderDate}</div>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="timeline-content">
                                <h5>Newsletter</h5>
                                <p>Membuka newsletter promo bulanan</p>
                                <div class="timeline-time">5 hari lalu</div>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-icon">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="timeline-content">
                                <h5>Update Profil</h5>
                                <p>Memperbarui informasi kontak</p>
                                <div class="timeline-time">10 hari lalu</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    modal.style.display = "flex";
  }
}

// Edit customer
function editCustomer(customerId) {
  const modal = document.getElementById("editCustomerModal");
  const form = document.getElementById("editCustomerForm");

  if (modal && form) {
    // Find the customer row
    const customerRow = document
      .querySelector(`tr [data-id="${customerId}"]`)
      .closest("tr");

    // Extract customer data
    const customerName =
      customerRow.querySelector(".customer-name").textContent;
    const email = customerRow.querySelector(".email-content").textContent;
    const phone = customerRow.querySelector(".phone-content").textContent;
    const statusBadge = customerRow.querySelector(".customer-badge");
    const status = statusBadge
      ? statusBadge.classList[1].replace("badge-", "")
      : "active";

    // Generate edit form HTML
    form.innerHTML = `
            <div class="modal-body">
                <div class="form-group">
                    <label for="editCustomerName">
                        <i class="fas fa-user"></i>
                        <span>Nama Lengkap *</span>
                    </label>
                    <input type="text" id="editCustomerName" name="customerName" value="${customerName}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCustomerEmail">
                        <i class="fas fa-envelope"></i>
                        <span>Email *</span>
                    </label>
                    <input type="email" id="editCustomerEmail" name="customerEmail" value="${email}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCustomerPhone">
                        <i class="fas fa-phone"></i>
                        <span>Telepon *</span>
                    </label>
                    <input type="tel" id="editCustomerPhone" name="customerPhone" value="${phone}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCustomerStatus">
                        <i class="fas fa-flag"></i>
                        <span>Status *</span>
                    </label>
                    <select id="editCustomerStatus" name="customerStatus" required>
                        <option value="premium" ${status === "premium" ? "selected" : ""}>Premium</option>
                        <option value="active" ${status === "active" ? "selected" : ""}>Aktif</option>
                        <option value="new" ${status === "new" ? "selected" : ""}>Baru</option>
                        <option value="inactive" ${status === "inactive" ? "selected" : ""}>Tidak Aktif</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editCustomerNotes">
                        <i class="fas fa-sticky-note"></i>
                        <span>Catatan (Opsional)</span>
                    </label>
                    <textarea id="editCustomerNotes" name="customerNotes" rows="3" placeholder="Tambah catatan tentang pelanggan..."></textarea>
                </div>
                
                <input type="hidden" id="editCustomerId" name="customerId" value="${customerId}">
            </div>
        `;

    modal.style.display = "flex";
  }
}

// Send message to customer
function sendMessageToCustomer(customerId) {
  const modal = document.getElementById("sendMessageModal");
  const customerInfo = document.getElementById("messageCustomerInfo");

  if (modal && customerInfo) {
    // Find the customer row
    const customerRow = document
      .querySelector(`tr [data-id="${customerId}"]`)
      .closest("tr");

    // Extract customer data
    const customerName =
      customerRow.querySelector(".customer-name").textContent;
    const email = customerRow.querySelector(".email-content").textContent;

    // Generate customer info HTML
    customerInfo.innerHTML = `
            <div style="background: rgba(157, 78, 221, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Pelanggan:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${email}</p>
            </div>
        `;

    // Set customer ID on form
    const form = document.getElementById("sendMessageForm");
    if (form) {
      form.dataset.customerId = customerId;
    }

    modal.style.display = "flex";
  }
}

// Delete customer
function deleteCustomer(customerId) {
  const modal = document.getElementById("deleteCustomerModal");
  const customerInfo = document.getElementById("customerToDelete");

  if (modal && customerInfo) {
    // Find the customer row
    const customerRow = document
      .querySelector(`tr [data-id="${customerId}"]`)
      .closest("tr");

    // Extract customer data
    const customerName =
      customerRow.querySelector(".customer-name").textContent;
    const email = customerRow.querySelector(".email-content").textContent;
    const ordersCount = customerRow.querySelector(".orders-count").textContent;
    const spentAmount = customerRow.querySelector(".spent-amount").textContent;

    // Generate customer info HTML
    customerInfo.innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p><strong>Nama:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Total Order:</strong> ${ordersCount}</p>
                <p><strong>Total Belanja:</strong> ${spentAmount}</p>
            </div>
        `;

    // Set customer ID on confirm button
    const confirmBtn = document.getElementById("confirmDeleteCustomer");
    if (confirmBtn) {
      confirmBtn.dataset.customerId = customerId;
    }

    modal.style.display = "flex";
  }
}

// ===== UPDATE CUSTOMER IN TABLE =====

function updateCustomerInTable(customerId, data) {
  const customerRow = document
    .querySelector(`tr [data-id="${customerId}"]`)
    .closest("tr");
  if (!customerRow) return;

  // Update all fields
  const customerName = customerRow.querySelector(".customer-name");
  const emailCell = customerRow.querySelector(".email-content");
  const phoneCell = customerRow.querySelector(".phone-content");
  const statusBadge = customerRow.querySelector(".customer-badge");

  if (customerName) customerName.textContent = data.customerName;
  if (emailCell) emailCell.textContent = data.customerEmail;
  if (phoneCell) phoneCell.textContent = data.customerPhone;

  if (statusBadge) {
    // Remove all badge classes
    statusBadge.classList.remove(
      "badge-premium",
      "badge-active",
      "badge-new",
      "badge-inactive",
    );

    // Add new badge class
    const badgeClass = `badge-${data.customerStatus}`;
    statusBadge.classList.add(badgeClass);

    // Update badge text and icon
    const statusText = getCustomerStatusText(data.customerStatus);
    const statusIcon = getCustomerStatusIcon(data.customerStatus);
    statusBadge.innerHTML = `<i class="fas fa-${statusIcon}"></i> ${statusText}`;
  }
}

function deleteCustomerFromTable(customerId) {
  const customerRow = document
    .querySelector(`tr [data-id="${customerId}"]`)
    .closest("tr");
  if (customerRow) {
    customerRow.remove();
    updateCustomerCounts();
    updateBulkActions();
  }
}

function getCustomerStatusText(status) {
  const statusMap = {
    premium: "Premium",
    active: "Aktif",
    new: "Baru",
    inactive: "Tidak Aktif",
  };
  return statusMap[status] || status;
}

function getCustomerStatusIcon(status) {
  const iconMap = {
    premium: "crown",
    active: "shopping-cart",
    new: "user-plus",
    inactive: "user-clock",
  };
  return iconMap[status] || "user";
}

function updateCustomerCounts() {
  const totalRows = document.querySelectorAll("#customersTableBody tr").length;
  const premiumRows = document.querySelectorAll(".badge-premium").length;
  const activeRows = document.querySelectorAll(".badge-active").length;

  const totalCount = document.getElementById("totalCustomersCount");
  const activeCount = document.getElementById("activeCustomersCount");
  const premiumCount = document.getElementById("premiumCustomersCount");

  if (totalCount) totalCount.textContent = totalRows;
  if (activeCount) activeCount.textContent = activeRows;
  if (premiumCount) premiumCount.textContent = premiumRows;
}

// ===== EVENT LISTENERS FOR MODALS =====

document.addEventListener("DOMContentLoaded", function () {
  // Close Customer Detail
  const closeCustomerDetailBtn = document.getElementById("closeCustomerDetail");
  if (closeCustomerDetailBtn) {
    closeCustomerDetailBtn.addEventListener("click", function () {
      document.getElementById("viewCustomerModal").style.display = "none";
    });
  }

  // Cancel Edit Customer
  const cancelEditBtn = document.getElementById("cancelEditCustomer");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", function () {
      document.getElementById("editCustomerModal").style.display = "none";
    });
  }

  // Edit Customer Form Submission
  const editCustomerForm = document.getElementById("editCustomerForm");
  if (editCustomerForm) {
    editCustomerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const customerId = document.getElementById("editCustomerId").value;
      const customerName = document.getElementById("editCustomerName").value;
      const customerEmail = document.getElementById("editCustomerEmail").value;
      const customerPhone = document.getElementById("editCustomerPhone").value;
      const customerStatus =
        document.getElementById("editCustomerStatus").value;
      const customerNotes = document.getElementById("editCustomerNotes").value;

      updateCustomerInTable(customerId, {
        customerName,
        customerEmail,
        customerPhone,
        customerStatus,
        customerNotes,
      });

      document.getElementById("editCustomerModal").style.display = "none";
      alert("Data pelanggan berhasil diupdate!");
    });
  }

  // Cancel Message
  const cancelMessageBtn = document.getElementById("cancelMessage");
  if (cancelMessageBtn) {
    cancelMessageBtn.addEventListener("click", function () {
      document.getElementById("sendMessageModal").style.display = "none";
      document.getElementById("sendMessageForm").reset();
    });
  }

  // Send Message Form Submission
  const sendMessageForm = document.getElementById("sendMessageForm");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const customerId = this.dataset.customerId;
      const messageType = document.getElementById("messageType").value;
      const messageSubject = document.getElementById("messageSubject").value;
      const messageContent = document.getElementById("messageContent").value;

      console.log("Sending message to customer:", customerId);
      console.log("Message type:", messageType);
      console.log("Subject:", messageSubject);
      console.log("Content:", messageContent);

      document.getElementById("sendMessageModal").style.display = "none";
      this.reset();

      alert("Pesan berhasil dikirim ke pelanggan!");
    });
  }

  // Confirm Delete Customer
  const confirmDeleteBtn = document.getElementById("confirmDeleteCustomer");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      const customerId = this.dataset.customerId;
      deleteCustomerFromTable(customerId);
      document.getElementById("deleteCustomerModal").style.display = "none";
      alert("Pelanggan berhasil dihapus!");
    });
  }

  // Cancel Delete Customer
  const cancelDeleteBtn = document.getElementById("cancelDeleteCustomer");
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", function () {
      document.getElementById("deleteCustomerModal").style.display = "none";
    });
  }

  // Send Message Button in Detail Modal
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", function () {
      // Get customer ID from somewhere (could be stored in modal)
      console.log("Send message from detail modal");
      alert("Membuka form kirim pesan...");
    });
  }

  // Bulk Actions
  const bulkExportBtn = document.getElementById("bulkExport");
  const bulkMessageBtn = document.getElementById("bulkMessage");
  const bulkDeleteBtn = document.getElementById("bulkDelete");
  const bulkStatusSelect = document.getElementById("bulkStatus");

  if (bulkExportBtn) {
    bulkExportBtn.addEventListener("click", function () {
      const selected = document.querySelectorAll(".customer-checkbox:checked");
      if (selected.length === 0) {
        alert("Pilih pelanggan terlebih dahulu");
        return;
      }
      alert(`Mengekspor ${selected.length} pelanggan...`);
    });
  }

  if (bulkMessageBtn) {
    bulkMessageBtn.addEventListener("click", function () {
      const selected = document.querySelectorAll(".customer-checkbox:checked");
      if (selected.length === 0) {
        alert("Pilih pelanggan terlebih dahulu");
        return;
      }
      alert(`Membuka form pesan untuk ${selected.length} pelanggan...`);
    });
  }

  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", function () {
      const selected = document.querySelectorAll(".customer-checkbox:checked");
      if (selected.length === 0) {
        alert("Pilih pelanggan terlebih dahulu");
        return;
      }

      if (
        confirm(
          `Apakah Anda yakin ingin menghapus ${selected.length} pelanggan?`,
        )
      ) {
        selected.forEach((checkbox) => {
          const customerId = checkbox.dataset.id;
          deleteCustomerFromTable(customerId);
        });
        alert(`${selected.length} pelanggan berhasil dihapus!`);
      }
    });
  }

  if (bulkStatusSelect) {
    bulkStatusSelect.addEventListener("change", function () {
      const selected = document.querySelectorAll(".customer-checkbox:checked");
      if (selected.length === 0) {
        alert("Pilih pelanggan terlebih dahulu");
        this.selectedIndex = 0;
        return;
      }

      if (this.value) {
        selected.forEach((checkbox) => {
          const customerId = checkbox.dataset.id;
          // In real app, update customer status via API
          console.log(`Update status ${this.value} for customer ${customerId}`);
        });
        alert(`Status ${selected.length} pelanggan berhasil diupdate!`);
        this.selectedIndex = 0;
      }
    });
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + F for search
  if ((e.ctrlKey || e.metaKey) && e.key === "f") {
    e.preventDefault();
    const searchInput = document.getElementById("customerSearch");
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Escape to close modals
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  }
});
