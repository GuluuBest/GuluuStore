// DOM Elements
const productDetail = document.getElementById("productDetail");
const relatedProducts = document.getElementById("relatedProducts");
const productCategory = document.getElementById("productCategory");
const backToTop = document.getElementById("backToTop");
const themeToggle = document.getElementById("themeToggle");

// State untuk variant yang dipilih
let selectedVariant = null;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));

  if (productId) {
    loadProductDetail(productId);
  } else {
    showError("Produk tidak ditemukan");
  }

  // Setup event listeners
  setupEventListeners();

  // Check saved theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
  if (themeToggle) {
    themeToggle.checked = savedTheme === "light";
  }
});

function loadProductDetail(productId) {
  const product = getProductById(productId);

  if (!product) {
    showError("Produk tidak ditemukan");
    return;
  }

  // Reset selected variant
  selectedVariant = null;

  renderProductDetail(product);
  loadRelatedProducts(product);
}

function renderProductDetail(product) {
  // Update breadcrumb category
  if (productCategory) {
    productCategory.textContent = product.category;
  }

  // Jika produk punya variant, gunakan variant pertama sebagai default
  if (product.hasVariants && product.variants.length > 0) {
    selectedVariant = product.variants[0];
  }

  // Hitung harga yang akan ditampilkan
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant
    ? selectedVariant.price * 3
    : product.originalPrice;

  const discountPercentage = Math.round(
    (1 - displayPrice / displayOriginalPrice) * 100,
  );

  // Buat HTML untuk variant selector jika ada
  const variantSelectorHTML = product.hasVariants
    ? createVariantSelectorHTML(product)
    : "";

  // Create product detail HTML
  const productHTML = `
    <div class="product-detail-wrapper">
      <div class="product-detail-image">
        <div class="product-image-wrapper">
          <i class="${product.icon}"></i>
          <div class="product-badge ${
            product.status === "ready" ? "badge-ready" : "badge-sold"
          }">
            ${product.status === "ready" ? "Ready" : "Habis"}
          </div>
        </div>
      </div>
      <div class="product-detail-info">
        <div class="product-meta">
          <span class="product-category-badge">
            <i class="${
              PRODUCT_CATEGORIES[product.category] || "fas fa-tag"
            }"></i>
            ${product.category}
          </span>
          <div class="product-rating">
            <i class="fas fa-star" style="color: #FFD700;"></i>
            <span>${product.rating}</span>
            <span class="rating-count">(${product.sold} terjual)</span>
          </div>
        </div>

        <h1 class="product-detail-title">${product.name}</h1>

        <p class="product-detail-description">${product.description}</p>

        ${variantSelectorHTML}

        <div class="product-detail-price">
          <div class="price-section">
            <div class="price-display">
              <span class="price-current">Rp ${displayPrice.toLocaleString(
                "id-ID",
              )}</span>
              <span class="price-original">Rp ${displayOriginalPrice.toLocaleString(
                "id-ID",
              )}</span>
              ${
                discountPercentage > 0
                  ? `<span class="discount-badge">${discountPercentage}% OFF</span>`
                  : ""
              }
            </div>
          </div>
          <p class="price-note">Harga sudah termasuk PPN</p>
        </div>

        <div class="product-features-section">
          <h3><i class="fas fa-check-circle"></i> Fitur Utama</h3>
          <ul class="features-list">
            ${product.features
              .map(
                (feature) => `
              <li>
                <i class="fas fa-check"></i>
                ${feature}
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>

        <div class="product-stock-info">
          <div class="stock-status">
            <i class="fas fa-${
              product.status === "ready" ? "check-circle" : "times-circle"
            }"
               style="color: ${
                 product.status === "ready" ? "#00ff88" : "#ff6b8b"
               };"></i>
            <span>
              ${
                product.status === "ready"
                  ? `Stok tersedia: ${
                      selectedVariant ? selectedVariant.stock : product.stock
                    } unit`
                  : "Stok habis"
              }
            </span>
          </div>
        </div>

        <div class="product-action-buttons">
          <button class="btn-buy-now" onclick="buyProduct(${product.id})">
            <i class="fas fa-shopping-cart"></i>
            Beli Sekarang
          </button>
          <button class="btn-whatsapp" onclick="contactWhatsApp(${product.id})">
            <i class="fab fa-whatsapp"></i>
            Tanya via WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;

  productDetail.innerHTML = productHTML;

  // Setup variant selector event listeners
  if (product.hasVariants) {
    setupVariantSelectors(product);
  }
}

// Fungsi untuk membuat variant selector
function createVariantSelectorHTML(product) {
  // Kelompokkan variant berdasarkan type
  const variantsByType = {};
  product.variants.forEach((variant) => {
    if (!variantsByType[variant.type]) {
      variantsByType[variant.type] = [];
    }
    variantsByType[variant.type].push(variant);
  });

  let html = "";

  // Untuk setiap type (Private, Sharing, Family, dll)
  for (const [type, variants] of Object.entries(variantsByType)) {
    html += `
      <div class="variant-section">
        <h4><i class="fas fa-layer-group"></i> ${type}</h4>
        <div class="variant-options">
          ${variants
            .map(
              (variant) => `
            <div class="variant-option ${
              selectedVariant && selectedVariant.id === variant.id
                ? "selected"
                : ""
            }"
                 data-variant-id="${variant.id}">
              <div class="variant-details">
                <div class="variant-name">${variant.duration}</div>
                ${
                  variant.quality
                    ? `<div class="variant-quality">${variant.quality}</div>`
                    : ""
                }
                <div class="variant-description">${variant.description}</div>
              </div>
              <div class="variant-price">
                <div class="price">Rp ${variant.price.toLocaleString(
                  "id-ID",
                )}</div>
                <div class="stock">Stok: ${variant.stock}</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="product-variants">
      <h3><i class="fas fa-cog"></i> Pilih Paket</h3>
      ${html}
    </div>
  `;
}

// Setup event listeners untuk variant
function setupVariantSelectors(product) {
  const variantOptions = document.querySelectorAll(".variant-option");

  variantOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove selected class from all options
      variantOptions.forEach((opt) => opt.classList.remove("selected"));

      // Add selected class to clicked option
      this.classList.add("selected");

      // Find the selected variant
      const variantId = this.getAttribute("data-variant-id");
      selectedVariant = product.variants.find((v) => v.id === variantId);

      // Update price display
      updatePriceDisplay();

      // Update stock display
      updateStockDisplay();
    });
  });
}

// Update price display ketika variant berubah
function updatePriceDisplay() {
  if (!selectedVariant) return;

  const priceCurrent = document.querySelector(".price-current");
  const priceOriginal = document.querySelector(".price-original");
  const discountBadge = document.querySelector(".discount-badge");

  if (priceCurrent) {
    priceCurrent.textContent = `Rp ${selectedVariant.price.toLocaleString(
      "id-ID",
    )}`;
  }

  // Hitung original price (misal 3x lipat)
  const originalPrice = selectedVariant.price * 3;
  if (priceOriginal) {
    priceOriginal.textContent = `Rp ${originalPrice.toLocaleString("id-ID")}`;
  }

  // Update discount
  const discountPercentage = Math.round(
    (1 - selectedVariant.price / originalPrice) * 100,
  );
  if (discountBadge) {
    discountBadge.textContent = `${discountPercentage}% OFF`;
  }
}

// Update stock display
function updateStockDisplay() {
  if (!selectedVariant) return;

  const stockStatus = document.querySelector(".stock-status span");
  if (stockStatus) {
    stockStatus.innerHTML = `Stok tersedia: <strong>${selectedVariant.stock}</strong> unit`;
  }
}

function loadRelatedProducts(currentProduct) {
  const products = getProductsByCategory(currentProduct.category)
    .filter((p) => p.id !== currentProduct.id)
    .slice(0, 4);

  if (products.length === 0) {
    relatedProducts.innerHTML = "<p>Tidak ada produk terkait</p>";
    return;
  }

  // Produk.js - Ubah struktur HTML di renderProductDetail

  // GANTI bagian ini (setelah variantSelectorHTML):
  const productHTML = `
  <div class="product-detail-wrapper">
    <div class="product-detail-image">
      <div class="product-image-wrapper">
        <i class="${product.icon}"></i>
        <div class="product-badge ${
          product.status === "ready" ? "badge-ready" : "badge-sold"
        }">
          ${product.status === "ready" ? "Ready" : "Habis"}
        </div>
      </div>
      
      <!-- PINDHAKAN FITUR UTAMA KE SINI (DI BAWAH FOTO) -->
      <div class="product-features-section image-side-features">
        <h3><i class="fas fa-check-circle"></i> Fitur Utama</h3>
        <ul class="features-list">
          ${product.features
            .map(
              (feature) => `
              <li>
                <i class="fas fa-check"></i>
                ${feature}
              </li>
            `,
            )
            .join("")}
        </ul>
      </div>
    </div>

    <div class="product-detail-info">
      <div class="product-meta">
        <span class="product-category-badge">
          <i class="${
            PRODUCT_CATEGORIES[product.category] || "fas fa-tag"
          }"></i>
          ${product.category}
        </span>
        <div class="product-rating">
          <i class="fas fa-star" style="color: #FFD700;"></i>
          <span>${product.rating}</span>
          <span class="rating-count">(${product.sold} terjual)</span>
        </div>
      </div>

      <h1 class="product-detail-title">${product.name}</h1>

      <p class="product-detail-description">${product.description}</p>

      ${variantSelectorHTML}

      <div class="product-detail-price">
        <div class="price-section">
          <div class="price-display">
            <span class="price-current">Rp ${displayPrice.toLocaleString(
              "id-ID",
            )}</span>
            <span class="price-original">Rp ${displayOriginalPrice.toLocaleString(
              "id-ID",
            )}</span>
            ${
              discountPercentage > 0
                ? `<span class="discount-badge">${discountPercentage}% OFF</span>`
                : ""
            }
          </div>
        </div>
        <p class="price-note">Harga sudah termasuk PPN</p>
      </div>

      <!-- HAPUS bagian product-features-section dari sini -->
      
      <div class="product-stock-info">
        <div class="stock-status">
          <i class="fas fa-${
            product.status === "ready" ? "check-circle" : "times-circle"
          }"
             style="color: ${
               product.status === "ready" ? "#00ff88" : "#ff6b8b"
             };"></i>
          <span>
            ${
              product.status === "ready"
                ? `Stok tersedia: ${
                    selectedVariant ? selectedVariant.stock : product.stock
                  } unit`
                : "Stok habis"
            }
          </span>
        </div>
      </div>

      <div class="product-action-buttons">
        <button class="btn-buy-now" onclick="buyProduct(${product.id})">
          <i class="fas fa-shopping-cart"></i>
          Beli Sekarang
        </button>
        <button class="btn-whatsapp" onclick="contactWhatsApp(${product.id})">
          <i class="fab fa-whatsapp"></i>
          Tanya via WhatsApp
        </button>
      </div>
    </div>
  </div>
`;
}

function showError(message) {
  productDetail.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-circle fa-3x"></i>
      <h3>${message}</h3>
      <a href="index.html" class="back-btn">Kembali ke Beranda</a>
    </div>
  `;
}

// Update buyProduct function untuk include variant
function buyProduct(productId) {
  const product = getProductById(productId);
  if (product) {
    let url = `checkout.html?id=${product.id}`;
    if (product.hasVariants && selectedVariant) {
      url += `&variant=${encodeURIComponent(selectedVariant.id)}`;
    }
    window.location.href = url;
  }
}

// Update contactWhatsApp function untuk include variant
function contactWhatsApp(productId) {
  const product = getProductById(productId);
  if (product) {
    const phone = "6285793903739";
    let productName = product.name;
    let variantInfo = "";

    if (product.hasVariants && selectedVariant) {
      productName = selectedVariant.name;
      variantInfo = ` (Paket: ${selectedVariant.type} - ${selectedVariant.duration})`;
    }

    const message = `Halo, saya tertarik dengan produk: ${productName}${variantInfo} (ID: ${product.id})`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }
}

function setupEventListeners() {
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
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);

  // Update theme label
  const themeLabel = document.querySelector(".theme-label");
  if (themeLabel) {
    themeLabel.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
  }
}

// Make buy functions globally available
window.buyProduct = buyProduct;
window.contactWhatsApp = contactWhatsApp;
