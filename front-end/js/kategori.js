// DOM Elements
const categoryHero = document.getElementById("categoryHero");
const categoryIcon = document.getElementById("categoryIcon");
const currentCategory = document.getElementById("currentCategory");
const categoryName = document.getElementById("categoryName");
const categoryDescription = document.getElementById("categoryDescription");
const categoryStats = document.getElementById("categoryStats");
const productsContainer = document.getElementById("productsContainer");
const productsCount = document.getElementById("productsCount");
const productsCountTitle = document.getElementById("productsCountTitle");
const categoryLoadMoreBtn = document.getElementById("categoryLoadMoreBtn");
const categoryEmptyState = document.getElementById("categoryEmptyState");
const relatedCategories = document.getElementById("relatedCategories");
const popularCategories = document.getElementById("popularCategories");
const featuredProductsGrid = document.getElementById("featuredProductsGrid");
const categoryFaq = document.getElementById("categoryFaq");
const priceRange = document.getElementById("priceRange");
const maxPrice = document.getElementById("maxPrice");
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetCategoryFiltersBtn = document.getElementById(
  "resetCategoryFiltersBtn",
);
const viewButtons = document.querySelectorAll(".view-btn");
const categorySearch = document.getElementById("categorySearch");
const backToTop = document.getElementById("backToTop");
const themeToggle = document.getElementById("themeToggle");

// State
let currentProducts = [];
let displayedCount = 12;
let currentView = "grid";
let currentCategoryParam = "";
let filters = {
  maxPrice: 500000,
  status: "all",
  sort: "popular",
};

// Category Icons mapping - DIUBAH SESUAI DATA.JS
const categoryIcons = {
  "Aplikasi Premium": "fas fa-diamond",
  Discord: "fab fa-discord",
  Jasa: "fas fa-tools",
  Template: "fas fa-paint-brush",
  Software: "fas fa-desktop",
  "E-Book": "fas fa-book",
  Course: "fas fa-graduation-cap",
};

// Category Descriptions - DIUBAH SESUAI DATA.JS
const categoryDescriptions = {
  "Aplikasi Premium":
    "Akses berbagai aplikasi premium dengan harga terjangkau. Nikmati fitur lengkap tanpa batas.",
  Discord: "Server Discord premium, bot, dan berbagai layanan Discord lainnya.",
  Jasa: "Layanan jasa digital profesional untuk berbagai kebutuhan.",
  Template:
    "Template desain siap pakai untuk website, presentasi, dan dokumen.",
  Software: "Software original dengan lisensi resmi untuk produktivitas.",
  "E-Book": "Buku digital berkualitas untuk pembelajaran dan hiburan.",
  Course: "Kursus online lengkap dengan materi terstruktur.",
};

// Category FAQ - DIUBAH SESUAI DATA.JS
const categoryFAQ = {
  "Aplikasi Premium": [
    {
      question: "Berapa lama masa aktif akun aplikasi premium?",
      answer:
        "Masa aktif bervariasi tergantung produk, mulai dari 1 bulan hingga lifetime. Info lengkap ada di deskripsi produk.",
    },
    {
      question: "Apakah bisa digunakan di beberapa device?",
      answer:
        "Ya, sebagian besar produk aplikasi premium mendukung multiple device. Jumlah maksimal device tergantung produk.",
    },
    {
      question: "Bagaimana cara aktivasi akun?",
      answer:
        "Setelah pembelian, Anda akan mendapatkan panduan aktivasi lengkap via email atau chat support.",
    },
  ],
  Discord: [
    {
      question: "Apa saja yang termasuk dalam produk Discord?",
      answer:
        "Produk Discord meliputi server premium, bot custom, template server, dan layanan setup.",
    },
  ],
  Jasa: [
    {
      question: "Berapa lama pengerjaan jasa?",
      answer:
        "Waktu pengerjaan bervariasi tergantung kompleksitas, mulai dari 1 hari hingga 1 minggu.",
    },
  ],
  Default: [
    {
      question: "Bagaimana cara membeli produk?",
      answer:
        'Klik tombol "Beli Sekarang" pada produk yang diinginkan, lalu ikuti instruksi pembelian.',
    },
    {
      question: "Apakah produk bergaransi?",
      answer:
        "Ya, semua produk dilengkapi garansi sesuai ketentuan masing-masing produk.",
    },
    {
      question: "Berapa lama proses pengiriman?",
      answer:
        "Produk digital dikirim secara instan setelah pembayaran dikonfirmasi.",
    },
  ],
};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  console.log("kategori.js loaded");

  // Get category from URL
  const urlParams = new URLSearchParams(window.location.search);
  currentCategoryParam = urlParams.get("category");

  console.log("URL Category Param:", currentCategoryParam);

  // Jika tidak ada kategori, tampilkan semua produk
  if (!currentCategoryParam) {
    currentCategoryParam = "all";
  }

  // Load category page
  loadCategoryPage();

  // Setup event listeners
  setupEventListeners();

  // Check saved theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
  themeToggle.checked = savedTheme === "light";
});

function loadCategoryPage() {
  console.log("Loading category page for:", currentCategoryParam);

  // Update page title
  document.getElementById("categoryTitle").textContent =
    `${currentCategoryParam === "all" ? "Semua Produk" : currentCategoryParam} | GuluuStore`;

  // Update category info
  updateCategoryInfo();

  // Load products
  loadCategoryProducts();

  // Load related categories
  loadRelatedCategories();

  // Load popular categories
  loadPopularCategories();

  // Load featured products
  loadFeaturedProducts();

  // Load FAQ
  loadCategoryFAQ();
}

function updateCategoryInfo() {
  console.log("Updating category info for:", currentCategoryParam);

  // Set category name
  const displayCategory =
    currentCategoryParam === "all" ? "Semua Produk" : currentCategoryParam;
  currentCategory.textContent = displayCategory;
  categoryName.textContent = displayCategory;

  // Set icon
  const iconClass = categoryIcons[currentCategoryParam] || "fas fa-th-large";
  categoryIcon.innerHTML = `<i class="${iconClass}"></i>`;

  // Set description
  const description =
    categoryDescriptions[currentCategoryParam] ||
    "Koleksi produk digital terbaik untuk kategori ini. Temukan produk yang Anda butuhkan dengan harga terjangkau.";
  categoryDescription.textContent = description;

  // Update hero background based on category
  updateCategoryHero();
}

function updateCategoryHero() {
  const gradients = {
    "Aplikasi Premium":
      "linear-gradient(135deg, rgba(229, 9, 20, 0.1), rgba(0, 217, 255, 0.1))",
    Discord:
      "linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(114, 137, 218, 0.1))",
    Jasa: "linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 87, 34, 0.1))",
    Template:
      "linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(103, 58, 183, 0.1))",
    Software:
      "linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(66, 165, 245, 0.1))",
    Default:
      "linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 255, 136, 0.1))",
  };

  const gradient = gradients[currentCategoryParam] || gradients["Default"];
  categoryHero.style.background = gradient;
}

function loadCategoryProducts() {
  console.log("Loading products for category:", currentCategoryParam);

  let products;

  // Jika tidak ada kategori (atau kategori = 'all'), tampilkan semua produk
  if (!currentCategoryParam || currentCategoryParam === "all") {
    products = getProducts();
    console.log("Loading ALL products, count:", products.length);
  } else {
    products = getProductsByCategory(currentCategoryParam);
    console.log(
      `Loading products for category "${currentCategoryParam}", count:`,
      products.length,
    );
  }

  // Cek jika produk kosong
  if (!products || products.length === 0) {
    console.log("No products found");
    productsContainer.style.display = "none";
    categoryEmptyState.style.display = "block";
    categoryLoadMoreBtn.style.display = "none";

    // Update stats dengan 0
    const statNumbers = categoryStats.querySelectorAll(".stat-number");
    statNumbers.forEach((stat) => (stat.textContent = "0"));

    // Update judul produk
    productsCount.textContent = "0";
    productsCountTitle.textContent = `Produk (${0})`;

    return;
  }

  // Apply current filters
  products = applyCategoryFilters(products);

  currentProducts = products;
  displayedCount = 12;

  renderCategoryProducts();
  updateCategoryStats();
}

function applyCategoryFilters(products) {
  let filtered = [...products];

  // Filter by price
  filtered = filtered.filter((product) => {
    // Gunakan harga terendah jika ada variant
    const productPrice =
      product.hasVariants && product.variants.length > 0
        ? Math.min(...product.variants.map((v) => v.price))
        : product.price;
    return productPrice <= filters.maxPrice;
  });

  // Filter by status
  if (filters.status !== "all") {
    filtered = filtered.filter((product) => product.status === filters.status);
  }

  // Sort products
  switch (filters.sort) {
    case "newest":
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "price-low":
      filtered.sort((a, b) => {
        const priceA =
          a.hasVariants && a.variants.length > 0
            ? Math.min(...a.variants.map((v) => v.price))
            : a.price;
        const priceB =
          b.hasVariants && b.variants.length > 0
            ? Math.min(...b.variants.map((v) => v.price))
            : b.price;
        return priceA - priceB;
      });
      break;
    case "price-high":
      filtered.sort((a, b) => {
        const priceA =
          a.hasVariants && a.variants.length > 0
            ? Math.max(...a.variants.map((v) => v.price))
            : a.price;
        const priceB =
          b.hasVariants && b.variants.length > 0
            ? Math.max(...b.variants.map((v) => v.price))
            : b.price;
        return priceB - priceA;
      });
      break;
    case "sold":
      filtered.sort((a, b) => b.sold - a.sold);
      break;
    case "popular":
    default:
      filtered.sort(
        (a, b) => b.rating * 100 + b.sold - (a.rating * 100 + a.sold),
      );
      break;
  }

  return filtered;
}

function renderCategoryProducts() {
  const productsToShow = currentProducts.slice(0, displayedCount);
  console.log(`Rendering ${productsToShow.length} products`);

  if (productsToShow.length === 0) {
    productsContainer.style.display = "none";
    categoryEmptyState.style.display = "block";
    categoryLoadMoreBtn.style.display = "none";
    return;
  }

  productsContainer.style.display = "block";
  categoryEmptyState.style.display = "none";

  // Clear container
  productsContainer.innerHTML = "";

  // Set view class
  productsContainer.className = `products-container ${currentView}-view`;

  productsToShow.forEach((product, index) => {
    const productCard = createCategoryProductCard(product);
    productCard.style.animationDelay = `${index * 0.1}s`;
    productsContainer.appendChild(productCard);
  });

  // Update count
  productsCount.textContent = currentProducts.length;
  const displayCategory =
    currentCategoryParam === "all" ? "Semua" : currentCategoryParam;
  productsCountTitle.textContent = `Produk ${displayCategory} (${currentProducts.length})`;

  // Show/hide load more button
  categoryLoadMoreBtn.style.display =
    displayedCount >= currentProducts.length ? "none" : "block";
}

function createCategoryProductCard(product) {
  const card = document.createElement("div");
  card.className = `product-card ${currentView}-view`;
  card.setAttribute("data-id", product.id);

  const badgeClass = product.status === "ready" ? "badge-ready" : "badge-sold";
  const badgeText = product.status === "ready" ? "Ready" : "Habis";
  const stockText =
    product.status === "ready"
      ? `${product.hasVariants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock} tersedia`
      : "Stok habis";
  const iconClass = product.icon || "fas fa-box";

  // Hitung harga terendah untuk tampilan
  const lowestPrice =
    product.hasVariants && product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : product.price;

  // Hitung original price untuk diskon
  const originalPrice = product.originalPrice || lowestPrice * 3;
  const discountPercentage = Math.round(
    (1 - lowestPrice / originalPrice) * 100,
  );

  if (currentView === "grid") {
    card.innerHTML = `
            <div class="product-badge ${badgeClass}">${badgeText}</div>
            <div class="product-image">
                <i class="${iconClass}"></i>
            </div>
            <div class="product-content">
                <div class="product-category">
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
                    <button class="detail-btn" data-id="${product.id}">
                        <i class="fas fa-eye"></i>
                        Lihat Detail
                    </button>
                </div>
            </div>
        `;
  } else {
    // List view
    const featuresHTML =
      product.features && product.features.length > 0
        ? product.features
            .slice(0, 3)
            .map(
              (feature) => `
            <span class="feature-tag">
                <i class="fas fa-check"></i>
                ${feature}
            </span>
          `,
            )
            .join("")
        : '<span class="feature-tag"><i class="fas fa-info-circle"></i> Tidak ada fitur spesifik</span>';

    card.innerHTML = `
            <div class="product-image">
                <i class="${iconClass}"></i>
            </div>
            <div class="product-content">
                <div class="product-header">
                    <div class="product-category">
                        <i class="fas fa-tag"></i>
                        ${product.category}
                    </div>
                    <div class="product-badge ${badgeClass}">${badgeText}</div>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-features">
                    ${featuresHTML}
                </div>
            </div>
            <div class="product-footer">
                <div class="product-price-info">
                    <div class="price-main">Rp ${lowestPrice.toLocaleString("id-ID")}</div>
                    <div class="price-original">Rp ${originalPrice.toLocaleString("id-ID")}</div>
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
                    <span class="meta-item">
                        <i class="fas fa-box"></i>
                        ${product.hasVariants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : product.stock} stok
                    </span>
                </div>
                <button class="detail-btn" data-id="${product.id}">
                    <i class="fas fa-eye"></i>
                    Detail
                </button>
            </div>
        `;
  }

  // Add click event
  const detailBtn = card.querySelector(".detail-btn");
  detailBtn.addEventListener("click", () => {
    window.location.href = `produk.html?id=${product.id}`;
  });

  return card;
}

function updateCategoryStats() {
  const products =
    currentCategoryParam === "all"
      ? getProducts()
      : getProductsByCategory(currentCategoryParam);

  const readyProducts = products.filter((p) => p.status === "ready").length;
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);

  // Update stats display
  const statNumbers = categoryStats.querySelectorAll(".stat-number");
  if (statNumbers.length >= 3) {
    statNumbers[0].textContent = products.length;
    statNumbers[1].textContent = readyProducts;
    statNumbers[2].textContent = totalSold.toLocaleString("id-ID");
  }
}

function loadRelatedCategories() {
  const categories = getCategories();
  const related = categories
    .filter((cat) => cat !== currentCategoryParam)
    .slice(0, 5);

  const relatedList = document.querySelector(".related-categories-list");
  if (!relatedList) return;

  relatedList.innerHTML = "";

  related.forEach((category) => {
    const iconClass = categoryIcons[category] || "fas fa-tag";
    const link = document.createElement("a");
    link.href = `kategori.html?category=${encodeURIComponent(category)}`;
    link.className = "related-category-link";
    link.innerHTML = `
            <i class="${iconClass}"></i>
            ${category}
        `;
    relatedList.appendChild(link);
  });
}

function loadPopularCategories() {
  const popularList = document.getElementById("popularCategories");
  if (!popularList) return;

  const categories = getCategories();
  popularList.innerHTML = "";

  // Get top 5 categories by product count
  const categoryCounts = categories
    .map((category) => {
      const products = getProductsByCategory(category);
      return {
        category,
        count: products.length,
        icon: categoryIcons[category] || "fas fa-tag",
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  categoryCounts.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <a href="kategori.html?category=${encodeURIComponent(item.category)}">
                <i class="${item.icon}"></i>
                ${item.category}
            </a>
        `;
    popularList.appendChild(li);
  });
}

function loadFeaturedProducts() {
  let products;

  if (currentCategoryParam === "all") {
    products = getProducts();
  } else {
    products = getProductsByCategory(currentCategoryParam);
  }

  // Get top 4 products by sales
  const featured = [...products]
    .filter((p) => p.status === "ready")
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  featuredProductsGrid.innerHTML = "";

  if (featured.length === 0) {
    featuredProductsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-star fa-3x"></i>
        <h3>Belum ada produk unggulan</h3>
        <p>Produk akan segera tersedia</p>
      </div>
    `;
    return;
  }

  featured.forEach((product) => {
    // Hitung harga terendah
    const lowestPrice =
      product.hasVariants && product.variants.length > 0
        ? Math.min(...product.variants.map((v) => v.price))
        : product.price;

    const card = document.createElement("div");
    card.className = "featured-product-card";
    card.innerHTML = `
            <div class="featured-product-icon">
                <i class="${product.icon || "fas fa-star"}"></i>
            </div>
            <div class="featured-product-info">
                <h4>${product.name}</h4>
                <div class="price">Rp ${lowestPrice.toLocaleString("id-ID")}</div>
                <div class="featured-meta">
                    <span><i class="fas fa-shopping-cart"></i> ${product.sold} terjual</span>
                </div>
            </div>
            <button class="detail-btn small" data-id="${product.id}">
                <i class="fas fa-eye"></i>
            </button>
        `;

    const detailBtn = card.querySelector(".detail-btn");
    detailBtn.addEventListener("click", () => {
      window.location.href = `produk.html?id=${product.id}`;
    });

    featuredProductsGrid.appendChild(card);
  });
}

function loadCategoryFAQ() {
  const faqData = categoryFAQ[currentCategoryParam] || categoryFAQ["Default"];

  categoryFaq.innerHTML = "";

  faqData.forEach((item, index) => {
    const faqItem = document.createElement("div");
    faqItem.className = "faq-item";
    faqItem.innerHTML = `
            <div class="faq-question">
                ${item.question}
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                ${item.answer}
            </div>
        `;

    faqItem.addEventListener("click", () => {
      faqItem.classList.toggle("active");
    });

    categoryFaq.appendChild(faqItem);
  });
}

function setupEventListeners() {
  // Price range slider
  if (priceRange) {
    priceRange.addEventListener("input", function () {
      const value = parseInt(this.value);
      maxPrice.textContent = `Rp ${value.toLocaleString("id-ID")}`;
      filters.maxPrice = value;
      displayedCount = 12;
      loadCategoryProducts();
    });
  }

  // Status filter
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      filters.status = this.value;
      displayedCount = 12;
      loadCategoryProducts();
    });
  }

  // Sort filter
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      filters.sort = this.value;
      displayedCount = 12;
      loadCategoryProducts();
    });
  }

  // Apply filters button
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", function () {
      displayedCount = 12;
      loadCategoryProducts();
      showToast("Filter berhasil diterapkan");
    });
  }

  // Reset filters button
  if (resetCategoryFiltersBtn) {
    resetCategoryFiltersBtn.addEventListener("click", function () {
      filters = {
        maxPrice: 500000,
        status: "all",
        sort: "popular",
      };

      priceRange.value = 500000;
      maxPrice.textContent = "Rp 500.000";
      statusFilter.value = "all";
      sortFilter.value = "popular";

      displayedCount = 12;
      loadCategoryProducts();
      showToast("Filter direset");
    });
  }

  // View toggle buttons
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const view = this.getAttribute("data-view");
      currentView = view;

      // Update active button
      viewButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Re-render products
      renderCategoryProducts();
    });
  });

  // Load more button
  if (categoryLoadMoreBtn) {
    categoryLoadMoreBtn.addEventListener("click", function () {
      displayedCount += 12;
      renderCategoryProducts();

      // Scroll to newly loaded products
      const newProducts = productsContainer.children;
      if (newProducts.length > 0) {
        newProducts[newProducts.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }

  // Search functionality
  if (categorySearch) {
    categorySearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      let products;
      if (currentCategoryParam === "all") {
        products = getProducts();
      } else {
        products = getProductsByCategory(currentCategoryParam);
      }

      if (searchTerm.length > 0) {
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm),
        );
      }

      currentProducts = applyCategoryFilters(products);
      displayedCount = 12;
      renderCategoryProducts();
    });
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      const theme = this.checked ? "light" : "dark";
      setTheme(theme);
      localStorage.setItem("theme", theme);
    });
  }

  // Back to top button
  if (backToTop) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 300) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // FAQ toggle
  document.addEventListener("click", function (e) {
    if (e.target.closest(".faq-question")) {
      const faqItem = e.target.closest(".faq-item");
      faqItem.classList.toggle("active");
    }
  });
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);

  // Update theme label
  const themeLabel = document.querySelector(".theme-label");
  if (themeLabel) {
    themeLabel.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
  }
}

function showToast(message) {
  // Create toast if doesn't exist
  let toast = document.getElementById("categoryToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "categoryToast";
    toast.className = "toast";
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
