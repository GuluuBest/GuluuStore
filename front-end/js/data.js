window.GULUU_PRODUCTS = [
  {
    id: 1,
    name: "Netflix Premium",
    category: "Aplikasi Premium",
    icon: "fas fa-film",
    description: "Akun Netflix Premium dengan berbagai pilihan paket.",
    price: 35000,
    originalPrice: 189000,
    stock: 50,
    status: "ready",
    delivery: "whatsapp",
    features: [
      "No Ads",
      "Multiple Profiles",
      "Download Offline",
      "Watch Party",
    ],
    requirements: ["Email Aktif", "Koneksi Internet"],
    rating: 4.9,
    sold: 1240,
    createdAt: "2024-01-15",
    instructions: "Akun akan dikirim via WhatsApp setelah pembayaran.",
    hasVariants: true,
    variants: [
      {
        id: "netflix-private-1month",
        name: "Netflix Private 1 Bulan",
        type: "Private",
        duration: "1 Bulan",
        quality: "HD",
        price: 35000,
        stock: 15,
        description: "Akun Netflix private untuk 1 pengguna, 1 bulan",
      },
      {
        id: "netflix-sharing-1month",
        name: "Netflix Sharing 3 User",
        type: "Sharing",
        duration: "1 Bulan",
        quality: "Full HD",
        price: 45000,
        stock: 10,
        description: "Akun Netflix sharing untuk 3 pengguna, 1 bulan",
      },
      {
        id: "netflix-family-1month",
        name: "Netflix Family 6 User",
        type: "Family",
        duration: "1 Bulan",
        quality: "4K UHD",
        price: 65000,
        stock: 8,
        description: "Akun Netflix family untuk 6 pengguna, 1 bulan, 4K UHD",
      },
      {
        id: "netflix-private-3month",
        name: "Netflix Private 3 Bulan",
        type: "Private",
        duration: "3 Bulan",
        quality: "HD",
        price: 95000,
        stock: 12,
        description: "Akun Netflix private untuk 1 pengguna, 3 bulan",
      },
      {
        id: "netflix-sharing-3month",
        name: "Netflix Sharing 3 Bulan",
        type: "Sharing",
        duration: "3 Bulan",
        quality: "Full HD",
        price: 125000,
        stock: 7,
        description: "Akun Netflix sharing untuk 3 pengguna, 3 bulan",
      },
      {
        id: "netflix-family-3month",
        name: "Netflix Family 3 Bulan",
        type: "Family",
        duration: "3 Bulan",
        quality: "4K UHD",
        price: 180000,
        stock: 5,
        description: "Akun Netflix family untuk 6 pengguna, 3 bulan, 4K UHD",
      },
    ],
  },
  {
    id: 2,
    name: "Spotify Premium",
    category: "Aplikasi Premium",
    icon: "fas fa-music",
    description: "Akun Spotify Premium dengan berbagai pilihan paket.",
    price: 45000,
    originalPrice: 120000,
    stock: 30,
    status: "ready",
    delivery: "email",
    features: [
      "No Ads",
      "Offline Mode",
      "Unlimited Skips",
      "High Quality Audio",
    ],
    requirements: ["Email Valid", "Country: Indonesia"],
    rating: 4.8,
    sold: 890,
    createdAt: "2024-01-20",
    instructions: "Kirim email dan password via email.",
    hasVariants: true,
    variants: [
      {
        id: "spotify-individual-1month",
        name: "Spotify Individual 1 Bulan",
        type: "Individual",
        duration: "1 Bulan",
        price: 45000,
        stock: 10,
        description: "Akun Spotify untuk 1 pengguna, 1 bulan",
      },
      {
        id: "spotify-duo-1month",
        name: "Spotify Duo 1 Bulan",
        type: "Duo",
        duration: "1 Bulan",
        price: 65000,
        stock: 8,
        description: "Akun Spotify untuk 2 pengguna, 1 bulan",
      },
      {
        id: "spotify-family-1month",
        name: "Spotify Family 1 Bulan",
        type: "Family",
        duration: "1 Bulan",
        price: 85000,
        stock: 8,
        description: "Akun Spotify untuk 6 pengguna, 1 bulan",
      },
      {
        id: "spotify-individual-lifetime",
        name: "Spotify Individual Lifetime",
        type: "Individual",
        duration: "Lifetime",
        price: 150000,
        stock: 4,
        description: "Akun Spotify untuk 1 pengguna, lifetime",
      },
    ],
  },
];

window.PRODUCT_CATEGORIES = {
  "Aplikasi Premium": "fas fa-diamond",
  Discord: "fab fa-discord",
  Jasa: "fas fa-tools",
  Template: "fas fa-paint-brush",
  Software: "fas fa-desktop",
  "E-Book": "fas fa-book",
  Course: "fas fa-graduation-cap",
};

window.getProducts = function () {
  const adminProducts = localStorage.getItem("digitalProducts");
  if (adminProducts) {
    try {
      const parsed = JSON.parse(adminProducts);
      return [...window.GULUU_PRODUCTS, ...parsed];
    } catch (e) {
      console.error("Error parsing admin products:", e);
    }
  }
  return window.GULUU_PRODUCTS;
};

window.getProductById = function (id) {
  const products = window.getProducts();
  return products.find((product) => product.id === parseInt(id));
};

window.getProductsByCategory = function (category) {
  const products = window.getProducts();
  return products.filter((product) => product.category === category);
};

window.getCategories = function () {
  const products = window.getProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  return categories;
};

window.getFeaturedProducts = function (limit = 4) {
  const products = window.getProducts();
  return products
    .filter((p) => p.status === "ready")
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
};

window.getLowestProductPrice = function (product) {
  if (product.hasVariants && product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
};

window.orderData = {
  orders: [],
};

window.productsData = {
  products: window.GULUU_PRODUCTS,
};
