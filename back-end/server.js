const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://192.168.100.17",
      "http://192.168.100.17:5500",
      "http://localhost",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
      "https://guluustore.onrender.com",
      "https://adminguluu.netlify.app/",
      "https://guluustore.netlify.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-auth-token",
    ],
  }),
);

app.options("*", cors());

app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (req.route) {
      const duration = Date.now() - (req._startTime || 0);
      const timestamp = new Date().toISOString();
      console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`,
      );
    }
    return originalSend.apply(this, arguments);
  };
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

app.use("/api/orders", ordersRouter);

app.get("/health", (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({
    status: "OK",
    timestamp: timestamp,
    endpoints: {
      login: "POST /api/auth/login",
      orders: {
        create: "POST /api/orders",
        getAll: "GET /api/orders",
        getOne: "GET /api/orders/:id",
        update: "PATCH /api/orders/:id",
        delete: "DELETE /api/orders/:id (admin only)",
      },
    },
  });
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] 🔐 LOGIN ATTEMPT - Username: ${username} - IP: ${ip}`,
  );

  if (!username || !password) {
    console.log(`[${timestamp}] ⚠️ Login failed: Missing username or password`);
    return res.status(400).json({
      success: false,
      error: "Username dan password harus diisi",
    });
  }

  try {
    db.loginAdmin(username, password, (err, admin) => {
      if (err) {
        console.error(
          `[${timestamp}] ❌ Database error during login:`,
          err.message,
        );
        db.logAdminActivity(
          null,
          username,
          "LOGIN_ERROR",
          { error: err.message },
          ip,
          userAgent,
        );
        return res.status(500).json({
          success: false,
          error: "Terjadi kesalahan sistem",
        });
      }

      if (!admin) {
        console.log(
          `[${timestamp}] ⚠️ LOGIN FAILED - Invalid credentials for: ${username}`,
        );
        db.logAdminActivity(
          null,
          username,
          "LOGIN_FAILED",
          { reason: "invalid_credentials" },
          ip,
          userAgent,
        );
        return res.status(401).json({
          success: false,
          error: "Username atau password salah",
        });
      }

      console.log(
        `[${timestamp}] ✅ LOGIN SUCCESS - Admin: ${admin.username} (${admin.name})`,
      );

      db.logAdminActivity(
        admin.id,
        admin.username,
        "LOGIN_SUCCESS",
        { ip: ip, userAgent: userAgent },
        ip,
        userAgent,
      );

      const tokenData = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        timestamp: Date.now(),
      };

      const token = Buffer.from(JSON.stringify(tokenData)).toString("base64");

      res.json({
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
        token: token,
        message: "Login berhasil",
      });
    });
  } catch (error) {
    console.error(`[${timestamp}] ❌ Login process error:`, error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// 404 handler
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  res.status(404).json({
    success: false,
    error: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ Server error:`, err.stack || err.message);
  res.status(500).json({
    success: false,
    error: "Terjadi kesalahan server",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Buat folder uploads jika belum ada
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log(`[${new Date().toISOString()}] 📁 Uploads folder created`);
}

app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Server running at http://localhost:${PORT}`);
  console.log(`[${timestamp}] 📁 Database: database.sqlite`);
  console.log(`[${timestamp}] 📁 Uploads folder: uploads/`);
  console.log(`[${timestamp}] 📝 Logging active`);
  console.log(`[${timestamp}] 🔐 Default admin: admin/admin123`);
  console.log(`[${timestamp}] 🔧 CORS enabled for local development`);
  console.log(`[${timestamp}] 📌 Endpoints:`);
  console.log(
    `[${timestamp}]    DELETE /api/orders/:id (delete order - admin only)`,
  );
});
