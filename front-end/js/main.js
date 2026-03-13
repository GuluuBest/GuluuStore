// main.js - GANTI menjadi:

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const themeToggle = document.getElementById("themeToggle");
const sortSelect = document.querySelector(".sort-select");
const filterTags = document.querySelectorAll(".filter-tag");
const productCount = document.querySelector(".product-count");

// State
let currentProducts = [];
let displayedCount = 8;
let currentFilter = "all";
let currentSort = "popular";

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Load products
  loadProducts();

  // Setup event listeners
  setupEventListeners();

  // Check saved theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
  themeToggle.checked = savedTheme === "light";
});

// Load and render products
function loadProducts() {
  currentProducts = getProducts(); // Gunakan fungsi dari data.js
  applyFiltersAndSort();
  renderProducts();
}

function applyFiltersAndSort() {
  // Apply filter
  if (currentFilter === "all") {
    currentProducts = getProducts(); // Gunakan fungsi dari data.js
  } else {
    currentProducts = getProducts().filter(
      (product) => product.category === currentFilter,
    );
  }

  // Apply sorting - PERBAIKI sorting untuk include variant
  switch (currentSort) {
    case "newest":
      currentProducts.sort((a, b) => b.id - a.id);
      break;
    case "price-low":
      currentProducts.sort(
        (a, b) => getLowestProductPrice(a) - getLowestProductPrice(b),
      );
      break;
    case "price-high":
      currentProducts.sort(
        (a, b) => getLowestProductPrice(b) - getLowestProductPrice(a),
      );
      break;
    case "popular":
    default:
      currentProducts.sort((a, b) => b.sold - a.sold);
      break;
  }
}

function getLowestProductPrice(product) {
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
}

function renderProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  const productsToShow = currentProducts.slice(0, displayedCount);

  if (productsToShow.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search fa-3x"></i>
        <h3>Tidak ada produk ditemukan</h3>
        <p>Coba ubah pencarian atau filter</p>
      </div>
    `;
    loadMoreBtn.style.display = "none";
    return;
  }

  productsToShow.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });

  // Update product count
  if (productCount) {
    productCount.textContent = `${currentProducts.length} Produk Ditemukan`;
  }

  // Show/hide load more button
  if (loadMoreBtn) {
    loadMoreBtn.style.display =
      displayedCount >= currentProducts.length ? "none" : "block";
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-id", product.id);
  card.setAttribute("data-category", product.category);

  const badgeClass = product.status === "ready" ? "badge-ready" : "badge-sold";
  const badgeText = product.status === "ready" ? "Ready" : "Habis";
  const stockText =
    product.status === "ready"
      ? `${product.hasVariants && product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock} tersedia`
      : "Stok habis";
  const iconClass = product.icon || "fas fa-box";

  // Hitung harga terendah
  const lowestPrice = getLowestProductPrice(product);
  const originalPrice = product.originalPrice || lowestPrice * 3;
  const discountPercentage = Math.round(
    (1 - lowestPrice / originalPrice) * 100,
  );

  card.innerHTML = `
    <div class="product-badge ${badgeClass}">${badgeText}</div>
    <div class="product-image">
      <i class="${iconClass}"></i>
    </div>
    <div class="product-content">
      <div class="product-category" data-category="${product.category}">
        <i class="fas fa-tag"></i>
        ${product.category}
      </div>
      <h3 class="product-title">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-price">
        <span class="price-label">Mulai dari:</span>
        <span class="price-value">Rp ${lowestPrice.toLocaleString("id-ID")}</span>
        ${discountPercentage > 0 ? `<span class="price-discount">${discountPercentage}% OFF</span>` : ""}
      </div>
      <div class="product-meta">
        <span class="meta-item">
          <i class="fas fa-star" style="color: #FFD700;"></i>
          ${product.rating}
        </span>
        <span class="meta-item">
          <i class="fas fa-shopping-cart"></i>
          ${product.sold} terjual
        </span>
      </div>
      <div class="product-footer">
        <div class="product-stock">
          <i class="fas fa-${product.status === "ready" ? "check-circle" : "times-circle"}"></i>
          ${stockText}
        </div>
        <div class="product-actions">
          <button class="detail-btn" data-id="${product.id}">
            <i class="fas fa-eye"></i>
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
    `;

  // Add click event to detail button
  const detailBtn = card.querySelector(".detail-btn");
  detailBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `produk.html?id=${product.id}`;
  });

  // Add click event to category
  const categoryEl = card.querySelector(".product-category");
  categoryEl.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `kategori.html?category=${encodeURIComponent(product.category)}`;
  });

  // Add click event to entire card (optional)
  card.addEventListener("click", (e) => {
    if (
      !e.target.closest(".detail-btn") &&
      !e.target.closest(".product-category")
    ) {
      window.location.href = `produk.html?id=${product.id}`;
    }
  });

  return card;
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      const theme = this.checked ? "light" : "dark";
      setTheme(theme);
      localStorage.setItem("theme", theme);
    });
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      displayedCount += 4;
      renderProducts();

      // Scroll to newly loaded products
      const newProducts = productsGrid.children;
      if (newProducts.length > 0) {
        newProducts[newProducts.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentSort = this.value;
      applyFiltersAndSort();
      renderProducts();
    });
  }

  // Filter tags
  if (filterTags.length > 0) {
    filterTags.forEach((tag) => {
      tag.addEventListener("click", function () {
        // Remove active class from all tags
        filterTags.forEach((t) => t.classList.remove("active"));

        // Add active class to clicked tag
        this.classList.add("active");

        // Update current filter
        const filterText = this.textContent;
        currentFilter = filterText === "Semua" ? "all" : filterText;

        // Reset displayed count
        displayedCount = 8;

        // Apply filter and re-render
        applyFiltersAndSort();
        renderProducts();
      });
    });
  }

  // Search, filter, and sort combined logic
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      updateProductsByFilterAndSearch();
    });
  }
}

// Gabungkan filter kategori, sort, dan search agar tidak saling menimpa
function updateProductsByFilterAndSearch() {
  let filteredProducts = getProducts();

  // Filter kategori
  if (currentFilter !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === currentFilter,
    );
  }

  // Search
  const searchInput = document.querySelector(".search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  if (searchTerm.length > 0) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm),
    );
  }

  // Sort
  switch (currentSort) {
    case "newest":
      filteredProducts.sort((a, b) => b.id - a.id);
      break;
    case "price-low":
      filteredProducts.sort(
        (a, b) => getLowestProductPrice(a) - getLowestProductPrice(b),
      );
      break;
    case "price-high":
      filteredProducts.sort(
        (a, b) => getLowestProductPrice(b) - getLowestProductPrice(a),
      );
      break;
    case "popular":
    default:
      filteredProducts.sort((a, b) => b.sold - a.sold);
      break;
  }

  currentProducts = filteredProducts;
  displayedCount = 8;
  renderProducts();
}

// Theme management
function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);

  // Update theme label
  const themeLabel = document.querySelector(".theme-label");
  if (themeLabel) {
    themeLabel.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
  }
}
