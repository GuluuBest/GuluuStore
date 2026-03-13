// API Configuration
const API_CONFIG = {
  baseURL: "https://guluustore.onrender.com", // Sesuaikan dengan IP server Anda
  endpoints: {
    login: "/auth/login",
    orders: "/orders",
    products: "/products", // Jika nanti ada endpoint products
  },
};

// Helper function untuk membuat request dengan autentikasi
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("adminToken");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { "x-auth-token": token }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      ...options,
      headers: defaultHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

// Helper untuk menampilkan notifikasi
function showNotification(message, type = "info") {
  // Gunakan fungsi showToast yang sudah ada atau buat yang baru
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}
