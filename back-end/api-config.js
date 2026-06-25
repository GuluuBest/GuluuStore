const API_CONFIG = {
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://guluustore.onrender.com"
      : "http://127.0.0.1:3000",
  endpoints: {
    login: "/auth/login",
    orders: "/orders",
    products: "/products",
  },
};

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

function showNotification(message, type = "info") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}
