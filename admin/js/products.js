// Products Management System with Backend Integration
document.addEventListener("DOMContentLoaded", function () {
  console.log("🛍️ Products Management Initializing...");

  // Check authentication first
  if (typeof checkAuthStatus === 'function') {
    checkAuthStatus();
  }

  // Initialize products system
  initProducts();

  // Initialize event listeners
  initProductEventListeners();

  // Load products data from backend
  loadProductsFromBackend();

  // Load categories
  loadCategories();
});

// API Functions for Products
async function loadProductsFromBackend() {
  console.log("📦 Loading products from backend...");
  
  try {
    // Try to load from backend first
    const response = await apiRequest('/products', {
      method: 'GET'
    });
    
    if (response.success && response.data) {
      productsData.products = response.data;
      console.log(`✅ Loaded ${response.data.length} products from backend`);
    } else {
      // Fallback to localStorage
      loadProductsFromLocal();
    }
  } catch (error) {
    console.log("⚠️ Backend not available, using local storage");
    loadProductsFromLocal();
  }
  
  // Update stats
  updateProductStats();

  // Render products
  renderProducts();
}

// Fallback to local storage
function loadProductsFromLocal() {
  const savedProducts = localStorage.getItem("guluuProducts");
  if (savedProducts) {
    productsData.products = JSON.parse(savedProducts);
  } else {
    generateSampleProducts();
  }
}

// Modified save function to sync with backend
async function saveProducts() {
  // Always save to localStorage as backup
  localStorage.setItem("guluuProducts", JSON.stringify(productsData.products));
  
  // Try to sync with backend
  try {
    await apiRequest('/products/sync', {
      method: 'POST',
      body: JSON.stringify({ products: productsData.products })
    });
    console.log("✅ Products synced with backend");
  } catch (error) {
    console.log("⚠️ Backend sync failed, saved locally only");
  }
}

// Modified handleAddProduct to use backend
async function handleAddProduct(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const productData = {
    id: generateProductId(),
    name: formData.get("productName"),
    sku: formData.get("productSKU"),
    categoryId: parseInt(formData.get("productCategory")),
    brand: formData.get("productBrand"),
    price: parseInt(formData.get("productPrice")),
    stock: parseInt(formData.get("productStock")),
    description: formData.get("productDescription"),
    image: document.getElementById("imagePreview").querySelector("img")?.src || null,
    status: formData.get("productStatus") ? "active" : "inactive",
    featured: formData.get("productFeatured") === "on",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  // Validate required fields
  if (!productData.name || !productData.sku || !productData.categoryId || !productData.price || productData.stock < 0) {
    showToast("Harap isi semua field yang wajib diisi", "error");
    return;
  }

  try {
    // Try to save to backend first
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    
    if (response.success) {
      // Use backend-generated ID if available
      if (response.data && response.data.id) {
        productData.id = response.data.id;
      }
    }
  } catch (error) {
    console.log("⚠️ Backend save failed, saving locally only");
  }

  // Add product to local data
  productsData.products.unshift(productData);

  // Save to localStorage
  saveProducts();

  // Close modal and reset form
  document.getElementById("addProductModal").classList.remove("active");
  resetAddProductForm();

  // Update UI
  renderProducts();
  updateProductStats();

  // Show success message
  showToast("Produk berhasil ditambahkan!", "success");

  console.log("✅ Product added:", productData);
}

// Modified updateProduct to use backend
async function updateProduct(productId) {
  const productIndex = productsData.products.findIndex(p => p.id === productId);
  if (productIndex === -1) return;

  const formData = new FormData(document.getElementById("editProductForm"));

  const updatedProduct = {
    ...productsData.products[productIndex],
    name: formData.get("productName"),
    sku: formData.get("productSKU"),
    categoryId: parseInt(formData.get("productCategory")),
    brand: formData.get("productBrand"),
    price: parseInt(formData.get("productPrice")),
    stock: parseInt(formData.get("productStock")),
    description: formData.get("productDescription"),
    status: formData.get("productStatus") ? "active" : "inactive",
    featured: formData.get("productFeatured") === "on",
    updatedAt: new Date().toISOString().split("T")[0],
  };

  try {
    // Try to update in backend
    await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct)
    });
    console.log("✅ Product updated in backend");
  } catch (error) {
    console.log("⚠️ Backend update failed, updating locally only");
  }

  // Update local data
  productsData.products[productIndex] = updatedProduct;

  // Save to localStorage
  saveProducts();

  // Close modal
  document.getElementById("editProductModal").classList.remove("active");

  // Update UI
  renderProducts();
  updateProductStats();

  // Show success message
  showToast("Produk berhasil diperbarui!", "success");

  console.log("✅ Product updated:", updatedProduct);
}

// Modified deleteProduct to use backend
async function deleteProduct(productId) {
  const productIndex = productsData.products.findIndex(p => p.id === productId);
  if (productIndex === -1) return;

  try {
    // Try to delete from backend
    await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
    console.log("✅ Product deleted from backend");
  } catch (error) {
    console.log("⚠️ Backend deletion failed, removing locally only");
  }

  // Remove from local data
  productsData.products.splice(productIndex, 1);

  // Save to localStorage
  saveProducts();

  // Close modal
  document.getElementById("deleteProductModal").classList.remove("active");

  // Update UI
  renderProducts();
  updateProductStats();

  // Show success message
  showToast("Produk berhasil dihapus!", "success");

  console.log("🗑️ Product deleted:", productId);
}

// Add logout functionality to products page
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof logout === 'function') {
        logout();
      }
    });
  }
});